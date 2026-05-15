/**
 * MyRuta Web - ETA Service
 * 
 * Integrates with:
 * - Google Routes API for real-time ETAs
 * - Predictor backend (if available)
 * - Firestore historical data
 * 
 * Features:
 * - Calculate ETA using current traffic
 * - Predict arrival time for all buses
 * - Update ETAs every 60 seconds
 * - Fallback to historical averages
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * Historical averages for routes (fallback when API unavailable)
 * In production, these would come from database
 */
const HISTORICAL_AVERAGES = {
  ruta_001: { avg_time: 45, std_dev: 5 },
  ruta_002: { avg_time: 28, std_dev: 4 },
  ruta_003: { avg_time: 52, std_dev: 6 }
}

/**
 * Calculate ETA using Google Routes API
 * @param {Object} busLocation - Current bus location { lat, lng }
 * @param {Array} waypoints - Route waypoints [{ lat, lng }, ...]
 * @returns {Promise<Object>} ETA details { duration_minutes, estimated_arrival }
 */
export async function calculateETAGoogle(busLocation, waypoints) {
  if (!busLocation || !waypoints || waypoints.length === 0) {
    return null
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured')
    return null
  }

  try {
    // Use last waypoint as destination
    const destination = waypoints[waypoints.length - 1]

    const response = await axios.post(
      `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`,
      {
        origin: {
          location: {
            latLng: {
              latitude: busLocation.lat,
              longitude: busLocation.lng
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng
            }
          }
        },
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: new Date().toISOString(),
        computeAlternativeRoutes: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY
        }
      }
    )

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]
      let totalSeconds = 0

      // Sum up all leg durations
      if (route.legs && route.legs.length > 0) {
        route.legs.forEach((leg) => {
          if (leg.duration) {
            const seconds = parseInt(leg.duration.replace('s', ''), 10)
            totalSeconds += seconds
          }
        })
      }

      const durationMinutes = Math.ceil(totalSeconds / 60)
      const estimatedArrival = new Date(Date.now() + totalSeconds * 1000)

      return {
        duration_minutes: durationMinutes,
        estimated_arrival: estimatedArrival,
        source: 'GOOGLE_ROUTES_API'
      }
    }

    return null
  } catch (error) {
    console.error('Error calculating ETA with Google Routes:', error.message)
    return null
  }
}

/**
 * Calculate ETA using backend predictor service
 * @param {Object} busData - Bus information
 * @param {Array} waypoints - Route waypoints
 * @returns {Promise<Object>} ETA details
 */
export async function calculateETAPredictor(busData, waypoints) {
  if (!busData || !waypoints || waypoints.length === 0) {
    return null
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/predictions/eta`, {
      bus_id: busData.id,
      placa: busData.placa,
      current_location: {
        lat: busData.lat,
        lng: busData.lng
      },
      route_id: busData.rutaAsignada,
      waypoints: waypoints,
      current_speed: busData.velocidad || 40
    })

    if (response.data && response.data.eta_minutes) {
      return {
        duration_minutes: response.data.eta_minutes,
        estimated_arrival: new Date(response.data.estimated_arrival_time),
        confidence: response.data.confidence,
        source: 'PREDICTOR_API'
      }
    }

    return null
  } catch (error) {
    console.warn('Predictor API unavailable, falling back to Google Routes or historical data')
    return null
  }
}

/**
 * Get ETA with fallback chain: Google Routes -> Predictor -> Historical Average
 * @param {Object} busData - Bus information
 * @param {Array} waypoints - Route waypoints
 * @returns {Promise<Object>} ETA details
 */
export async function getETA(busData, waypoints) {
  if (!busData || !waypoints || waypoints.length === 0) {
    return null
  }

  // Try Google Routes API first (most accurate with current traffic)
  let eta = await calculateETAGoogle(busData, waypoints)
  if (eta) {
    return eta
  }

  // Fallback to predictor if available
  eta = await calculateETAPredictor(busData, waypoints)
  if (eta) {
    return eta
  }

  // Last resort: use historical average
  const historicalData = HISTORICAL_AVERAGES[busData.rutaAsignada]
  if (historicalData) {
    const estimatedArrival = new Date(Date.now() + historicalData.avg_time * 60 * 1000)
    return {
      duration_minutes: historicalData.avg_time,
      estimated_arrival: estimatedArrival,
      source: 'HISTORICAL_AVERAGE'
    }
  }

  return null
}

/**
 * Get ETAs for multiple buses in a route
 * @param {Array} buses - Array of bus objects
 * @param {Array} waypoints - Route waypoints
 * @returns {Promise<Object>} Map of bus_id -> ETA
 */
export async function getBusesETAs(buses, waypoints) {
  if (!buses || buses.length === 0 || !waypoints) {
    return {}
  }

  const etaPromises = buses.map((bus) =>
    getETA(bus, waypoints).then((eta) => ({
      bus_id: bus.id,
      placa: bus.placa,
      eta
    }))
  )

  const etaResults = await Promise.all(etaPromises)

  return Object.fromEntries(
    etaResults.map((result) => [result.bus_id, result])
  )
}

/**
 * Format ETA for display
 * @param {Object} eta - ETA object from getETA()
 * @returns {string} Formatted string (e.g., "45 min - 14:30")
 */
export function formatETA(eta) {
  if (!eta) return 'N/A'

  const time = new Date(eta.estimated_arrival)
  const timeStr = time.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${eta.duration_minutes} min - ${timeStr}`
}

/**
 * Setup ETA polling for all buses in a route
 * Updates every 60 seconds
 * @param {Array} buses - Array of bus objects
 * @param {Array} waypoints - Route waypoints
 * @param {Function} onUpdate - Callback when ETAs update
 * @returns {Function} Cleanup function
 */
export function subscribeToETAs(buses, waypoints, onUpdate) {
  // Initial update
  getBusesETAs(buses, waypoints).then(onUpdate)

  // Poll every 60 seconds
  const interval = setInterval(() => {
    getBusesETAs(buses, waypoints).then(onUpdate)
  }, 60000)

  // Return cleanup function
  return () => clearInterval(interval)
}

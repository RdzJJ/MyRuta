/**
 * MyRuta Web - Routes Service
 * 
 * Responsibilities:
 * - Wrapper for Google Routes API
 * - ETA calculations using TRAFFIC_AWARE routing
 * - Multi-bus routing matrix (find nearest bus)
 */

import axios from 'axios'

const ROUTES_API_BASE = 'https://routes.googleapis.com/directions/v2:computeRoutes'
const ROUTES_MATRIX_API = 'https://routes.googleapis.com/distancematrix/v2:computeRouteMatrix'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('VITE_GOOGLE_MAPS_API_KEY environment variable is not set')
}

/**
 * Compute route and get ETA between two points
 * Uses TRAFFIC_AWARE preference for realistic time estimates
 * @param {Object} origin - Origin coordinates { latitude, longitude }
 * @param {Object} destination - Destination coordinates { latitude, longitude }
 * @returns {Promise<Object>} Route info with duration and distance
 */
export async function computeRoute(origin, destination) {
  if (!origin || !destination) {
    throw new Error('Origin and destination are required')
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured')
  }

  try {
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude
          }
        }
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      languageCode: 'es' // Spanish language for directions
    }

    const response = await axios.post(ROUTES_API_BASE, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
      }
    })

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]
      const durationSeconds = parseInt(route.duration?.seconds || 0)
      const distanceMeters = route.distanceMeters || 0

      return {
        duration: durationSeconds,
        durationFormatted: formatDuration(durationSeconds),
        distance: distanceMeters,
        distanceFormatted: formatDistance(distanceMeters),
        raw: route
      }
    } else {
      throw new Error('No route found between origin and destination')
    }
  } catch (error) {
    console.error('Error computing route:', error)
    
    if (error.response?.status === 400) {
      throw new Error('Solicitud inválida: verifica las coordenadas')
    } else if (error.response?.status === 401) {
      throw new Error('API key inválida o no autorizada')
    } else if (error.response?.status === 403) {
      throw new Error('Acceso denegado a Routes API')
    }
    
    throw new Error('Error al calcular la ruta: ' + (error.message || 'Unknown error'))
  }
}

/**
 * Find the nearest bus among multiple buses
 * Uses route matrix to calculate distances/times from all buses to destination
 * @param {Array} buses - Array of bus locations [{latitude, longitude}, ...]
 * @param {Object} destination - Destination coordinates {latitude, longitude}
 * @returns {Promise<Object>} Nearest bus info with ETA
 */
export async function findNearestBus(buses, destination) {
  if (!buses || buses.length === 0) {
    throw new Error('At least one bus location is required')
  }

  if (!destination) {
    throw new Error('Destination is required')
  }

  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured')
  }

  try {
    const requestBody = {
      origins: buses.map((bus, idx) => ({
        waypoint: {
          location: {
            latLng: {
              latitude: bus.latitude,
              longitude: bus.longitude
            }
          }
        },
        routingPreference: 'TRAFFIC_AWARE'
      })),
      destinations: [
        {
          waypoint: {
            location: {
              latLng: {
                latitude: destination.latitude,
                longitude: destination.longitude
              }
            }
          }
        }
      ],
      travelMode: 'DRIVE'
    }

    const response = await axios.post(ROUTES_MATRIX_API, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters'
      }
    })

    if (response.data.rows && response.data.rows.length > 0) {
      // Find the row with minimum duration
      let nearestBusIndex = 0
      let minDuration = Infinity

      response.data.rows.forEach((row, idx) => {
        if (row.elements && row.elements.length > 0) {
          const element = row.elements[0]
          const durationSeconds = parseInt(element.duration?.seconds || Infinity)
          
          if (durationSeconds < minDuration) {
            minDuration = durationSeconds
            nearestBusIndex = idx
          }
        }
      })

      const selectedRow = response.data.rows[nearestBusIndex]
      const element = selectedRow.elements[0]
      const durationSeconds = parseInt(element.duration?.seconds || 0)
      const distanceMeters = element.distanceMeters || 0

      return {
        busIndex: nearestBusIndex,
        busLocation: buses[nearestBusIndex],
        eta: durationSeconds,
        etaFormatted: formatDuration(durationSeconds),
        distance: distanceMeters,
        distanceFormatted: formatDistance(distanceMeters)
      }
    } else {
      throw new Error('No route matrix data received')
    }
  } catch (error) {
    console.error('Error finding nearest bus:', error)
    throw new Error('Error al encontrar el bus más cercano: ' + (error.message || 'Unknown error'))
  }
}

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "5 min", "1h 20 min")
 */
function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return 'N/A'

  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${minutes} min`
  }
}

/**
 * Format distance in meters to readable string
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance (e.g., "2.5 km", "150 m")
 */
function formatDistance(meters) {
  if (!Number.isFinite(meters)) return 'N/A'

  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  } else {
    return `${Math.round(meters)} m`
  }
}

export default {
  computeRoute,
  findNearestBus,
  formatDuration,
  formatDistance
}

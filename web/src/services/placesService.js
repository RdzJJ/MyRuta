/**
 * MyRuta Web - Places Service
 * 
 * Responsibilities:
 * - Wrapper for Google Places API (AutocompleteSuggestion)
 * - Destination search with Medellín bias
 * - Place details fetching
 */

const MEDELLIN_BIAS = {
  lat: 6.2442,
  lng: -75.5812,
  radius: 30000 // 30km
}

const REGION_CODES = ['co'] // Colombia

let placesService = null

/**
 * Initialize Places Service
 * Loads Google Places API library and creates service instance
 */
export async function initializePlacesService() {
  if (placesService) return placesService

  return new Promise((resolve, reject) => {
    // Load Google Maps API script with Places library
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      try {
        const { AutocompleteSuggestion } = google.maps.places
        placesService = AutocompleteSuggestion
        resolve(placesService)
      } catch (error) {
        reject(new Error('Failed to initialize Places API: ' + error.message))
      }
    }
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps API script'))
    }
    document.head.appendChild(script)
  })
}

/**
 * Get autocomplete suggestions for a search input
 * @param {string} input - User search input
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getAutocompleteSuggestions(input) {
  if (!input || input.trim().length === 0) {
    return []
  }

  try {
    // Initialize Places Service if not already done
    if (!placesService) {
      await initializePlacesService()
    }

    const request = {
      input,
      locationBias: {
        center: { lat: MEDELLIN_BIAS.lat, lng: MEDELLIN_BIAS.lng },
        radius: MEDELLIN_BIAS.radius
      },
      includedRegionCodes: REGION_CODES,
      language: 'es' // Spanish for better results
    }

    const sessionToken = new google.maps.places.AutocompleteSessionToken()
    request.sessionToken = sessionToken

    const service = new google.maps.places.AutocompleteService()
    const response = await service.getPlacePredictions(request)

    return response.predictions || []
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error)
    throw new Error('Failed to fetch suggestions: ' + error.message)
  }
}

/**
 * Get detailed place information
 * @param {string} placeId - Google Places ID
 * @returns {Promise<Object>} Place details including location
 */
export async function getPlaceDetails(placeId) {
  if (!placeId) {
    throw new Error('placeId is required')
  }

  try {
    if (!placesService) {
      await initializePlacesService()
    }

    const request = {
      placeId,
      fields: ['location', 'displayName', 'formattedAddress', 'photos', 'types'],
      language: 'es'
    }

    const service = new google.maps.places.PlacesService(
      document.createElement('div') // Dummy div for service initialization
    )

    return new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            placeId,
            displayName: place.name || place.formatted_address || '',
            address: place.formatted_address || '',
            latitude: place.geometry?.location?.lat() || null,
            longitude: place.geometry?.location?.lng() || null,
            photos: place.photos?.map(photo => photo.getUrl({ maxWidth: 400, maxHeight: 400 })) || [],
            types: place.types || []
          })
        } else {
          reject(new Error(`Failed to fetch place details: ${status}`))
        }
      })
    })
  } catch (error) {
    console.error('Error fetching place details:', error)
    throw new Error('Failed to fetch place details: ' + error.message)
  }
}

/**
 * Get user's current location using geolocation API
 * @returns {Promise<Object>} User location with lat/lng
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve({
          latitude,
          longitude,
          displayName: 'Mi ubicación',
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        // Map GeolocationPositionError codes to readable messages
        const errorMessages = {
          1: 'Permiso de ubicación denegado',
          2: 'Ubicación no disponible',
          3: 'Tiempo de espera agotado'
        }
        reject(new Error(errorMessages[error.code] || 'Error al obtener ubicación'))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

export default {
  initializePlacesService,
  getAutocompleteSuggestions,
  getPlaceDetails,
  getUserLocation
}

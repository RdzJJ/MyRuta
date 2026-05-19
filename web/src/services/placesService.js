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
    const request = {
      input,
      locationBias: {
        center: { lat: MEDELLIN_BIAS.lat, lng: MEDELLIN_BIAS.lng },
        radius: MEDELLIN_BIAS.radius
      },
      includedRegionCodes: REGION_CODES,
      language: 'es' // Spanish for better results
    }

    const { AutocompleteService, AutocompleteSessionToken, PlacesServiceStatus } =
      await google.maps.importLibrary('places')

    const sessionToken = new AutocompleteSessionToken()
    request.sessionToken = sessionToken

    const service = new AutocompleteService()
    const response = await new Promise((res, rej) =>
      service.getPlacePredictions(request, (predictions, status) => {
        if (status === PlacesServiceStatus.OK) res({ predictions })
        else rej(new Error(`Autocomplete error: ${status}`))
      })
    )

    // Map predictions to ensure consistent structure with text, description, and place_id
    const predictions = (response.predictions || []).map(pred => ({
      place_id: pred.place_id,
      description: pred.description, // Full description text
      main_text: pred.main_text, // Primary text
      secondary_text: pred.secondary_text, // Secondary text (address details)
      matched_substrings: pred.matched_substrings
    }))

    return predictions
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
  if (!placeId) throw new Error('placeId is required')

  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      reject(new Error('Google Maps Places no está cargado'))
      return
    }

    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    )

    service.getDetails(
      {
        placeId,
        fields: ['geometry', 'name', 'formatted_address', 'types'],
        language: 'es'
      },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          resolve({
            placeId,
            displayName: place.name || place.formatted_address || '',
            address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            photos: [],
            types: place.types || []
          })
        } else {
          reject(new Error(`Failed to fetch place details: ${status}`))
        }
      }
    )
  })
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
  getAutocompleteSuggestions,
  getPlaceDetails,
  getUserLocation
}

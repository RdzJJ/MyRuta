/**
 * MyRuta Web - Destination Search Component
 * 
 * Features:
 * - Autocomplete search with Medellín bias
 * - "Mi ubicación" button for current location
 * - Loading and error states
 * - Selection callback
 */

import { useState, useRef, useEffect } from 'react'
import { getAutocompleteSuggestions, getPlaceDetails, getUserLocation } from '../services/placesService'

export default function DestinationSearch({ 
  onDestinationSelect = () => {},
  placeholder = 'Buscar destino en Medellín...',
  showMyLocation = true,
  className = ''
}) {
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [error, setError] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeout = useRef(null)

  // Debounced search
  const handleSearchChange = (value) => {
    setSearchInput(value)
    setError(null)

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (value.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Debounce API call by 300ms
    setShowSuggestions(true)
    setIsLoading(true)

    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await getAutocompleteSuggestions(value)
        setSuggestions(results)
      } catch (err) {
        console.error('Search error:', err)
        setError(err.message || 'Error al buscar')
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionClick = async (suggestion) => {
    setIsLoading(true)
    setError(null)

    try {
      const placeDetails = await getPlaceDetails(suggestion.place_id)
      onDestinationSelect(placeDetails)
      setSearchInput(placeDetails.displayName)
      setShowSuggestions(false)
      setSuggestions([])
    } catch (err) {
      console.error('Error fetching place details:', err)
      setError(err.message || 'Error al obtener detalles del lugar')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle "Mi ubicación" button
  const handleMyLocation = async () => {
    setIsLoadingLocation(true)
    setError(null)

    try {
      const location = await getUserLocation()
      onDestinationSelect(location)
      setSearchInput(location.displayName)
      setShowSuggestions(false)
      setSuggestions([])
    } catch (err) {
      console.error('Geolocation error:', err)
      setError(err.message || 'Error al obtener ubicación')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.destination-search-container')) {
        setShowSuggestions(false)
      }
    }

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSuggestions])

  return (
    <div className={`destination-search-container ${className}`}>
      <div className="space-y-2">
        {/* Search Input Container */}
        <div className="relative flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchInput && suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-500 transition"
              style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.1)' }}
            />
            
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin">
                  <div className="w-5 h-5 border-2 border-neon-500 border-t-transparent rounded-full" />
                </div>
              </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-dark-700 border-2 border-neon-500 rounded-lg overflow-hidden z-50" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-white hover:bg-dark-600 transition border-b border-dark-600 last:border-b-0 flex items-start gap-3"
                  >
                    <span className="text-neon-500 text-lg flex-shrink-0">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white truncate font-medium">{suggestion.main_text}</div>
                      <div className="text-gray-400 text-sm truncate">{suggestion.secondary_text}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-red-900 border-2 border-red-500 rounded-lg p-3 text-red-200 text-sm z-50">
                {error}
              </div>
            )}
          </div>

          {/* Mi ubicación Button */}
          {showMyLocation && (
            <button
              onClick={handleMyLocation}
              disabled={isLoadingLocation}
              className="px-4 py-3 bg-dark-700 border-2 border-neon-500 rounded-lg text-neon-500 hover:bg-neon-500 hover:text-dark-900 transition font-semibold disabled:opacity-50 flex items-center gap-2"
              style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.1)' }}
              title="Obtener mi ubicación actual"
            >
              {isLoadingLocation ? (
                <div className="animate-spin">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                </div>
              ) : (
                '📍'
              )}
              <span className="hidden sm:inline">Mi ubicación</span>
            </button>
          )}
        </div>

        {/* Empty state */}
        {showSuggestions && suggestions.length === 0 && !isLoading && searchInput.trim() && (
          <div className="text-center py-4 text-gray-400">
            No se encontraron resultados para "{searchInput}"
          </div>
        )}
      </div>
    </div>
  )
}

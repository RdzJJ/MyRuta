/**
 * MyRuta Web - Medellín Map Component
 * 
 * Features:
 * - Display Google Map centered on Medellín
 * - Dark theme matching UI
 * - Neon green accent markers
 * - Real-time location display
 */

import { useState, useEffect, useRef } from 'react'

const MEDELLIN_CENTER = {
  lat: 6.2442,
  lng: -75.5812
}

let googleMapsLoaded = false
let googleMapsScript = null

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#aaa' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a3d1a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212121' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#3d3d3d' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4d4d4d' }]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#3d3d3d' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1a2a3a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  }
]

export default function MedellinMap({ 
  busLocations = [], 
  selectedLocation = null,
  className = ''
}) {
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef(null)
  const destinationMarkerRef = useRef(null)

  // Load Google Maps script once globally
  useEffect(() => {
    if (googleMapsLoaded || googleMapsScript) {
      if (window.google?.maps) {
        setIsLoading(false)
      }
      return
    }

    googleMapsScript = document.createElement('script')
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    googleMapsScript.async = true
    googleMapsScript.defer = true
    googleMapsScript.onload = () => {
      googleMapsLoaded = true
      setIsLoading(false)
    }
    googleMapsScript.onerror = () => {
      console.error('Failed to load Google Maps API')
      setIsLoading(false)
    }
    document.head.appendChild(googleMapsScript)

    return () => {
      // Don't remove the script to avoid reloading
    }
  }, [])

  // Initialize map once when Google Maps is loaded
  useEffect(() => {
    if (isLoading || map) return

    const mapContainer = document.getElementById('medellin-map-container')
    if (!mapContainer || !window.google?.maps) return

    const newMap = new window.google.maps.Map(mapContainer, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false
    })

    mapRef.current = newMap
    setMap(newMap)
  }, [isLoading, map])

  // Update bus markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    // Only add markers if there are bus locations
    if (busLocations.length === 0) {
      setMarkers([])
      return
    }

    // Add bus location markers
    const newMarkers = busLocations.map((bus, idx) => {
      if (!bus.latitude && !bus.lat) return null

      const marker = new window.google.maps.Marker({
        position: {
          lat: bus.latitude || bus.lat,
          lng: bus.longitude || bus.lng
        },
        map: mapRef.current,
        title: bus.label || `Bus ${idx + 1}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#00FF41',
          fillOpacity: 0.8,
          strokeColor: '#00AA00',
          strokeWeight: 2
        }
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #00FF41; font-family: monospace; padding: 8px; background: #1a1a1a; border: 1px solid #00FF41;">
            <strong>${bus.label || `Bus ${idx + 1}`}</strong><br/>
            Lat: ${(bus.latitude || bus.lat).toFixed(4)}<br/>
            Lng: ${(bus.longitude || bus.lng).toFixed(4)}
          </div>
        `
      })

      marker.addListener('click', () => {
        // Close previous info windows
        infoWindow.open(mapRef.current, marker)
      })

      return marker
    }).filter(Boolean)

    setMarkers(newMarkers)
  }, [busLocations])

  // Add selected destination marker
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) {
      // Clean up previous marker
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null)
        destinationMarkerRef.current = null
      }
      return
    }

    // Remove previous destination marker
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null)
    }

    const destinationMarker = new window.google.maps.Marker({
      position: {
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude
      },
      map: mapRef.current,
      title: selectedLocation.displayName || 'Destination',
      icon: {
        path: 'M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0z',
        scale: 1.5,
        fillColor: '#00FF41',
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2
      }
    })

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="color: #00FF41; font-family: monospace; padding: 8px; background: #1a1a1a; border: 1px solid #00FF41;">
          <strong>Destino</strong><br/>
          ${selectedLocation.displayName}<br/>
          ${selectedLocation.address ? `${selectedLocation.address}` : ''}
        </div>
      `
    })

    infoWindow.open(mapRef.current, destinationMarker)
    destinationMarkerRef.current = destinationMarker
  }, [selectedLocation])

  return (
    <div className={`relative w-full h-96 bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden ${className}`} style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
      <div 
        id="medellin-map-container" 
        className="w-full h-full bg-dark-700"
      />
      
      {/* Map Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="w-8 h-8 border-3 border-neon-500 border-t-transparent rounded-full" />
            </div>
            <p className="text-neon-500">Cargando mapa de Medellín...</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 bg-dark-800 border border-neon-500 rounded-lg p-3 text-xs z-20" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500 font-semibold mb-2">Leyenda</p>
          <div className="space-y-1 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-500" />
              <span>Buses activos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neon-500" />
              <span>Destino</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

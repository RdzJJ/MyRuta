import { useState, useEffect, useRef } from 'react'

const MEDELLIN_CENTER = {
  lat: 6.2442,
  lng: -75.5812
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
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
    stylers: [{ color: '#ffffff' }]
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
    stylers: [{ color: '#ffffff' }]
  }
]

// ─── FIX 1: Use a Promise-based singleton to track the Maps load state ────────
// This avoids the race condition where the second useEffect runs before
// window.google.maps is available.
let mapsLoadPromise = null

function loadGoogleMaps(apiKey) {
  if (mapsLoadPromise) return mapsLoadPromise

  mapsLoadPromise = new Promise((resolve, reject) => {
    // Already loaded (e.g. hot-reload)
    if (window.google?.maps) {
      resolve()
      return
    }

    const script = document.createElement('script')
    // FIX 2: Use the recommended "loading=async" parameter and a callback
    //         instead of relying on the script's onload event, which can fire
    //         before the Maps namespace is fully initialised.
    const callbackName = '__googleMapsReady__'
    window[callbackName] = () => {
      delete window[callbackName]
      resolve()
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&loading=async&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onerror = () => {
      mapsLoadPromise = null // allow retry
      reject(new Error('Failed to load Google Maps API'))
    }
    document.head.appendChild(script)
  })

  return mapsLoadPromise
}
// ─────────────────────────────────────────────────────────────────────────────

export default function MedellinMap({
  busLocations = [],
  selectedLocation = null,
  originLocation = null,
  className = ''
}) {
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)    // stable ref to avoid stale closures
  const markersRef = useRef([])
  const destinationMarkerRef = useRef(null)
  const originMarkerRef = useRef(null)

  // ── Load Google Maps script (once, globally) ──────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setLoadError('VITE_GOOGLE_MAPS_API_KEY is not set')
      setIsLoading(false)
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => setIsLoading(false))
      .catch(err => {
        setLoadError(err.message)
        setIsLoading(false)
      })
  }, [])

  // ── Initialise the map once Maps is ready ─────────────────────────────────
  useEffect(() => {
    // FIX 3: Guard with isLoading AND verify window.google.maps before
    //         calling the constructor. Without this guard the constructor
    //         runs while the namespace is still undefined → TypeError.
    if (isLoading || loadError || mapInstanceRef.current) return
    if (!mapContainerRef.current || !window.google?.maps) return

    const newMap = new window.google.maps.Map(mapContainerRef.current, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: true
    })

    mapInstanceRef.current = newMap
    setMap(newMap) // triggers downstream effects

  }, [isLoading, loadError])
  // Real-time user location
  useEffect(() => {
    if (!mapInstanceRef.current || !navigator.geolocation) return

    let userMarker = null

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const userLatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }

        if (!userMarker) {
          userMarker = new window.google.maps.Marker({
            position: userLatLng,
            map: mapInstanceRef.current,
            title: 'Mi ubicación',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          })
        } else {
          userMarker.setPosition(userLatLng)
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      if (userMarker) userMarker.setMap(null)
    }
  }, [map]) // depende de `map` para esperar inicialización


  // ── Update bus markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    if (busLocations.length === 0) return

    const newMarkers = busLocations
      .map((bus, idx) => {
        const lat = bus.latitude ?? bus.lat
        const lng = bus.longitude ?? bus.lng
        if (lat == null || lng == null) return null

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
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

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color:#00FF41;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #00FF41;">
              <strong>${bus.label || `Bus ${idx + 1}`}</strong><br/>
              Lat: ${lat.toFixed(4)}<br/>
              Lng: ${lng.toFixed(4)}
            </div>
          `
        })

        marker.addListener('click', () =>
          infoWindow.open(mapInstanceRef.current, marker)
        )

        return marker
      })
      .filter(Boolean)

    markersRef.current = newMarkers
  }, [busLocations, map]) // depend on `map` state so we wait for initialisation

  // ── Origin + Destination marker + zoom ────────────────────────────────────────────────────
  useEffect(() => {
    // Limpiar markers anteriores
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null)
      destinationMarkerRef.current = null
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null)
      originMarkerRef.current = null
    }

    if (!selectedLocation && !originLocation) return
    if (!selectedLocation) return
    if (!mapInstanceRef.current) return

    // Pin de destino (verde neón)
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      const destMarker = new window.google.maps.Marker({
        position: { lat: Number(selectedLocation.latitude), lng: Number(selectedLocation.longitude) },
        map: mapInstanceRef.current,
        title: selectedLocation.displayName || 'Destino',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#00FF41',
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 1.5
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color:#00FF41;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #00FF41;">
            <strong>📍 Destino</strong><br/>
            ${selectedLocation.displayName}<br/>
            ${selectedLocation.address ?? ''}
          </div>
        `
      })
      infoWindow.open(mapInstanceRef.current, destMarker)
      destinationMarkerRef.current = destMarker
    }

    // Pin de origen (azul)
    if (originLocation?.latitude && originLocation?.longitude) {
      const origMarker = new window.google.maps.Marker({
        position: { lat: Number(originLocation.latitude), lng: Number(originLocation.longitude) },
        map: mapInstanceRef.current,
        title: originLocation.displayName || 'Origen',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color:#4285F4;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #4285F4;">
            <strong>🚏 Origen</strong><br/>
            ${originLocation.displayName}<br/>
            ${originLocation.address ?? ''}
          </div>
        `
      })
      infoWindow.open(mapInstanceRef.current, origMarker)
      originMarkerRef.current = origMarker
    }

    // Zoom: si hay ambos puntos → fitBounds; si solo destino → panTo + zoom
    const destLat = Number(selectedLocation?.latitude)
    const destLng = Number(selectedLocation?.longitude)
    const origLat = Number(originLocation?.latitude)
    const origLng = Number(originLocation?.longitude)

    if (!selectedLocation || isNaN(destLat) || isNaN(destLng) || (destLat === 0 && destLng === 0)) {
      console.warn('selectedLocation tiene coordenadas inválidas:', selectedLocation)
      return
    }

    if (!isNaN(origLat) && !isNaN(origLng)) {
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(new window.google.maps.LatLng(destLat, destLng))
      bounds.extend(new window.google.maps.LatLng(origLat, origLng))
      mapInstanceRef.current.fitBounds(bounds, 60)
    } else {
      mapInstanceRef.current.panTo(new window.google.maps.LatLng(destLat, destLng))
      mapInstanceRef.current.setZoom(16)
    }

  }, [selectedLocation, originLocation, map])

  return (
    <div
      className={`relative w-full h-96 bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden ${className}`}
      style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}
    >
      {/* FIX 4: Use a ref instead of getElementById so React controls the node */}
      <div ref={mapContainerRef} className="w-full h-full bg-dark-700" />

      {/* Loading state */}
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

      {/* Error state */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
          <div className="text-center px-4">
            <p className="text-red-500 font-mono text-sm">{loadError}</p>
            <p className="text-gray-400 text-xs mt-2">
              Verifica tu API Key y que no esté bloqueada por un adblocker.
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      {!isLoading && !loadError && (
        <div
          className="absolute bottom-4 left-4 bg-dark-800 border border-neon-500 rounded-lg p-3 text-xs z-20"
          style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}
        >
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Origen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

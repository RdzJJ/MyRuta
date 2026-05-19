import { useState, useEffect, useRef } from 'react'

const MEDELLIN_CENTER = { lat: 6.2442, lng: -75.5812 }

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#1a3d1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4d4d4d' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'transit.line', elementType: 'labels.text.fill', stylers: [{ color: '#666' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
]

let mapsLoadPromise = null
function loadGoogleMaps(apiKey) {
  if (mapsLoadPromise) return mapsLoadPromise
  mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return }
    const callbackName = '__googleMapsReady__'
    window[callbackName] = () => { delete window[callbackName]; resolve() }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&loading=async&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onerror = () => { mapsLoadPromise = null; reject(new Error('Failed to load Google Maps API')) }
    document.head.appendChild(script)
  })
  return mapsLoadPromise
}

export default function MedellinMap({
  busLocations = [],
  selectedLocation = null,
  originLocation = null,
  selectedRuta = null,       // ← NUEVO: ruta con waypoints para dibujar
  className = ''
}) {
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const mapContainerRef      = useRef(null)
  const mapInstanceRef       = useRef(null)
  const markersRef           = useRef([])
  const destinationMarkerRef = useRef(null)
  const originMarkerRef      = useRef(null)
  // ── NUEVO: refs para la capa de ruta seleccionada ──
  const routePolylineRef     = useRef(null)
  const routeMarkersRef      = useRef([])

  // ── Cargar SDK ────────────────────────────────────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) { setLoadError('VITE_GOOGLE_MAPS_API_KEY is not set'); setIsLoading(false); return }
    loadGoogleMaps(apiKey)
      .then(() => setIsLoading(false))
      .catch(err => { setLoadError(err.message); setIsLoading(false) })
  }, [])

  // ── Inicializar mapa ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || loadError || mapInstanceRef.current) return
    if (!mapContainerRef.current || !window.google?.maps) return

    const newMap = new window.google.maps.Map(mapContainerRef.current, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      zoomControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: true,
    })
    mapInstanceRef.current = newMap
    setMap(newMap)
  }, [isLoading, loadError])

  // ── Ubicación en tiempo real del usuario ──────────────────────────────────
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
            icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4285F4', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
          })
        } else {
          userMarker.setPosition(userLatLng)
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    )
    return () => { navigator.geolocation.clearWatch(watchId); if (userMarker) userMarker.setMap(null) }
  }, [map])

  // ── Markers de buses activos ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    if (!busLocations.length) return

    markersRef.current = busLocations.map((bus, idx) => {
      const lat = bus.latitude ?? bus.lat
      const lng = bus.longitude ?? bus.lng
      if (lat == null || lng == null) return null
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: bus.label || `Bus ${idx + 1}`,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#00FF41', fillOpacity: 0.8, strokeColor: '#00AA00', strokeWeight: 2 }
      })
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="color:#00FF41;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #00FF41;"><strong>${bus.label || `Bus ${idx + 1}`}</strong><br/>Lat: ${lat.toFixed(4)}<br/>Lng: ${lng.toFixed(4)}</div>`
      })
      marker.addListener('click', () => iw.open(mapInstanceRef.current, marker))
      return marker
    }).filter(Boolean)
  }, [busLocations, map])

  // ── Markers de origen / destino ───────────────────────────────────────────
  useEffect(() => {
    if (destinationMarkerRef.current) { destinationMarkerRef.current.setMap(null); destinationMarkerRef.current = null }
    if (originMarkerRef.current) { originMarkerRef.current.setMap(null); originMarkerRef.current = null }
    if (!mapInstanceRef.current || !selectedLocation) return

    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      const destMarker = new window.google.maps.Marker({
        position: { lat: Number(selectedLocation.latitude), lng: Number(selectedLocation.longitude) },
        map: mapInstanceRef.current,
        title: selectedLocation.displayName || 'Destino',
        icon: { path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 6, fillColor: '#00FF41', fillOpacity: 1, strokeColor: '#000', strokeWeight: 1.5 }
      })
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="color:#00FF41;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #00FF41;"><strong>Destino</strong><br/>${selectedLocation.displayName}<br/>${selectedLocation.address ?? ''}</div>`
      })
      iw.open(mapInstanceRef.current, destMarker)
      destinationMarkerRef.current = destMarker
    }

    if (originLocation?.latitude && originLocation?.longitude) {
      const origMarker = new window.google.maps.Marker({
        position: { lat: Number(originLocation.latitude), lng: Number(originLocation.longitude) },
        map: mapInstanceRef.current,
        title: originLocation.displayName || 'Origen',
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#4285F4', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
      })
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="color:#4285F4;font-family:monospace;padding:8px;background:#1a1a1a;border:1px solid #4285F4;"><strong>Origen</strong><br/>${originLocation.displayName}<br/>${originLocation.address ?? ''}</div>`
      })
      iw.open(mapInstanceRef.current, origMarker)
      originMarkerRef.current = origMarker
    }

    const destLat = Number(selectedLocation?.latitude)
    const destLng = Number(selectedLocation?.longitude)
    const origLat = Number(originLocation?.latitude)
    const origLng = Number(originLocation?.longitude)
    if (isNaN(destLat) || isNaN(destLng) || (destLat === 0 && destLng === 0)) return

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

  // ── NUEVO: Dibujar ruta seleccionada (polyline + paradas) ─────────────────
  useEffect(() => {
    // Limpiar capa anterior siempre
    if (routePolylineRef.current) { routePolylineRef.current.setMap(null); routePolylineRef.current = null }
    routeMarkersRef.current.forEach(m => m.setMap(null))
    routeMarkersRef.current = []

    if (!mapInstanceRef.current || !selectedRuta?.waypoints?.length) return

    const color = selectedRuta.color || '#00FF41'
    const wps   = selectedRuta.waypoints

    // Polyline
    routePolylineRef.current = new window.google.maps.Polyline({
      path: wps.map(wp => ({ lat: wp.lat, lng: wp.lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 5,
      map: mapInstanceRef.current,
    })

    // Marcador por cada parada
    wps.forEach((wp, idx) => {
      const isFirst = idx === 0
      const isLast  = idx === wps.length - 1

      const marker = new window.google.maps.Marker({
        position: { lat: wp.lat, lng: wp.lng },
        map: mapInstanceRef.current,
        title: wp.nombre || `Parada ${idx + 1}`,
        zIndex: isFirst || isLast ? 10 : 5,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isFirst || isLast ? 10 : 7,
          fillColor: isFirst ? '#00FF41' : isLast ? '#FF6B35' : color,
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 1.5,
        },
        label: isFirst || isLast
          ? { text: isFirst ? 'A' : 'B', color: '#000', fontWeight: 'bold', fontSize: '10px' }
          : { text: String(idx + 1), color: '#000', fontSize: '9px' },
      })

      const iw = new window.google.maps.InfoWindow({
        content: `<div style="background:#1a1a1a;color:${color};padding:6px 10px;border-radius:6px;font-size:12px;font-weight:bold;border:1px solid ${color}">
          ${idx + 1}. ${wp.nombre || `Parada ${idx + 1}`}
        </div>`
      })
      marker.addListener('click', () => iw.open(mapInstanceRef.current, marker))
      routeMarkersRef.current.push(marker)
    })

    // Ajustar zoom para ver toda la ruta
    const bounds = new window.google.maps.LatLngBounds()
    wps.forEach(wp => bounds.extend({ lat: wp.lat, lng: wp.lng }))
    mapInstanceRef.current.fitBounds(bounds, { padding: 60 })
  }, [selectedRuta, map])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative w-full bg-dark-800 border-2 rounded-xl overflow-hidden transition-all duration-300 ${
        selectedRuta ? 'border-opacity-100' : 'border-neon-500'
      } ${className}`}
      style={{
        height: '420px',
        boxShadow: selectedRuta
          ? `0 0 25px ${selectedRuta.color || 'rgba(0,255,65,0.4)'}55`
          : '0 0 20px rgba(0, 255, 65, 0.2)',
        borderColor: selectedRuta ? (selectedRuta.color || '#00FF41') : undefined,
      }}
    >
      <div ref={mapContainerRef} className="w-full h-full bg-dark-700" />

      {/* Banner de ruta seleccionada */}
      {selectedRuta && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          style={{ background: '#1a1a1aee', border: `1.5px solid ${selectedRuta.color || '#00FF41'}`, color: selectedRuta.color || '#00FF41' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: selectedRuta.color || '#00FF41' }} />
          {selectedRuta.codigo} — {selectedRuta.nombre}
          <span className="opacity-60 font-normal">· {selectedRuta.waypoints?.length} paradas</span>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <div className="w-8 h-8 border-2 border-neon-500 border-t-transparent rounded-full" />
            </div>
            <p className="text-neon-500">Cargando mapa de Medellín...</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
          <div className="text-center px-4">
            <p className="text-red-500 font-mono text-sm">{loadError}</p>
            <p className="text-gray-400 text-xs mt-2">Verifica tu API Key.</p>
          </div>
        </div>
      )}

      {/* Leyenda dinámica */}
      {!isLoading && !loadError && (
        <div className="absolute bottom-4 left-4 bg-dark-800 bg-opacity-90 border border-neon-500 rounded-lg p-3 text-xs z-20"
          style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500 font-semibold mb-2">Leyenda</p>
          <div className="space-y-1 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-500" />
              <span>Buses activos</span>
            </div>
            {selectedRuta ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: selectedRuta.color || '#00FF41' }} />
                  <span>Parada intermedia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon-500" />
                  <span>Inicio (A)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF6B35' }} />
                  <span>Final (B)</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-neon-500" />
                  <span>Destino</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Origen</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

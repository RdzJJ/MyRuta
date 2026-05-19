import { useState, useEffect, useRef } from 'react'
import { getRutas, getBuses, getConductor } from '../../services/firestoreService'
import { subscribeToAllLocations } from '../../services/realtimeService'

const MEDELLIN_CENTER = { lat: 6.2442, lng: -75.5812 }

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#4d4d4d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d2d2d' }] },
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
    script.onerror = () => { mapsLoadPromise = null; reject(new Error('Error cargando Google Maps')) }
    document.head.appendChild(script)
  })
  return mapsLoadPromise
}

export default function LiveMapPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [rutas, setRutas] = useState([])
  const [buses, setBuses] = useState([])
  const [conductores, setConductores] = useState({})
  const [locations, setLocations] = useState([])
  const [selectedRutaId, setSelectedRutaId] = useState(null)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})   // conductorId → Marker
  const polylinesRef = useRef([])   // ruta polylines

  // ── Cargar Google Maps ──────────────────────────────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) { setLoadError('API Key no configurada'); setIsLoading(false); return }
    loadGoogleMaps(apiKey)
      .then(() => setIsLoading(false))
      .catch(err => { setLoadError(err.message); setIsLoading(false) })
  }, [])

  // ── Inicializar mapa ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || loadError || mapInstanceRef.current) return
    if (!mapContainerRef.current || !window.google?.maps) return

    mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    })
  }, [isLoading, loadError])

  // ── Cargar rutas y buses desde Firestore ────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      const [rutasData, busesData] = await Promise.all([getRutas(), getBuses()])
      setRutas(rutasData)
      setBuses(busesData)

      // Cargar conductores
      const condMap = {}
      for (const bus of busesData) {
        if (bus.conductorId && !condMap[bus.conductorId]) {
          const c = await getConductor(bus.conductorId)
          if (c) condMap[bus.conductorId] = c
        }
      }
      setConductores(condMap)
    }
    cargar()
  }, [])

  // ── Dibujar polylines de rutas en el mapa ───────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !rutas.length) return

    // Limpiar polylines anteriores
    polylinesRef.current.forEach(p => p.setMap(null))
    polylinesRef.current = []

    const rutasAMostrar = selectedRutaId
      ? rutas.filter(r => r.id === selectedRutaId)
      : rutas

    rutasAMostrar.forEach(ruta => {
      if (!ruta.waypoints?.length) return
      const polyline = new window.google.maps.Polyline({
        path: ruta.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
        geodesic: true,
        strokeColor: ruta.color || '#00FF41',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current
      })

      // Marcadores de paradas
      ruta.waypoints.forEach((wp, idx) => {
        new window.google.maps.Marker({
          position: { lat: wp.lat, lng: wp.lng },
          map: mapInstanceRef.current,
          title: `Parada ${idx + 1} - ${ruta.nombre}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: ruta.color || '#00FF41',
            fillOpacity: 1,
            strokeColor: '#000',
            strokeWeight: 1
          }
        })
      })

      polylinesRef.current.push(polyline)
    })
  }, [rutas, selectedRutaId, isLoading])

  // ── Suscribirse a ubicaciones en tiempo real ────────────────────────────────
  useEffect(() => {
    const unsub = subscribeToAllLocations((locs) => {
      setLocations(locs)

      if (!mapInstanceRef.current || !window.google?.maps) return

      locs.forEach(loc => {
        const pos = { lat: loc.lat, lng: loc.lng }
        const bus = buses.find(b => b.conductorId === loc.conductorId)
        const conductor = conductores[loc.conductorId]
        const ruta = rutas.find(r => r.id === loc.rutaId)
        const label = bus?.placa || loc.conductorId.slice(0, 6)

        if (markersRef.current[loc.conductorId]) {
          // Actualizar posición del marker existente
          markersRef.current[loc.conductorId].setPosition(pos)
        } else {
          // Crear nuevo marker
          const marker = new window.google.maps.Marker({
            position: pos,
            map: mapInstanceRef.current,
            title: label,
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 7,
              fillColor: '#00FF41',
              fillOpacity: 1,
              strokeColor: '#000',
              strokeWeight: 1.5,
              rotation: 0
            },
            label: {
              text: label,
              color: '#00FF41',
              fontSize: '10px',
              fontWeight: 'bold',
              className: 'map-label'
            }
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color:#00FF41;font-family:monospace;padding:10px;background:#1a1a1a;border:1px solid #00FF41;border-radius:6px;min-width:160px">
                <strong style="font-size:14px">🚌 ${label}</strong><br/>
                <span style="opacity:0.8">Conductor: ${conductor ? `${conductor.nombre} ${conductor.apellido}` : 'N/A'}</span><br/>
                <span style="opacity:0.8">Ruta: ${ruta?.nombre || 'N/A'}</span><br/>
                <span style="opacity:0.8">Velocidad: ${loc.velocidad?.toFixed(1) || '0'} km/h</span>
              </div>
            `
          })
          marker.addListener('click', () => infoWindow.open(mapInstanceRef.current, marker))
          markersRef.current[loc.conductorId] = marker
        }
      })

      // Limpiar markers de conductores que ya no están activos
      Object.keys(markersRef.current).forEach(condId => {
        if (!locs.find(l => l.conductorId === condId)) {
          markersRef.current[condId].setMap(null)
          delete markersRef.current[condId]
        }
      })
    })
    return () => unsub()
  }, [buses, conductores, rutas])

  // ── Stats ───────────────────────────────────────────────────────────────────
  const busesEnLinea = locations.length
  const rutasActivas = rutas.filter(r => r.status === 'active').length
  const rutasFiltradas = selectedRutaId ? rutas.filter(r => r.id === selectedRutaId) : rutas

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neon-500 mb-2"
            style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            Mapa en Vivo
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Mapa ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="relative w-full bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden"
              style={{ height: '600px', boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>

              <div ref={mapContainerRef} className="w-full h-full bg-dark-700" />

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
                  <div className="text-center">
                    <div className="animate-spin mb-4">
                      <div className="w-8 h-8 border-2 border-neon-500 border-t-transparent rounded-full" />
                    </div>
                    <p className="text-neon-500">Cargando mapa...</p>
                  </div>
                </div>
              )}

              {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
                  <p className="text-red-400 font-mono text-sm">{loadError}</p>
                </div>
              )}

              {/* Leyenda */}
              {!isLoading && !loadError && (
                <div className="absolute bottom-4 left-4 bg-dark-800 bg-opacity-90 border border-neon-500 rounded-lg p-3 text-xs z-20"
                  style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}>
                  <p className="text-neon-500 font-bold mb-2">Leyenda</p>
                  <div className="space-y-1 text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-neon-500" />
                      <span>Bus en movimiento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      <span>Parada de ruta</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicador buses en vivo */}
              {busesEnLinea > 0 && (
                <div className="absolute top-4 right-4 bg-dark-800 bg-opacity-90 border border-neon-500 rounded-lg px-3 py-2 z-20 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-500 animate-pulse" />
                  <span className="text-neon-500 text-sm font-bold">{busesEnLinea} en línea</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Filtro de ruta */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-4"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="text-neon-500 font-bold mb-3">Filtrar Ruta</h3>
              <select
                value={selectedRutaId || ''}
                onChange={e => setSelectedRutaId(e.target.value || null)}
                className="w-full px-3 py-2 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg text-sm focus:outline-none">
                <option value="">Todas las rutas</option>
                {rutas.map(r => (
                  <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>
                ))}
              </select>
            </div>

            {/* Rutas activas */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-4"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="text-neon-500 font-bold mb-3">Rutas</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {rutasFiltradas.map(ruta => (
                  <div key={ruta.id}
                    className="p-3 bg-dark-700 rounded-lg border-l-4 cursor-pointer hover:bg-dark-600 transition"
                    style={{ borderColor: ruta.color || '#00FF41' }}
                    onClick={() => setSelectedRutaId(ruta.id === selectedRutaId ? null : ruta.id)}>
                    <p className="font-bold text-neon-500 text-sm">{ruta.codigo}</p>
                    <p className="text-neon-500 opacity-70 text-xs">{ruta.nombre}</p>
                    <p className="text-xs mt-1" style={{ color: ruta.color || '#00FF41' }}>
                      {ruta.status === 'active' ? '🟢 Activa' : '🔴 Inactiva'}
                    </p>
                  </div>
                ))}
                {rutasFiltradas.length === 0 && (
                  <p className="text-neon-500 opacity-50 text-sm">Sin rutas</p>
                )}
              </div>
            </div>

            {/* Buses en línea */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-4"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="text-neon-500 font-bold mb-3">Buses en Línea</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.length === 0 ? (
                  <p className="text-neon-500 opacity-50 text-sm">Ningún bus activo</p>
                ) : locations.map(loc => {
                  const bus = buses.find(b => b.conductorId === loc.conductorId)
                  const conductor = conductores[loc.conductorId]
                  const ruta = rutas.find(r => r.id === loc.rutaId)
                  return (
                    <div key={loc.conductorId}
                      className="p-3 bg-dark-700 rounded-lg border border-neon-500 border-opacity-30">
                      <div className="flex items-center justify-between">
                        <span className="text-neon-500 font-mono font-bold text-sm">
                          {bus?.placa || '—'}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-neon-500 animate-pulse" />
                      </div>
                      <p className="text-neon-500 opacity-70 text-xs mt-1">
                        {conductor ? `${conductor.nombre}` : 'Sin conductor'}
                      </p>
                      <p className="text-neon-500 opacity-50 text-xs">{ruta?.nombre || '—'}</p>
                      <p className="text-neon-500 opacity-70 text-xs font-semibold mt-1">
                        {loc.velocidad?.toFixed(1) || '0'} km/h
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
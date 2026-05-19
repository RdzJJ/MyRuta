import { useState, useEffect, useRef } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase'
import { getBuses } from '../../services/firestoreService'

// ─── Constantes ───────────────────────────────────────────────────────────────
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
]

const COLORES_RUTA = ['#00FF41', '#00BFFF', '#FF6B35', '#FFD700', '#FF69B4', '#9B59B6']

const ESTADOS = ['Activa', 'Inactiva', 'Mantenimiento']

const RUTA_VACIA = {
  codigo: '',
  nombre: '',
  estado: 'Activa',
  descripcion: '',
  busId: '',
  color: '#00FF41',
  waypoints: []   // [{ lat, lng, nombre, orden }]
}

// ─── Singleton para cargar Google Maps una sola vez ───────────────────────────
let mapsLoadPromise = null
function loadGoogleMaps(apiKey) {
  if (mapsLoadPromise) return mapsLoadPromise
  mapsLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return }
    const cb = '__gmReady__'
    window[cb] = () => { delete window[cb]; resolve() }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${cb}&libraries=places&v=weekly`
    s.async = true
    s.defer = true
    s.onerror = () => { mapsLoadPromise = null; reject(new Error('Error cargando Google Maps')) }
    document.head.appendChild(s)
  })
  return mapsLoadPromise
}

// ─── Sub-componente: Editor de Waypoints con mapa ────────────────────────────
function WaypointMapEditor({ waypoints, onChange, color }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markersRef   = useRef([])
  const polylineRef  = useRef(null)
  const [mapsReady, setMapsReady] = useState(false)
  const [mapError, setMapError]   = useState(null)

  // Cargar SDK
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) { setMapError('VITE_GOOGLE_MAPS_API_KEY no configurada'); return }
    loadGoogleMaps(key)
      .then(() => setMapsReady(true))
      .catch(e => setMapError(e.message))
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!mapsReady || mapRef.current || !containerRef.current) return

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    // Clic en el mapa → agregar waypoint
    mapRef.current.addListener('click', (e) => {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      onChange(prev => {
        const next = [...prev, { lat, lng, nombre: `Parada ${prev.length + 1}`, orden: prev.length }]
        return next
      })
    })
  }, [mapsReady])

  // Sincronizar markers y polyline cuando cambian los waypoints
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return

    // Limpiar markers anteriores
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    // Limpiar polyline
    if (polylineRef.current) polylineRef.current.setMap(null)

    if (waypoints.length === 0) return

    // Dibujar markers
    waypoints.forEach((wp, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: wp.lat, lng: wp.lng },
        map: mapRef.current,
        label: {
          text: String(idx + 1),
          color: '#000',
          fontWeight: 'bold',
          fontSize: '11px'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#000',
          strokeWeight: 1.5
        },
        title: wp.nombre
      })
      markersRef.current.push(marker)
    })

    // Dibujar polyline
    polylineRef.current = new window.google.maps.Polyline({
      path: waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: mapRef.current
    })

    // Centrar mapa en los waypoints
    if (waypoints.length === 1) {
      mapRef.current.setCenter({ lat: waypoints[0].lat, lng: waypoints[0].lng })
    } else {
      const bounds = new window.google.maps.LatLngBounds()
      waypoints.forEach(wp => bounds.extend({ lat: wp.lat, lng: wp.lng }))
      mapRef.current.fitBounds(bounds, { padding: 60 })
    }
  }, [waypoints, color])

  if (mapError) return (
    <div className="flex items-center justify-center h-48 bg-dark-700 rounded-lg border border-red-500">
      <p className="text-red-400 text-sm">{mapError}</p>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="relative bg-dark-700 rounded-lg overflow-hidden border-2 border-neon-500"
        style={{ height: '320px' }}>
        <div ref={containerRef} className="w-full h-full" />
        {!mapsReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-80">
            <p className="text-neon-500 animate-pulse text-sm">Cargando mapa...</p>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-dark-800 bg-opacity-90 border border-neon-500 rounded-lg px-3 py-1 text-xs text-neon-500 z-10">
          📍 Haz clic en el mapa para agregar paradas
        </div>
      </div>

      {/* Lista de waypoints */}
      {waypoints.length > 0 && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {waypoints.map((wp, idx) => (
            <div key={idx}
              className="flex items-center gap-2 bg-dark-700 border border-neon-500 border-opacity-30 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-neon-500 w-5 shrink-0">{idx + 1}</span>
              <input
                type="text"
                value={wp.nombre}
                onChange={e => {
                  const next = [...waypoints]
                  next[idx] = { ...next[idx], nombre: e.target.value }
                  onChange(() => next)
                }}
                className="flex-1 bg-transparent text-neon-500 text-xs focus:outline-none"
                placeholder={`Parada ${idx + 1}`}
              />
              <span className="text-neon-500 opacity-40 text-xs font-mono">
                {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
              </span>
              <button
                onClick={() => onChange(prev => prev.filter((_, i) => i !== idx))}
                className="text-red-400 hover:text-red-300 text-xs shrink-0 ml-1">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {waypoints.length === 0 && (
        <p className="text-neon-500 opacity-40 text-xs text-center py-2">
          Sin paradas — haz clic en el mapa para comenzar
        </p>
      )}

      {waypoints.length > 0 && (
        <button
          onClick={() => onChange(() => [])}
          className="text-red-400 text-xs hover:text-red-300 transition">
          🗑️ Limpiar todas las paradas
        </button>
      )}
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function GestionRutas() {
  const [rutas, setRutas]                     = useState([])
  const [isLoading, setIsLoading]             = useState(true)
  const [showModal, setShowModal]             = useState(false)
  const [editando, setEditando]               = useState(null)
  const [form, setForm]                       = useState(RUTA_VACIA)
  const [waypoints, setWaypoints]             = useState([])
  const [errores, setErrores]                 = useState([])
  const [guardando, setGuardando]             = useState(false)
  const [confirmDelete, setConfirmDelete]     = useState(null)
  const [busesDisponibles, setBusesDisponibles] = useState([])

  // ── Cargar rutas ─────────────────────────────────────────────────────────────
  const cargarRutas = async () => {
    setIsLoading(true)
    try {
      const snap = await getDocs(collection(db, 'rutas'))
      setRutas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Error cargando rutas:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarRutas() }, [])

  const cargarBuses = async () => {
    try { setBusesDisponibles(await getBuses()) }
    catch (e) { console.error(e) }
  }

  // ── Validación ───────────────────────────────────────────────────────────────
  const validar = () => {
    const errs = []
    if (!form.codigo.trim()) errs.push('El código es obligatorio')
    if (!form.nombre.trim()) errs.push('El nombre es obligatorio')
    if (waypoints.length < 2)  errs.push('La ruta necesita al menos 2 paradas en el mapa')
    return errs
  }

  // ── Abrir modal ──────────────────────────────────────────────────────────────
  const handleNuevaRuta = () => {
    setEditando(null)
    setForm(RUTA_VACIA)
    setWaypoints([])
    setErrores([])
    cargarBuses()
    setShowModal(true)
  }

  const handleEditar = (ruta) => {
    setEditando(ruta)
    setForm({
      codigo:      ruta.codigo      || '',
      nombre:      ruta.nombre      || '',
      estado:      ruta.estado      || 'Activa',
      descripcion: ruta.descripcion || '',
      busId:       ruta.busId       || '',
      color:       ruta.color       || '#00FF41',
    })
    // Compatibilidad: si la ruta tiene waypoints los cargamos, si no, array vacío
    setWaypoints(ruta.waypoints || [])
    setErrores([])
    cargarBuses()
    setShowModal(true)
  }

  // ── Guardar ──────────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    const errs = validar()
    if (errs.length > 0) { setErrores(errs); return }

    setGuardando(true)
    try {
      // Normalizar waypoints con campo "orden" actualizado
      const wpsNormalizados = waypoints.map((wp, i) => ({
        lat:    wp.lat,
        lng:    wp.lng,
        nombre: wp.nombre || `Parada ${i + 1}`,
        orden:  i
      }))

      const payload = {
        codigo:      form.codigo.toUpperCase().trim(),
        nombre:      form.nombre.trim(),
        paradas:     wpsNormalizados.length,        // calculado automáticamente
        waypoints:   wpsNormalizados,               // ← coordenadas reales
        busId:       form.busId  || null,
        estado:      form.estado,
        // Mapear "estado" → "status" para que LiveMap los filtre igual
        status:      form.estado === 'Activa' ? 'active' : 'inactive',
        color:       form.color,
        descripcion: form.descripcion.trim(),
        updatedAt:   serverTimestamp()
      }

      let rutaId
      if (editando) {
        await updateDoc(doc(db, 'rutas', editando.id), payload)
        rutaId = editando.id
      } else {
        const ref = await addDoc(collection(db, 'rutas'), {
          ...payload,
          creadoEn: serverTimestamp()
        })
        rutaId = ref.id
      }

      // Actualizar bus asignado
      if (form.busId) {
        await updateDoc(doc(db, 'buses', form.busId), { rutaAsignada: rutaId })
      }

      setShowModal(false)
      await cargarRutas()
    } catch (e) {
      console.error(e)
      setErrores([`Error al guardar: ${e.message}`])
    } finally {
      setGuardando(false)
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    try {
      await deleteDoc(doc(db, 'rutas', id))
      setConfirmDelete(null)
      await cargarRutas()
    } catch (e) { console.error(e) }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const totalRutas   = rutas.length
  const rutasActivas = rutas.filter(r => r.estado === 'Activa').length
  const totalParadas = rutas.reduce((acc, r) => acc + (Number(r.paradas) || 0), 0)

  const colorEstado = (estado) => {
    if (estado === 'Activa')        return { badge: 'bg-neon-500 bg-opacity-20 text-neon-500',    shadow: '0 0 10px rgba(0,255,65,0.3)',   icon: '🟢' }
    if (estado === 'Mantenimiento') return { badge: 'bg-yellow-500 bg-opacity-20 text-yellow-400', shadow: '0 0 10px rgba(255,255,0,0.2)', icon: '🟡' }
    return { badge: 'bg-red-500 bg-opacity-20 text-red-400', shadow: '0 0 10px rgba(255,0,0,0.2)', icon: '🔴' }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2"
              style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              Gestión de Rutas
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent" />
          </div>
          <button
            onClick={handleNuevaRuta}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}>
            Nueva Ruta
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden mb-8"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500 animate-pulse">Cargando rutas...</p>
            </div>
          ) : rutas.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-neon-500 opacity-60">No hay rutas registradas. Crea la primera.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-700 border-b-2 border-neon-500">
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Código</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Nombre</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Paradas</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Color</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Bus Asignado</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Estado</th>
                    <th className="text-left py-4 px-6 font-bold text-neon-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rutas.map(ruta => {
                    const c = colorEstado(ruta.estado)
                    const busAsignado = busesDisponibles.find(b => b.id === ruta.busId)
                    return (
                      <tr key={ruta.id}
                        className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                        <td className="py-4 px-6 text-neon-500 font-mono font-bold">{ruta.codigo}</td>
                        <td className="py-4 px-6 text-neon-500">{ruta.nombre}</td>
                        <td className="py-4 px-6 text-neon-500 opacity-75">
                          {ruta.waypoints?.length || ruta.paradas || '—'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-dark-600"
                              style={{ background: ruta.color || '#00FF41' }} />
                            <span className="text-neon-500 opacity-60 text-xs font-mono">{ruta.color || '#00FF41'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-neon-500 font-mono text-sm">
                          {busAsignado ? busAsignado.placa : <span className="opacity-40">Sin bus</span>}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${c.badge}`}
                            style={{ boxShadow: c.shadow }}>
                            {ruta.estado}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditar(ruta)}
                              className="bg-dark-700 border border-neon-500 text-neon-500 px-4 py-2 rounded-lg hover:bg-neon-500 hover:text-dark-900 transition text-sm font-semibold">
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(ruta.id)}
                              className="bg-dark-700 border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-dark-900 transition text-sm font-semibold">
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total de Rutas', value: totalRutas },
            { label: 'Total de Paradas', value: totalParadas },
            { label: 'Rutas Activas', value: rutasActivas }
          ].map(s => (
            <div key={s.label}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <p className="text-neon-500 opacity-75 text-sm mb-2">{s.label}</p>
              <p className="text-4xl font-bold text-neon-500"
                style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Modal Crear / Editar ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 w-full max-w-3xl my-8"
            style={{ boxShadow: '0 0 40px rgba(0,255,65,0.3)' }}>

            <h2 className="text-2xl font-bold text-neon-500 mb-6"
              style={{ textShadow: '0 0 10px rgba(0,255,65,0.6)' }}>
              {editando ? '✏️ Editar Ruta' : '➕ Nueva Ruta'}
            </h2>

            {errores.length > 0 && (
              <div className="bg-dark-700 border border-red-500 rounded-lg p-4 mb-6">
                {errores.map((e, i) => (
                  <p key={i} className="text-red-400 text-sm">⚠️ {e}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Código */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Código *</label>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: R001"
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Centro - Norte"
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500">
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Bus Asignado */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Bus Asignado (opcional)</label>
                <select
                  value={form.busId}
                  onChange={e => setForm({ ...form, busId: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-neon-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500">
                  <option value="">— Sin bus asignado —</option>
                  {busesDisponibles.map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.placa}
                      {bus.rutaAsignada && bus.rutaAsignada !== editando?.id ? ' (asignado)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color de la ruta */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Color en el mapa</label>
                <div className="flex items-center gap-3">
                  {COLORES_RUTA.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className="w-8 h-8 rounded-full border-2 transition"
                      style={{
                        background: c,
                        borderColor: form.color === c ? '#fff' : 'transparent',
                        boxShadow: form.color === c ? `0 0 8px ${c}` : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-neon-500 text-sm font-semibold mb-1">Descripción (opcional)</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción breve de la ruta..."
                  rows={2}
                  className="w-full px-4 py-3 bg-dark-700 border-2 border-neon-500 text-white placeholder-neon-500 placeholder-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 resize-none"
                />
              </div>
            </div>

            {/* ── Editor de mapa ── */}
            <div className="mb-6">
              <label className="block text-neon-500 text-sm font-semibold mb-2">
                🗺️ Trazar paradas en el mapa *
                <span className="ml-2 text-neon-500 opacity-50 font-normal">
                  ({waypoints.length} parada{waypoints.length !== 1 ? 's' : ''})
                </span>
              </label>
              <WaypointMapEditor
                waypoints={waypoints}
                onChange={setWaypoints}
                color={form.color}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex-1 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 rounded-lg hover:from-neon-400 hover:to-neon-500 transition disabled:opacity-50"
                style={{ boxShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
                {guardando ? 'Guardando...' : editando ? 'Actualizar Ruta' : 'Crear Ruta'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={guardando}
                className="flex-1 bg-dark-700 border-2 border-neon-500 text-neon-500 font-bold py-3 rounded-lg hover:bg-dark-600 transition disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Eliminar ─────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border-2 border-red-500 rounded-xl p-8 w-full max-w-sm text-center"
            style={{ boxShadow: '0 0 40px rgba(255,0,0,0.3)' }}>
            <p className="text-4xl mb-4">⚠️</p>
            <h3 className="text-xl font-bold text-red-400 mb-2">¿Eliminar esta ruta?</h3>
            <p className="text-neon-500 opacity-70 text-sm mb-6">
              Esta acción no se puede deshacer. Los buses asignados quedarán sin ruta.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleEliminar(confirmDelete)}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-dark-700 border-2 border-neon-500 text-neon-500 font-bold py-3 rounded-lg hover:bg-dark-600 transition">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

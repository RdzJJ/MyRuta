import { useState, useEffect } from 'react'
import DestinationSearch from '../../components/DestinationSearch'
import MedellinMap from '../../components/Maps/MedellinMap'
import { getRutas } from '../../services/firestoreService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const esRutaActiva = (ruta) =>
  ruta.status === 'active' || ruta.estado === 'Activa'

/** Distancia en metros entre dos puntos (fórmula Haversine) */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000 // metros
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

/** Formatea metros a texto legible */
function formatDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

/**
 * Calcula el score de relevancia de una ruta para un origen y/o destino.
 * Devuelve null si la ruta no tiene waypoints con coordenadas.
 *
 * Score = distOrigen + distDestino  (menor = mejor)
 * Bonus: si el waypoint de origen tiene orden < waypoint de destino
 *        (la ruta va en la dirección correcta), se reduce el score un 20 %.
 */
function calcularScore(ruta, origCoord, destCoord) {
  const wps = ruta.waypoints?.filter(wp => wp.lat != null && wp.lng != null)
  if (!wps?.length) return null

  let distOrigen = Infinity
  let ordenOrigen = 0
  let distDestino = Infinity
  let ordenDestino = 0

  if (origCoord) {
    wps.forEach(wp => {
      const d = haversine(origCoord.lat, origCoord.lng, wp.lat, wp.lng)
      if (d < distOrigen) { distOrigen = d; ordenOrigen = wp.orden ?? 0 }
    })
  }

  if (destCoord) {
    wps.forEach(wp => {
      const d = haversine(destCoord.lat, destCoord.lng, wp.lat, wp.lng)
      if (d < distDestino) { distDestino = d; ordenDestino = wp.orden ?? 0 }
    })
  }

  const baseScore =
    (origCoord ? distOrigen : 0) + (destCoord ? distDestino : 0)

  // Bonus dirección correcta
  const enDireccionCorrecta =
    origCoord && destCoord && ordenOrigen < ordenDestino
  const score = enDireccionCorrecta ? baseScore * 0.8 : baseScore

  return { score, distOrigen, distDestino, enDireccionCorrecta }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ConsultaRutas() {
  const [originLocation, setOriginLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [todasLasRutas, setTodasLasRutas] = useState([])
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRuta, setSelectedRuta] = useState(null)
  const [buscado, setBuscado] = useState(false)  // ¿se ejecutó búsqueda con coordenadas?

  useEffect(() => {
    const cargar = async () => {
      try {
        const rutas = await getRutas()
        setTodasLasRutas(rutas)
        setResults(rutas.filter(esRutaActiva))
      } catch (error) {
        console.error('Error cargando rutas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    cargar()
  }, [])

  const handleSearch = () => {
    const activas = todasLasRutas.filter(esRutaActiva)

    // Sin coordenadas: mostrar todas sin ordenar
    const origCoord = originLocation?.latitude
      ? { lat: Number(originLocation.latitude), lng: Number(originLocation.longitude) }
      : null
    const destCoord = destinationLocation?.latitude
      ? { lat: Number(destinationLocation.latitude), lng: Number(destinationLocation.longitude) }
      : null

    if (!origCoord && !destCoord) {
      setResults(activas)
      setBuscado(false)
      return
    }

    // Calcular score para cada ruta
    const scored = activas
      .map(ruta => {
        const info = calcularScore(ruta, origCoord, destCoord)
        return { ruta, info }
      })
      .filter(({ info }) => info !== null)

    // Ordenar de menor a mayor score (más cercana primero)
    scored.sort((a, b) => a.info.score - b.info.score)

    const MAX_DIST = 1000 // 1 km

    const cercanas = scored.filter(({ info }) => {
      if (originLocation && info.distOrigen > MAX_DIST) return false
      if (destinationLocation && info.distDestino > MAX_DIST) return false
      return true
    })

    setResults(cercanas.map(({ ruta, info }) => ({ ...ruta, _score: info })))

    // Guardar resultados con el score adjunto para mostrarlo en la tarjeta
    setResults(scored.map(({ ruta, info }) => ({ ...ruta, _score: info })))
    setBuscado(true)

    // Auto-seleccionar la mejor ruta en el mapa
    if (cercanas.length > 0) setSelectedRuta(cercanas[0].ruta)
    else setSelectedRuta(null) // limpiar mapa si no hay resultados
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2"
            style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            Consultar Rutas
          </h1>
          <p className="text-neon-500 opacity-75">Encuentra la ruta perfecta para tu destino</p>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent mt-4" />
        </div>

        {/* Map */}
        <div className="mb-8">
          <MedellinMap
            selectedLocation={destinationLocation}
            originLocation={originLocation}
            selectedRuta={selectedRuta}
            className="rounded-xl"
          />
        </div>

        {/* Search Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 mb-8"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-semibold text-neon-500 mb-2">
                Parada de Origen
              </label>
              <DestinationSearch
                onDestinationSelect={setOriginLocation}
                placeholder="Ej: Centro, Mercado..."
                showMyLocation={true}
              />
              {originLocation && (
                <p className="text-xs text-neon-500 opacity-75 mt-2">
                  ✓ {originLocation.displayName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neon-500 mb-2">
                Parada de Destino
              </label>
              <DestinationSearch
                onDestinationSelect={setDestinationLocation}
                placeholder="Ej: Periférico, Hospital..."
                showMyLocation={false}
              />
              {destinationLocation && (
                <p className="text-xs text-neon-500 opacity-75 mt-2">
                  ✓ {destinationLocation.displayName}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-4 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
                style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.4)' }}
              >
                Buscar Rutas
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold text-neon-500 mb-4"
            style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            {buscado
              ? `Rutas más cercanas (${isLoading ? '…' : results.length})`
              : `✓ Rutas Disponibles (${isLoading ? '…' : results.length})`}
          </h2>

          {isLoading ? (
            <p className="text-neon-500 opacity-60 animate-pulse">Cargando rutas...</p>
          ) : results.length === 0 ? (
            <div className="bg-dark-800 border border-neon-500 border-opacity-30 rounded-xl p-8 text-center">
              <p className="text-neon-500 opacity-60 text-lg">No hay rutas activas disponibles</p>
              <p className="text-neon-500 opacity-40 text-sm mt-2">
                Intenta con otro término de búsqueda o consulta más tarde
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((ruta, idx) => {
                const activa = esRutaActiva(ruta)
                const totalParadas = ruta.waypoints?.length || ruta.paradas || 0
                const score = ruta._score
                const esMejor = buscado && idx === 0

                return (
                  <div key={ruta.id}
                    className={`bg-dark-800 border-2 rounded-xl p-6 hover:shadow-lg transition ${selectedRuta?.id === ruta.id ? 'border-opacity-100' : 'border-neon-500'
                      }`}
                    style={{
                      borderColor: selectedRuta?.id === ruta.id ? (ruta.color || '#00FF41') : undefined,
                      boxShadow: esMejor
                        ? '0 0 25px rgba(0, 255, 65, 0.4)'
                        : '0 0 15px rgba(0, 255, 65, 0.2)',
                    }}>

                    {/* Badge "Mejor opción" */}
                    {esMejor && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-neon-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          Mejor opción para tu recorrido
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: ruta.color || '#00FF41' }} />
                        <div>
                          <h3 className="text-2xl font-bold text-neon-500">{ruta.codigo}</h3>
                          <p className="text-neon-500 opacity-75 text-lg mt-0.5">{ruta.nombre}</p>
                          {ruta.descripcion && (
                            <p className="text-neon-500 opacity-50 text-sm mt-1">{ruta.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activa
                        ? 'bg-neon-500 bg-opacity-20 text-neon-500'
                        : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}>
                        {activa ? '🟢 Activa' : '🔴 Inactiva'}
                      </span>
                    </div>

                    {/* Distancias (solo si hubo búsqueda por coordenadas) */}
                    {buscado && score && (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {originLocation && (
                          <span className="text-xs px-3 py-1 rounded-full bg-blue-500 bg-opacity-15 text-blue-400 border border-blue-500 border-opacity-30">
                            Origen: {formatDist(score.distOrigen)} de la parada más cercana
                          </span>
                        )}
                        {destinationLocation && (
                          <span className="text-xs px-3 py-1 rounded-full bg-orange-500 bg-opacity-15 text-orange-400 border border-orange-500 border-opacity-30">
                            Destino: {formatDist(score.distDestino)} de la parada más cercana
                          </span>
                        )}
                        {originLocation && destinationLocation && (
                          <span className={`text-xs px-3 py-1 rounded-full border ${score.enDireccionCorrecta
                            ? 'bg-neon-500 bg-opacity-10 text-neon-500 border-neon-500 border-opacity-30'
                            : 'bg-yellow-500 bg-opacity-10 text-yellow-400 border-yellow-500 border-opacity-30'
                            }`}>
                            {score.enDireccionCorrecta ? '✓ Dirección correcta' : '↩ Dirección inversa'}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neon-500 border-opacity-30">
                      <div>
                        <p className="text-neon-500 opacity-75 text-sm">Paradas</p>
                        <p className="text-neon-500 font-bold">
                          🛑 {totalParadas} parada{totalParadas !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-neon-500 opacity-75 text-sm">Color de ruta</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: ruta.color || '#00FF41' }} />
                          <span className="text-neon-500 text-sm font-mono">
                            {ruta.color || '#00FF41'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => setSelectedRuta(selectedRuta?.id === ruta.id ? null : ruta)}
                          className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-2 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
                          style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>
                          {selectedRuta?.id === ruta.id ? '✖ Deseleccionar' : '✓ Seleccionar'}
                        </button>
                      </div>
                    </div>

                    {/* Recorrido */}
                    {ruta.waypoints?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neon-500 border-opacity-20">
                        <p className="text-neon-500 opacity-60 text-xs font-semibold mb-2">RECORRIDO</p>
                        <div className="flex flex-wrap gap-2">
                          {ruta.waypoints.map((wp, i) => (
                            <span key={i}
                              className="text-xs px-2 py-1 rounded-full border border-neon-500 border-opacity-30 text-neon-500 opacity-70">
                              {i + 1}. {wp.nombre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-dark-800 border-l-4 border-neon-500 p-6 rounded-xl"
          style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500">
            💡 <strong>Tip:</strong> Ingresa origen y destino para ver las rutas ordenadas por proximidad a tu recorrido.
          </p>
        </div>
      </main>
    </div>
  )
}

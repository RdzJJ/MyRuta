import { useState, useEffect } from 'react'
import DestinationSearch from '../../components/DestinationSearch'
import MedellinMap from '../../components/Maps/MedellinMap'
import { getRutas } from '../../services/firestoreService'

// Helper: una ruta está activa si tiene status='active' O estado='Activa'
// Cubre rutas antiguas (solo tienen 'estado') y rutas nuevas (tienen ambos)
const esRutaActiva = (ruta) =>
  ruta.status === 'active' || ruta.estado === 'Activa'

export default function ConsultaRutas() {
  const [originLocation, setOriginLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [todasLasRutas, setTodasLasRutas] = useState([])
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRuta, setSelectedRuta] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        // getRutas() puede filtrar o no filtrar por status — lo normalizamos aquí
        const rutas = await getRutas()
        setTodasLasRutas(rutas)
        // Mostrar todas las rutas activas por defecto (sin necesidad de buscar)
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
    if (!originLocation && !destinationLocation) {
      // Sin filtros: mostrar todas las activas
      setResults(todasLasRutas.filter(esRutaActiva))
      return
    }
    // Filtro simple por nombre/código si hay texto en origen o destino
    // (puedes reemplazar esto con lógica de proximidad por waypoints)
    const termino = [
      originLocation?.displayName,
      destinationLocation?.displayName
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const filtradas = todasLasRutas.filter(r => {
      if (!esRutaActiva(r)) return false
      if (!termino) return true
      return (
        r.nombre?.toLowerCase().includes(termino) ||
        r.codigo?.toLowerCase().includes(termino) ||
        r.descripcion?.toLowerCase().includes(termino) ||
        r.waypoints?.some(wp => wp.nombre?.toLowerCase().includes(termino))
      )
    })
    setResults(filtradas)
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

        {/* Map Display */}
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

            {/* Origin */}
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

            {/* Destination */}
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

            {/* Button */}
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
            ✓ Rutas Disponibles ({isLoading ? '…' : results.length})
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
              {results.map(ruta => {
                const activa = esRutaActiva(ruta)
                const totalParadas = ruta.waypoints?.length || ruta.paradas || 0

                return (
                  <div key={ruta.id}
                    className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 hover:shadow-lg transition"
                    style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>

                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {/* Pastilla de color */}
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

                    {/* Paradas de la ruta si tiene waypoints */}
                    {ruta.waypoints?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neon-500 border-opacity-20">
                        <p className="text-neon-500 opacity-60 text-xs font-semibold mb-2">RECORRIDO</p>
                        <div className="flex flex-wrap gap-2">
                          {ruta.waypoints.map((wp, idx) => (
                            <span key={idx}
                              className="text-xs px-2 py-1 rounded-full border border-neon-500 border-opacity-30 text-neon-500 opacity-70">
                              {idx + 1}. {wp.nombre}
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
            💡 <strong>Tip:</strong> Selecciona una ruta para ver horarios en tiempo real y rastreo del bus.
          </p>
        </div>
      </main>
    </div>
  )
}

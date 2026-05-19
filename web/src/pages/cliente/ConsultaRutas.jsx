import { useState } from 'react'
import DestinationSearch from '../../components/DestinationSearch'
import MedellinMap from '../../components/Maps/MedellinMap'
import { useEffect } from 'react'
import { getRutas } from '../../services/firestoreService'

export default function ConsultaRutas() {
  const [originLocation, setOriginLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const rutas = await getRutas()
        setResults(rutas)
      } catch (error) {
        console.error('Error cargando rutas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    cargar()
  }, [])

  const handleSearch = () => {
    console.log('Buscando rutas:', {
      origin: originLocation,
      destination: destinationLocation
    })
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            Consultar Rutas
          </h1>
          <p className="text-neon-500 opacity-75">Encuentra la ruta perfecta para tu destino</p>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent mt-4"></div>
        </div>

        {/* Map Display */}
        <div className="mb-8">
          <MedellinMap
            selectedLocation={destinationLocation}
            originLocation={originLocation}
            className="rounded-xl"
          />
        </div>

        {/* Search Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 mb-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Origin Search */}
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

            {/* Destination Search */}
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

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!originLocation || !destinationLocation}
                className="w-full bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-4 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
            ✓ Rutas Disponibles ({results.length})
          </h2>

          {isLoading ? (
            <p className="text-neon-500 opacity-60">Cargando rutas...</p>
          ) : results.length === 0 ? (
            <p className="text-neon-500 opacity-60">No hay rutas disponibles</p>
          ) : (
            <div className="space-y-4">
              {results.map((ruta) => (
                <div key={ruta.id}
                  className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 hover:shadow-lg transition"
                  style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neon-500">{ruta.codigo}</h3>
                      <p className="text-neon-500 opacity-75 text-lg mt-1">{ruta.nombre}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ruta.status === 'active'
                        ? 'bg-neon-500 bg-opacity-20 text-neon-500'
                        : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}>
                        {ruta.status === 'active' ? '🟢 Activa' : '🔴 Inactiva'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neon-500 border-opacity-30">
                    <div>
                      <p className="text-neon-500 opacity-75 text-sm">Paradas</p>
                      <p className="text-neon-500 font-bold">
                        🛑 {ruta.paradas || ruta.waypoints?.length || '—'} paradas
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
                        className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-2 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
                        style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>
                        ✓ Seleccionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-dark-800 border-l-4 border-neon-500 p-6 rounded-xl" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500">
            💡 <strong>Tip:</strong> Selecciona una ruta para ver horarios en tiempo real y rastreo del bus.
          </p>
        </div>
      </main >
    </div >
  )
}

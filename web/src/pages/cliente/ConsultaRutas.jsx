/**
 * MyRuta Web - Cliente Routes Search Page
 * 
 * Features:
 * - Smart destination search with Google Maps autocomplete
 * - Real-time route filtering
 */

import { useState } from 'react'
import DestinationSearch from '../../components/DestinationSearch'

const mockRoutes = [
  { code: 'A001', origin: 'Centro', destination: 'Periférico', duration: '45 min', stops: 12, nextBus: '5 min' },
  { code: 'A002', origin: 'Centro', destination: 'Hospital', duration: '30 min', stops: 8, nextBus: '12 min' },
  { code: 'A003', origin: 'Centro', destination: 'Aeropuerto', duration: '60 min', stops: 15, nextBus: '18 min' },
]

export default function ConsultaRutas() {
  const [originLocation, setOriginLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)
  const [results, setResults] = useState(mockRoutes)

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

        {/* Search Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 mb-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Origin Search */}
            <div>
              <label className="block text-sm font-semibold text-neon-500 mb-2">
                📍 Parada de Origen
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
                🎯 Parada de Destino
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
          <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            ✓ Rutas Disponibles ({results.length})
          </h2>

          <div className="space-y-4">
            {results.map((route) => (
              <div
                key={route.code}
                className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 hover:shadow-lg transition"
                style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-neon-500">{route.code}</h3>
                    <p className="text-neon-500 opacity-75 text-lg mt-1">
                      {route.origin} → {route.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-xl">🟢 {route.nextBus}</p>
                    <p className="text-neon-500 opacity-75 text-sm">Próximo bus</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-neon-500 border-opacity-30">
                  <div>
                    <p className="text-neon-500 opacity-75 text-sm">Duración</p>
                    <p className="text-neon-500 font-bold">⏱️ {route.duration}</p>
                  </div>
                  <div>
                    <p className="text-neon-500 opacity-75 text-sm">Paradas</p>
                    <p className="text-neon-500 font-bold">🛑 {route.stops} paradas</p>
                  </div>
                  <div className="text-right">
                    <button
                      className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-2 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
                      style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}
                    >
                      ✓ Seleccionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-dark-800 border-l-4 border-neon-500 p-6 rounded-xl" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500">
            💡 <strong>Tip:</strong> Selecciona una ruta para ver horarios en tiempo real y rastreo del bus.
          </p>
        </div>
      </main>
    </div>
  )
}

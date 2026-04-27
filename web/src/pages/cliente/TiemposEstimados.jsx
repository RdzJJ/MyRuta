/**
 * MyRuta Web - Cliente Estimated Times Page
 * 
 * Features:
 * - Real-time bus ETA with Google Maps integration
 * - Destination search with autocomplete
 * - Traffic-aware routing
 */

import { useState, useContext } from 'react'
import DestinationSearch from '../../components/DestinationSearch'
import ETADisplay from '../../components/ETADisplay'
import { LocationContext } from '../../contexts/LocationContext'

const remainingStops = [
  { number: 1, name: 'Parada Central', time: '5 min', status: '🔴 Siguiente' },
  { number: 2, name: 'Mercado', time: '12 min', status: '🟡 Próximo' },
  { number: 3, name: 'Hospital', time: '18 min', status: '⚪ Pendiente' },
  { number: 4, name: 'Periférico', time: '28 min', status: '⚪ Destino' },
]

export default function TiemposEstimados() {
  const [selectedDestination, setSelectedDestination] = useState(null)
  const { locations } = useContext(LocationContext) || { locations: {} }

  // Get first available bus location (or use mock for demo)
  const busLocation = Object.values(locations)[0] || {
    latitude: 6.2442,
    longitude: -75.5812
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            ⏱️ Tiempos Estimados de Llegada
          </h1>
          <p className="text-neon-500 opacity-75">Rastreo en tiempo real de tu bus</p>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 h-96 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}
            >
              <div className="text-center">
                <p className="text-6xl mb-4">🗺️</p>
                <p className="text-neon-500 text-lg">Mapa en Tiempo Real</p>
                <p className="text-neon-500 opacity-75 text-sm mt-2">Integración con servicio de mapas - Proximamente</p>
              </div>
            </div>

            {/* Destination Search */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-neon-500 mb-3" style={{ textShadow: '0 0 8px rgba(0, 255, 65, 0.6)' }}>
                🎯 Selecciona tu Destino
              </h3>
              <DestinationSearch 
                onDestinationSelect={setSelectedDestination}
                placeholder="Busca un lugar en Medellín..."
                showMyLocation={true}
              />
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            {/* ETA Display */}
            {selectedDestination && (
              <ETADisplay 
                busLocation={busLocation}
                destination={selectedDestination}
                refreshInterval={30000}
                showDistance={true}
                className="mb-4"
              />
            )}

            {/* Current Route */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="font-bold text-lg text-neon-500 mb-3" style={{ textShadow: '0 0 8px rgba(0, 255, 65, 0.6)' }}>
                🚌 Tu Ruta
              </h3>
              <p className="text-neon-500 font-semibold">A001: Centro → Periférico</p>
              <p className="text-green-400 text-sm mt-2">🟢 Estado: En tránsito</p>
              <div className="mt-4 pt-4 border-t border-neon-500 border-opacity-30">
                <p className="text-neon-500 opacity-75 text-sm">Conductor</p>
                <p className="text-neon-500">Juan Pérez</p>
              </div>
            </div>

            {/* Remaining Stops */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="font-bold text-lg text-neon-500 mb-4" style={{ textShadow: '0 0 8px rgba(0, 255, 65, 0.6)' }}>
                🛑 Paradas Restantes
              </h3>
              <div className="space-y-3">
                {remainingStops.map((stop) => (
                  <div key={stop.number} className="bg-dark-700 border border-neon-500 border-opacity-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-neon-500 font-bold">{stop.name}</p>
                      <span>{stop.status}</span>
                    </div>
                    <p className="text-neon-500 opacity-75 text-sm">
                      ⏱️ {stop.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 bg-dark-800 border-l-4 border-neon-500 p-6 rounded-xl" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500">
            💡 <strong>Recuerda:</strong> Los tiempos son estimados basados en las condiciones actuales del tráfico. El conductor puede estar retrasado o adelantado.
          </p>
        </div>
      </main>
    </div>
  )
}

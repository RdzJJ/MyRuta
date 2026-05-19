/**
 * MyRuta Web - Travel History Component
 * 
 * Features:
 * - Display travel history table with real-time data
 * - Filter by route
 * - Show time differences between estimated and actual times
 * - Dark theme with neon accents
 */

import { useState, useEffect } from 'react'
import {
  getHistorialRecorridos,
  getRutas
} from '../../services/firestoreService'
import { formatETA } from '../../services/etaService'
import { formatDateTime } from '../../utils/dateFormatter'

export default function HistorialRecorridos() {
  const [historial, setHistorial] = useState([])
  const [rutas, setRutas] = useState([])
  const [selectedRutaId, setSelectedRutaId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load routes
  useEffect(() => {
    const loadRutas = async () => {
      const data = await getRutas()
      setRutas(data)
    }
    loadRutas()
  }, [])

  // Load history
  useEffect(() => {
    const loadHistorial = async () => {
      setIsLoading(true)
      const ruta = rutas.find((r) => r.id === selectedRutaId)
      const data = await getHistorialRecorridos(selectedRutaId)
      setHistorial(data)
      setIsLoading(false)
    }

    if (rutas.length > 0) {
      loadHistorial()
    }
  }, [selectedRutaId, rutas])

  const getDiferenciaColor = (diferencia) => {
    if (diferencia.includes('-')) {
      return 'text-green-400' // Llegó antes
    } else if (diferencia.includes('+')) {
      return 'text-yellow-400' // Llegó después
    }
    return 'text-neon-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
        <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
          Historial de Recorridos
        </h2>

        {/* Route Filter */}
        <div className="flex gap-4 items-center">
          <label className="text-neon-500 font-semibold">Filtrar por Ruta:</label>
          <select
            value={selectedRutaId || ''}
            onChange={(e) => setSelectedRutaId(e.target.value)}
            className="bg-dark-700 border-2 border-neon-500 text-neon-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
          >
            <option value="">Todos los Recorridos</option>
            {rutas.map((ruta) => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.code} - {ruta.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <div className="w-8 h-8 border-3 border-neon-500 border-t-transparent rounded-full" />
              </div>
              <p className="text-neon-500">Cargando historial...</p>
            </div>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-neon-500 opacity-75">No hay registros disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-700 border-b-2 border-neon-500">
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Fecha</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Bus (Placa)</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Conductor</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Ruta</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Tiempo Real</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Estimado</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((registro, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition"
                  >
                    <td className="py-4 px-6 text-neon-500 font-semibold">
                      {formatDateTime(registro.fecha)}
                    </td>
                    <td className="py-4 px-6 text-neon-500 font-mono font-bold">
                      {registro.busPlaca}
                    </td>
                    <td className="py-4 px-6 text-neon-500 opacity-75">
                      {registro.conductor}
                    </td>
                    <td className="py-4 px-6 text-neon-500">
                      {registro.ruta}
                    </td>
                    <td className="py-4 px-6 text-neon-500 font-semibold">
                      {registro.tiempoReal}
                    </td>
                    <td className="py-4 px-6 text-neon-500 opacity-75">
                      {registro.tiempoEstimado}
                    </td>
                    <td className={`py-4 px-6 font-bold ${getDiferenciaColor(registro.diferencia)}`}>
                      {registro.diferencia}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

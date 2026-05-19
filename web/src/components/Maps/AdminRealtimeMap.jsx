/**
 * MyRuta Web - Admin Real-Time Bus Monitor (Table View)
 * 
 * Features:
 * - Display all buses in table format
 * - Real-time GPS tracking
 * - Route selector dropdown
 * - Conductor information
 * - ETA calculations
 * - Dark theme with neon accents
 */

import { useState, useEffect } from "react"
import {
  getRutas,
  subscribeToBuses,
  getConductor
} from "../../services/firestoreService"
import { getETA, formatETA } from "../../services/etaService"

export default function AdminRealtimeMap() {
  const [isLoading, setIsLoading] = useState(true)
  const [rutas, setRutas] = useState([])
  const [selectedRutaId, setSelectedRutaId] = useState(null)
  const [buses, setBuses] = useState([])
  const [etas, setEtas] = useState({})

  // Load routes
  useEffect(() => {
    const loadRutas = async () => {
      try {
        const data = await getRutas()
        setRutas(data)
        if (data.length > 0) {
          setSelectedRutaId(data[0].id)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadRutas()
  }, [])

  // Subscribe to real-time bus updates
  useEffect(() => {
    const unsubscribe = subscribeToBuses((updatedBuses) => {
      setBuses(updatedBuses)
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // Calculate ETAs
  useEffect(() => {
    if (!buses.length || !rutas.length) {
      setEtas({})
      return
    }

    const updateETAs = async () => {
      const etasMap = {}
      const busesToCheck = selectedRutaId
        ? buses.filter((b) => b.rutaAsignada === selectedRutaId)
        : buses

      for (const bus of busesToCheck) {
        const ruta = rutas.find((r) => r.id === bus.rutaAsignada)
        if (ruta?.waypoints?.length > 0) {
          try {
            const eta = await getETA(bus, ruta.waypoints)
            if (eta) {
              etasMap[bus.id] = formatETA(eta)
            }
          } catch (error) {
            console.warn(`Error calculating ETA for bus ${bus.placa}:`, error)
          }
        }
      }

      setEtas(etasMap)
    }

    updateETAs()

    // Recalculate every 60 seconds
    const interval = setInterval(updateETAs, 60000)

    return () => clearInterval(interval)
  }, [buses, rutas, selectedRutaId])

  // Filter buses by route
  const filteredBuses = selectedRutaId
    ? buses.filter((bus) => bus.rutaAsignada === selectedRutaId)
    : buses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)" }}>
        <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: "0 0 10px rgba(0, 255, 65, 0.6)" }}>
          Monitoreo de Buses en Tiempo Real
        </h2>

        {/* Route Selector */}
        <div className="flex gap-4 items-center">
          <label className="text-neon-500 font-semibold">Seleccionar Ruta:</label>
          <select
            value={selectedRutaId || ""}
            onChange={(e) => setSelectedRutaId(e.target.value)}
            className="bg-dark-700 border-2 border-neon-500 text-neon-500 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500"
          >
            <option value="">Todas las Rutas</option>
            {rutas.map((ruta) => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.code} - {ruta.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buses Table */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden" style={{ boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)" }}>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <div className="w-8 h-8 border-3 border-neon-500 border-t-transparent rounded-full" />
              </div>
              <p className="text-neon-500">Cargando datos...</p>
            </div>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-neon-500 opacity-75">No hay buses disponibles</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-700 border-b-2 border-neon-500">
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Placa</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Conductor</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Ruta</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Viajes</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Velocidad</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">ETA</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((bus, idx) => {
                  const conductor = getConductor(bus.conductorId)
                  const ruta = rutas.find((r) => r.id === bus.rutaAsignada)

                  return (
                    <tr
                      key={idx}
                      className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition"
                    >
                      <td className="py-4 px-6 text-neon-500 font-mono font-bold">
                        {bus.placa}
                      </td>
                      <td className="py-4 px-6 text-neon-500">
                        {conductor
                          ? `${conductor.nombre} ${conductor.apellido}`
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-neon-500">
                        {ruta?.name || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-neon-500 opacity-75">
                        {conductor?.numeroDeViajes || "0"}
                      </td>
                      <td className="py-4 px-6 text-neon-500 font-semibold">
                        {bus.velocidad.toFixed(1)} km/h
                      </td>
                      <td className="py-4 px-6 text-neon-500 text-sm opacity-90">
                        {etas[bus.id] || "Calculando..."}
                      </td>
                      <td className="py-4 px-6 text-neon-500 opacity-60 text-xs">
                        {new Date(bus.timestamp).toLocaleTimeString("es-CO")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

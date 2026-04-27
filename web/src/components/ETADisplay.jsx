/**
 * MyRuta Web - ETA Display Component
 * 
 * Features:
 * - Display real-time ETA from bus to destination
 * - Auto-refresh every 30 seconds
 * - Show distance and estimated time
 * - Loading and error states
 * - Support for multi-bus scenarios (find nearest bus)
 */

import { useState, useEffect, useCallback } from 'react'
import { computeRoute, findNearestBus } from '../services/routesService'

export default function ETADisplay({
  busLocation = null,
  busLocations = null, // Array for multi-bus scenario
  destination = null,
  refreshInterval = 30000, // 30 seconds
  showDistance = true,
  showBusInfo = false,
  className = ''
}) {
  const [eta, setEta] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const [nearestBusIndex, setNearestBusIndex] = useState(null)

  // Calculate ETA
  const calculateETA = useCallback(async () => {
    if (!destination) {
      setError('Destino no seleccionado')
      return
    }

    const hasBusLocation = busLocation && (busLocation.latitude || busLocation.lat)
    const hasBusLocations = busLocations && busLocations.length > 0

    if (!hasBusLocation && !hasBusLocations) {
      setError('Ubicación del bus no disponible')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let routeData

      // Multi-bus scenario: find nearest bus
      if (hasBusLocations && busLocations.length > 1) {
        const normalizedBuses = busLocations.map(bus => ({
          latitude: bus.latitude || bus.lat,
          longitude: bus.longitude || bus.lng
        }))

        const result = await findNearestBus(normalizedBuses, destination)
        routeData = result
        setNearestBusIndex(result.busIndex)
      } else {
        // Single bus scenario
        const origin = busLocation || (busLocations && busLocations[0])
        const normalizedOrigin = {
          latitude: origin.latitude || origin.lat,
          longitude: origin.longitude || origin.lng
        }

        routeData = await computeRoute(normalizedOrigin, destination)
        setNearestBusIndex(null)
      }

      setEta(routeData)
      setLastUpdateTime(new Date())
    } catch (err) {
      console.error('Error calculating ETA:', err)
      setError(err.message || 'Error al calcular ETA')
      setEta(null)
    } finally {
      setIsLoading(false)
    }
  }, [busLocation, busLocations, destination])

  // Initial calculation and auto-refresh
  useEffect(() => {
    calculateETA()

    // Set up interval for auto-refresh
    const interval = setInterval(calculateETA, refreshInterval)

    return () => clearInterval(interval)
  }, [calculateETA, refreshInterval])

  if (!destination) {
    return (
      <div className={`p-4 bg-dark-700 border-2 border-dashed border-neon-500 rounded-lg text-center text-gray-400 ${className}`}>
        Selecciona un destino para ver el ETA
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main ETA Card */}
      <div className="bg-dark-700 border-2 border-neon-500 rounded-lg p-4" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
        {isLoading && !eta ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin mb-2">
              <div className="w-6 h-6 border-2 border-neon-500 border-t-transparent rounded-full" />
            </div>
            <p className="text-gray-400 text-sm">Calculando ETA...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={calculateETA}
              className="mt-2 px-3 py-1 text-xs bg-red-900 text-red-200 rounded hover:bg-red-800 transition"
            >
              Reintentar
            </button>
          </div>
        ) : eta ? (
          <>
            {/* Nearest Bus Info (Multi-bus) */}
            {nearestBusIndex !== null && showBusInfo && (
              <div className="mb-3 pb-3 border-b border-dark-600">
                <p className="text-gray-400 text-xs">Bus más cercano</p>
                <p className="text-neon-500 font-semibold">Bus #{nearestBusIndex + 1}</p>
              </div>
            )}

            {/* ETA Display */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <div>
                <p className="text-gray-400 text-xs mb-1">Tiempo estimado</p>
                <p className="text-neon-500 text-2xl font-bold">{eta.etaFormatted || eta.durationFormatted}</p>
              </div>

              {/* Distance */}
              {showDistance && (
                <div>
                  <p className="text-gray-400 text-xs mb-1">Distancia</p>
                  <p className="text-neon-500 text-2xl font-bold">{eta.distanceFormatted}</p>
                </div>
              )}
            </div>

            {/* Destination Info */}
            <div className="mt-4 pt-4 border-t border-dark-600">
              <p className="text-gray-400 text-xs mb-1">Destino</p>
              <p className="text-white truncate" title={destination.displayName || destination.address}>
                {destination.displayName || destination.address}
              </p>
            </div>

            {/* Last Update Time */}
            {lastUpdateTime && (
              <div className="mt-2 text-right">
                <p className="text-gray-500 text-xs">
                  Actualizado hace {Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000)}s
                </p>
              </div>
            )}

            {/* Refresh indicator */}
            {isLoading && (
              <div className="absolute top-2 right-2 animate-pulse">
                <div className="w-2 h-2 bg-neon-500 rounded-full" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-400">
            No hay datos disponibles
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="text-xs text-gray-500 text-center">
        Se actualiza cada {Math.round(refreshInterval / 1000)} segundos
      </div>
    </div>
  )
}

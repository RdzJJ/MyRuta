/**
 * MyRuta Web - LocationContext
 * 
 * Responsibilities:
 * - Global location state
 * - Bus locations for all routes
 * - Location updates via WebSockets
 */

import { createContext, useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'

export const LocationContext = createContext()

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState({})
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    // Subscribe to location updates
    socket.on('location:update', (data) => {
      setLocations((prev) => ({
        ...prev,
        [data.conductorId]: {
          routeId: data.routeId,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          timestamp: data.timestamp
        }
      }))
    })

    return () => {
      socket.off('location:update')
    }
  }, [socket])

  return (
    <LocationContext.Provider value={{ locations }}>
      {children}
    </LocationContext.Provider>
  )
}

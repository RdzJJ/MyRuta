/**
 * MyRuta Web - Live Map Component
 * 
 * Responsibilities:
 * - Display Google Map with dark/neon theme
 * - Show bus locations
 * - Show route stops
 */

import { useState, useEffect } from 'react'

export default function LiveMap({ routeId = null }) {
  const [map, setMap] = useState(null)
  const [locations, setLocations] = useState([])

  useEffect(() => {
    // TODO: Initialize Google Map
    // TODO: Subscribe to Socket.io location updates
  }, [routeId])

  if (!map) {
    return (
      <div className="w-full h-96 bg-dark-800 border-2 border-neon-500 rounded-lg flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
        <div className="text-center">
          <p className="text-4xl mb-2">🗺️</p>
          <p className="text-neon-500">Cargando mapa en tiempo real...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-dark-800 border-2 border-neon-500 rounded-lg overflow-hidden" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
      {/* Google Map will be rendered here */}
      <div id="map" className="w-full h-full"></div>
    </div>
  )
}

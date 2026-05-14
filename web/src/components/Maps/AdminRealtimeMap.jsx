/**
 * MyRuta Web - Admin Real-Time Map Component
 * 
 * Features:
 * - Display routes as polylines with custom colors
 * - Show buses as markers in real-time
 * - Route selector dropdown
 * - Bus info window with conductor, trip details, and ETA
 * - Dark theme with neon green accents
 * - Real-time ETA updates every 60 seconds
 */

import { useState, useEffect, useRef } from 'react'
import {
  getRutas,
  subscribeToBuses,
  getConductor,
  getBusesByRuta,
  getRutaById
} from '../../services/firestoreService'
import { getETA, formatETA } from '../../services/etaService'

const MEDELLIN_CENTER = {
  lat: 6.2442,
  lng: -75.5812
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#aaa' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1a3d1a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212121' }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#3d3d3d' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#4d4d4d' }]
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#3d3d3d' }]
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d2d' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1a2a3a' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666' }]
  }
]

let googleMapsLoaded = false
let googleMapsScript = null

export default function AdminRealtimeMap() {
  const [map, setMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rutas, setRutas] = useState([])
  const [selectedRutaId, setSelectedRutaId] = useState(null)
  const [buses, setBuses] = useState([])
  const [polylines, setPolylines] = useState([])
  const [busMarkers, setBusMarkers] = useState([])
  const [infoWindows, setInfoWindows] = useState([])
  const [etas, setEtas] = useState({}) // Store ETAs by bus_id

  const mapRef = useRef(null)
  const unsubscribeRef = useRef(null)
  const etaIntervalRef = useRef(null)

  // Load Google Maps script
  useEffect(() => {
    if (googleMapsLoaded || googleMapsScript) {
      if (window.google?.maps) {
        setIsLoading(false)
      }
      return
    }

    googleMapsScript = document.createElement('script')
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    googleMapsScript.async = true
    googleMapsScript.defer = true
    googleMapsScript.onload = () => {
      googleMapsLoaded = true
      setIsLoading(false)
    }
    googleMapsScript.onerror = () => {
      console.error('Failed to load Google Maps API')
      setIsLoading(false)
    }
    document.head.appendChild(googleMapsScript)
  }, [])

  // Initialize map
  useEffect(() => {
    if (isLoading || map) return

    const mapContainer = document.getElementById('admin-realtime-map')
    if (!mapContainer || !window.google?.maps) return

    const newMap = new window.google.maps.Map(mapContainer, {
      center: MEDELLIN_CENTER,
      zoom: 13,
      styles: DARK_MAP_STYLE,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false
    })

    mapRef.current = newMap
    setMap(newMap)
  }, [isLoading, map])

  // Load routes
  useEffect(() => {
    const loadRutas = async () => {
      const data = await getRutas()
      setRutas(data)
      if (data.length > 0) {
        setSelectedRutaId(data[0].id)
      }
    }
    loadRutas()
  }, [])

  // Subscribe to real-time bus updates
  useEffect(() => {
    if (!map) return

    const unsubscribe = subscribeToBuses((updatedBuses) => {
      setBuses(updatedBuses)
    })

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [map])

  // Draw route polylines
  useEffect(() => {
    if (!map || rutas.length === 0) return

    // Clear existing polylines
    polylines.forEach((pl) => pl.setMap(null))

    const newPolylines = []

    // Draw all routes or filter by selected route
    const routesToDraw = selectedRutaId
      ? rutas.filter((r) => r.id === selectedRutaId)
      : rutas

    routesToDraw.forEach((ruta) => {
      if (ruta.waypoints && ruta.waypoints.length > 1) {
        const polyline = new window.google.maps.Polyline({
          path: ruta.waypoints,
          geodesic: true,
          strokeColor: ruta.color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map,
          title: ruta.name
        })
        newPolylines.push(polyline)
      }
    })

    setPolylines(newPolylines)

    // Auto zoom if route selected
    if (selectedRutaId && routesToDraw.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      routesToDraw[0].waypoints.forEach((point) => {
        bounds.extend({ lat: point.lat, lng: point.lng })
      })
      map.fitBounds(bounds, 100)
    }
  }, [map, rutas, selectedRutaId])

  // Update ETAs when buses or selected route changes
  useEffect(() => {
    if (!buses || buses.length === 0 || !rutas.length) {
      setEtas({})
      return
    }

    // Get the selected route or all routes
    const routesToCheck = selectedRutaId
      ? rutas.filter((r) => r.id === selectedRutaId)
      : rutas

    // Calculate ETAs for buses in selected route(s)
    const busesToCheck = selectedRutaId
      ? buses.filter((b) => b.rutaAsignada === selectedRutaId)
      : buses

    const updateETAs = async () => {
      const etasMap = {}

      for (const bus of busesToCheck) {
        const ruta = routesToCheck.find((r) => r.id === bus.rutaAsignada)
        if (ruta && ruta.waypoints) {
          try {
            const eta = await getETA(bus, ruta.waypoints)
            if (eta) {
              etasMap[bus.id] = {
                duration_minutes: eta.duration_minutes,
                estimated_arrival: eta.estimated_arrival,
                formatted: formatETA(eta),
                source: eta.source
              }
            }
          } catch (error) {
            console.warn(`Error calculating ETA for bus ${bus.placa}:`, error)
          }
        }
      }

      setEtas(etasMap)
    }

    // Initial update
    updateETAs()

    // Update ETAs every 60 seconds
    etaIntervalRef.current = setInterval(updateETAs, 60000)

    return () => {
      if (etaIntervalRef.current) {
        clearInterval(etaIntervalRef.current)
      }
    }
  }, [buses, rutas, selectedRutaId])

  // Update bus markers
  useEffect(() => {
    if (!map) return

    // Clear existing markers and info windows
    busMarkers.forEach((marker) => marker.setMap(null))
    infoWindows.forEach((infoWindow) => infoWindow.close())

    const newMarkers = []
    const newInfoWindows = []

    // Filter buses by selected route
    const busesToShow = selectedRutaId
      ? buses.filter((bus) => bus.rutaAsignada === selectedRutaId)
      : buses

    busesToShow.forEach((bus) => {
      const conductor = getConductor(bus.conductorId)

      const marker = new window.google.maps.Marker({
        position: { lat: bus.lat, lng: bus.lng },
        map,
        title: bus.placa,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#00FF41',
          fillOpacity: 0.9,
          strokeColor: '#00AA00',
          strokeWeight: 2
        }
      })

      const infoWindowContent = document.createElement('div')
      infoWindowContent.style.cssText = `
        color: #00FF41;
        font-family: 'Courier New', monospace;
        padding: 12px;
        background: #1a1a1a;
        border: 2px solid #00FF41;
        border-radius: 4px;
        font-size: 12px;
        max-width: 280px;
      `
      
      const ruta = rutas.find((r) => r.id === bus.rutaAsignada)
      const eta = etas[bus.id]
      
      infoWindowContent.innerHTML = `
        <div style="line-height: 1.8;">
          <strong style="font-size: 14px;">🚌 ${bus.placa}</strong><br/>
          <hr style="border: none; border-top: 1px solid #00FF41; margin: 8px 0;"/>
          <div><strong>Conductor:</strong> ${conductor ? `${conductor.nombre} ${conductor.apellido}` : 'N/A'}</div>
          <div><strong>Ruta:</strong> ${ruta?.name || 'N/A'}</div>
          <div><strong>Viajes:</strong> ${conductor?.numeroDeViajes || '0'}</div>
          <div><strong>Velocidad:</strong> ${bus.velocidad.toFixed(1)} km/h</div>
          ${eta ? `<div style="color: #00AAFF; margin-top: 8px; padding-top: 8px; border-top: 1px solid #00FF41;"><strong>⏱️ ETA:</strong> ${eta.formatted}</div>` : ''}
          <div style="font-size: 10px; color: #888; margin-top: 4px;">Actualizado: ${new Date(bus.timestamp).toLocaleTimeString()}</div>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent
      })

      marker.addListener('click', () => {
        // Close all info windows
        newInfoWindows.forEach((iw) => iw.close())
        infoWindow.open(map, marker)
      })

      newMarkers.push(marker)
      newInfoWindows.push(infoWindow)
    })

    setBusMarkers(newMarkers)
    setInfoWindows(newInfoWindows)
  }, [map, buses, selectedRutaId, rutas, etas])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
        <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
          🗺️ Mapa en Tiempo Real - Buses y Rutas
        </h2>

        {/* Route Selector */}
        <div className="flex gap-4 items-center">
          <label className="text-neon-500 font-semibold">Seleccionar Ruta:</label>
          <select
            value={selectedRutaId || ''}
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

      {/* Map Container */}
      <div
        className="relative w-full h-screen bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden"
        style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)', maxHeight: '600px' }}
      >
        <div
          id="admin-realtime-map"
          className="w-full h-full bg-dark-700"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-800 bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <div className="w-8 h-8 border-3 border-neon-500 border-t-transparent rounded-full" />
              </div>
              <p className="text-neon-500">Cargando mapa...</p>
            </div>
          </div>
        )}

        {/* Bus Count Badge */}
        <div
          className="absolute top-4 left-4 bg-dark-800 border-2 border-neon-500 rounded-lg px-4 py-2 z-20"
          style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}
        >
          <p className="text-neon-500 font-bold">
            🚌 Buses en línea: {selectedRutaId ? buses.filter((b) => b.rutaAsignada === selectedRutaId).length : buses.length}
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-4" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
        <p className="text-neon-500 text-sm">
          ✓ Haz clic en los marcadores 🚌 para ver detalles del conductor y del viaje. Las posiciones se actualizan en tiempo real cada 2 segundos.
        </p>
      </div>
    </div>
  )
}

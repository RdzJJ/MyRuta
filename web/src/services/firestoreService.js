/**
 * MyRuta Web - Firestore Service
 * 
 * Responsibilities:
 * - Real-time bus tracking (GPS locations)
 * - Routes and waypoints management
 * - Conductor information
 * - Travel history and statistics
 * - Uses Firebase Realtime Database simulation for now
 */

import axios from 'axios'

/**
 * Mock data service - simulates Firestore data
 * In production, this would connect to actual Firestore
 */

// Routes with waypoints and colors
export const mockRoutes = [
  {
    id: 'ruta_001',
    name: 'Centro - Norte',
    code: 'R001',
    color: '#00FF41',
    status: 'active',
    waypoints: [
      { lat: 6.2442, lng: -75.5812 },
      { lat: 6.2500, lng: -75.5800 },
      { lat: 6.2600, lng: -75.5750 },
      { lat: 6.2700, lng: -75.5700 },
      { lat: 6.2800, lng: -75.5650 }
    ]
  },
  {
    id: 'ruta_002',
    name: 'Este - Oeste',
    code: 'R002',
    color: '#00AAFF',
    status: 'active',
    waypoints: [
      { lat: 6.2442, lng: -75.6000 },
      { lat: 6.2450, lng: -75.5900 },
      { lat: 6.2460, lng: -75.5800 },
      { lat: 6.2470, lng: -75.5700 }
    ]
  },
  {
    id: 'ruta_003',
    name: 'Sur - Centro',
    code: 'R003',
    color: '#FF00FF',
    status: 'active',
    waypoints: [
      { lat: 6.2000, lng: -75.5812 },
      { lat: 6.2100, lng: -75.5812 },
      { lat: 6.2200, lng: -75.5812 },
      { lat: 6.2442, lng: -75.5812 }
    ]
  }
]

// Mock buses with real-time location data
export const mockBuses = [
  {
    id: 'bus_001',
    placa: 'ABC-1234',
    rutaAsignada: 'ruta_001',
    conductorId: 'conductor_001',
    lat: 6.2500,
    lng: -75.5800,
    velocidad: 45,
    timestamp: Date.now()
  },
  {
    id: 'bus_002',
    placa: 'DEF-5678',
    rutaAsignada: 'ruta_001',
    conductorId: 'conductor_002',
    lat: 6.2600,
    lng: -75.5750,
    velocidad: 35,
    timestamp: Date.now()
  },
  {
    id: 'bus_003',
    placa: 'GHI-9012',
    rutaAsignada: 'ruta_002',
    conductorId: 'conductor_003',
    lat: 6.2450,
    lng: -75.5900,
    velocidad: 50,
    timestamp: Date.now()
  },
  {
    id: 'bus_004',
    placa: 'JKL-3456',
    rutaAsignada: 'ruta_003',
    conductorId: 'conductor_004',
    lat: 6.2200,
    lng: -75.5812,
    velocidad: 40,
    timestamp: Date.now()
  }
]

// Mock conductors
export const mockConductors = {
  conductor_001: {
    id: 'conductor_001',
    nombre: 'Carlos',
    apellido: 'Gómez',
    numeroDeViajes: 156,
    rutaAsignada: 'ruta_001',
    placaBusAsignado: 'ABC-1234'
  },
  conductor_002: {
    id: 'conductor_002',
    nombre: 'Juan',
    apellido: 'Pérez',
    numeroDeViajes: 142,
    rutaAsignada: 'ruta_001',
    placaBusAsignado: 'DEF-5678'
  },
  conductor_003: {
    id: 'conductor_003',
    nombre: 'Miguel',
    apellido: 'López',
    numeroDeViajes: 89,
    rutaAsignada: 'ruta_002',
    placaBusAsignado: 'GHI-9012'
  },
  conductor_004: {
    id: 'conductor_004',
    nombre: 'Fernando',
    apellido: 'Rodríguez',
    numeroDeViajes: 203,
    rutaAsignada: 'ruta_003',
    placaBusAsignado: 'JKL-3456'
  }
}

// Mock travel history
export const mockHistorialRecorridos = [
  {
    id: 'hist_001',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
    busPlaca: 'ABC-1234',
    conductor: 'Carlos Gómez',
    ruta: 'Centro - Norte',
    tiempoReal: '45 min',
    tiempoEstimado: '42 min',
    diferencia: '+3 min'
  },
  {
    id: 'hist_002',
    fecha: new Date(Date.now() - 1 * 60 * 60 * 1000),
    busPlaca: 'DEF-5678',
    conductor: 'Juan Pérez',
    ruta: 'Centro - Norte',
    tiempoReal: '40 min',
    tiempoEstimado: '42 min',
    diferencia: '-2 min'
  },
  {
    id: 'hist_003',
    fecha: new Date(Date.now() - 30 * 60 * 1000),
    busPlaca: 'GHI-9012',
    conductor: 'Miguel López',
    ruta: 'Este - Oeste',
    tiempoReal: '28 min',
    tiempoEstimado: '25 min',
    diferencia: '+3 min'
  },
  {
    id: 'hist_004',
    fecha: new Date(Date.now() - 15 * 60 * 1000),
    busPlaca: 'JKL-3456',
    conductor: 'Fernando Rodríguez',
    ruta: 'Sur - Centro',
    tiempoReal: '52 min',
    tiempoEstimado: '50 min',
    diferencia: '+2 min'
  }
]

/**
 * Get all routes
 */
export async function getRutas() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRoutes)
    }, 100)
  })
}

/**
 * Get all active buses
 */
export async function getBuses() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBuses)
    }, 100)
  })
}

/**
 * Subscribe to real-time bus updates
 * Simulates Firestore onSnapshot
 */
export function subscribeToBuses(callback) {
  // Simulate real-time updates every 2 seconds
  const updateInterval = setInterval(() => {
    const updatedBuses = mockBuses.map((bus) => {
      // Simulate slight position changes
      const variation = 0.0005
      return {
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * variation,
        lng: bus.lng + (Math.random() - 0.5) * variation,
        velocidad: 30 + Math.random() * 30,
        timestamp: Date.now()
      }
    })
    callback(updatedBuses)
  }, 2000)

  // Return unsubscribe function
  return () => clearInterval(updateInterval)
}

/**
 * Get conductor information
 */
export function getConductor(conductorId) {
  return mockConductors[conductorId] || null
}

/**
 * Get travel history with optional filtering
 */
export async function getHistorialRecorridos(rutaId = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!rutaId) {
        resolve(mockHistorialRecorridos)
        return
      }

      const ruta = mockRoutes.find((r) => r.id === rutaId)
      if (!ruta) {
        resolve([])
        return
      }

      const filtered = mockHistorialRecorridos.filter(
        (h) => h.ruta === ruta.name
      )
      resolve(filtered)
    }, 100)
  })
}

/**
 * Get ETA for a bus to destination
 * Uses Google Routes API
 */
export async function calculateETA(busLocation, destination) {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not configured')
      return null
    }

    const response = await axios.post(
      `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`,
      {
        origin: {
          location: {
            latLng: {
              latitude: busLocation.lat,
              longitude: busLocation.lng
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng
            }
          }
        },
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: new Date().toISOString()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey
        }
      }
    )

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0]
      const legsDuration = route.legs.reduce(
        (sum, leg) => sum + parseInt(leg.duration.replace(/s/, ''), 10),
        0
      )
      return Math.ceil(legsDuration / 60) // Convert to minutes
    }

    return null
  } catch (error) {
    console.error('Error calculating ETA:', error)
    return null
  }
}

/**
 * Get all buses for a specific route
 */
export async function getBusesByRuta(rutaId) {
  const buses = await getBuses()
  return buses.filter((bus) => bus.rutaAsignada === rutaId)
}

/**
 * Get route information by ID
 */
export async function getRutaById(rutaId) {
  const rutas = await getRutas()
  return rutas.find((r) => r.id === rutaId) || null
}

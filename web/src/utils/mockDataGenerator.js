/**
 * MyRuta Web - Mock Data Generator
 * 
 * Herramientas para generar y testear datos en desarrollo
 * Usa esto para simular buses moviendo en tiempo real
 */

import { mockBuses, mockRoutes, mockConductors } from './firestoreService'

/**
 * Simular movimiento realista de un bus a lo largo de su ruta
 * @param {string} busId - ID del bus
 * @param {number} speed - Velocidad en km/h
 * @returns {Object} Nueva ubicación del bus
 */
export function simulateBusMovement(busId, speed = 40) {
  const bus = mockBuses.find((b) => b.id === busId)
  if (!bus) return null

  const ruta = mockRoutes.find((r) => r.id === bus.rutaAsignada)
  if (!ruta || !ruta.waypoints || ruta.waypoints.length === 0) return null

  // Simular movimiento entre waypoints
  const waypoints = ruta.waypoints
  const currentIndex = Math.floor(Math.random() * (waypoints.length - 1))
  const currentWaypoint = waypoints[currentIndex]
  const nextWaypoint = waypoints[currentIndex + 1]

  // Interpolación lineal entre puntos
  const progress = Math.random()
  const lat = currentWaypoint.lat + (nextWaypoint.lat - currentWaypoint.lat) * progress
  const lng = currentWaypoint.lng + (nextWaypoint.lng - currentWaypoint.lng) * progress

  return {
    ...bus,
    lat,
    lng,
    velocidad: speed + (Math.random() - 0.5) * 10, // Variación de ±5 km/h
    timestamp: Date.now()
  }
}

/**
 * Generar múltiples buses en rutas aleatorias
 * @param {number} count - Cantidad de buses a generar
 * @returns {Array} Array de buses
 */
export function generateRandomBuses(count = 10) {
  const buses = []
  const routes = mockRoutes.filter((r) => r.status === 'active')

  for (let i = 0; i < count; i++) {
    const ruta = routes[Math.floor(Math.random() * routes.length)]
    const waypoint = ruta.waypoints[Math.floor(Math.random() * ruta.waypoints.length)]

    buses.push({
      id: `bus_mock_${i}`,
      placa: `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i / 26) | 0))}${String(1000 + i).slice(-4)}`,
      rutaAsignada: ruta.id,
      conductorId: `conductor_${(i % 4) + 1}`,
      lat: waypoint.lat + (Math.random() - 0.5) * 0.01,
      lng: waypoint.lng + (Math.random() - 0.5) * 0.01,
      velocidad: 30 + Math.random() * 40,
      timestamp: Date.now()
    })
  }

  return buses
}

/**
 * Generar historial de recorridos para una fecha
 * @param {Date} date - Fecha del historial
 * @param {number} count - Cantidad de registros
 * @returns {Array} Array de registros
 */
export function generateHistorialForDate(date, count = 20) {
  const historial = []

  for (let i = 0; i < count; i++) {
    const bus = mockBuses[i % mockBuses.length]
    const ruta = mockRoutes.find((r) => r.id === bus.rutaAsignada)
    const conductor = mockConductors[bus.conductorId]

    const tiempoEstimado = 30 + Math.random() * 40
    const variacion = (Math.random() - 0.5) * 10
    const tiempoReal = tiempoEstimado + variacion

    historial.push({
      id: `hist_${Date.now()}_${i}`,
      fecha: new Date(date.getTime() - Math.random() * 24 * 60 * 60 * 1000),
      busPlaca: bus.placa,
      conductor: `${conductor.nombre} ${conductor.apellido}`,
      ruta: ruta.name,
      tiempoReal: `${Math.round(tiempoReal)} min`,
      tiempoEstimado: `${Math.round(tiempoEstimado)} min`,
      diferencia: `${variacion > 0 ? '+' : ''}${Math.round(variacion)} min`
    })
  }

  return historial.sort((a, b) => b.fecha - a.fecha)
}

/**
 * Exportar mock data como JSON (para testing)
 * @returns {string} JSON string
 */
export function exportMockDataAsJSON() {
  return JSON.stringify(
    {
      rutas: mockRoutes,
      buses: mockBuses,
      conductores: mockConductors,
      generatedAt: new Date().toISOString()
    },
    null,
    2
  )
}

/**
 * Validar que los datos mock sean válidos
 * @returns {Object} Reporte de validación
 */
export function validateMockData() {
  const report = {
    valid: true,
    errors: [],
    warnings: []
  }

  // Validar rutas
  mockRoutes.forEach((ruta) => {
    if (!ruta.id || !ruta.name || !ruta.waypoints) {
      report.errors.push(`Ruta ${ruta.code} incompleta`)
      report.valid = false
    }
    if (ruta.waypoints.length < 2) {
      report.warnings.push(`Ruta ${ruta.code} tiene menos de 2 waypoints`)
    }
  })

  // Validar buses
  mockBuses.forEach((bus) => {
    if (!bus.id || !bus.placa || !bus.rutaAsignada) {
      report.errors.push(`Bus ${bus.placa} incompleto`)
      report.valid = false
    }

    const rutaExists = mockRoutes.find((r) => r.id === bus.rutaAsignada)
    if (!rutaExists) {
      report.warnings.push(`Bus ${bus.placa} referencia ruta inexistente`)
    }
  })

  // Validar conductores
  mockBuses.forEach((bus) => {
    const conductor = mockConductors[bus.conductorId]
    if (!conductor) {
      report.warnings.push(`Bus ${bus.placa} referencia conductor inexistente`)
    }
  })

  return report
}

/**
 * Imprimir reporte de mock data en consola
 */
export function printMockDataReport() {
  const validation = validateMockData()

  console.group('🧪 Mock Data Report')
  console.log(`✓ Rutas: ${mockRoutes.length}`)
  console.log(`✓ Buses: ${mockBuses.length}`)
  console.log(`✓ Conductores: ${Object.keys(mockConductors).length}`)

  if (validation.valid) {
    console.log('✅ Validación: CORRECTA')
  } else {
    console.error('❌ Validación: ERRORES')
    validation.errors.forEach((err) => console.error(`  - ${err}`))
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Advertencias:')
    validation.warnings.forEach((warn) => console.warn(`  - ${warn}`))
  }

  console.groupEnd()
}

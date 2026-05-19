/**
 * MyRuta Web - Bus Service
 * 
 * Gestiona operaciones CRUD para buses
 * - Listar buses disponibles
 * - Crear nuevos buses
 * - Asignar buses a conductores
 */

import { getBuses, createBus, updateBus, getBusesByRuta } from './firestoreService'

/**
 * Obtener todos los buses disponibles
 */
export async function obtenerBuses() {
  try {
    const buses = await getBuses()
    return buses
  } catch (error) {
    console.error('Error obteniendo buses:', error)
    throw error
  }
}

/**
 * Obtener buses de una ruta específica
 */
export async function obtenerBusesPorRuta(rutaId) {
  try {
    const buses = await getBusesByRuta(rutaId)
    return buses
  } catch (error) {
    console.error('Error obteniendo buses por ruta:', error)
    throw error
  }
}

/**
 * Crear nuevo bus
 * @param {Object} busData - { placa, rutaAsignada, capacidad?, marca?, modelo?, año? }
 * @returns {string} ID del bus creado
 */
export async function crearNuevoBus(busData) {
  const { placa, rutaAsignada, capacidad, marca, modelo, año } = busData

  try {
    // Validar que la placa no esté vacía
    if (!placa || placa.trim().length < 3) {
      throw new Error('La placa del bus debe tener al menos 3 caracteres')
    }

    // Validar que la ruta esté asignada
    if (!rutaAsignada) {
      throw new Error('Debe asignar una ruta al bus')
    }

    const busId = await createBus({
      placa: placa.toUpperCase().trim(),
      rutaAsignada,
      capacidad: capacidad || 45,
      marca: marca || '',
      modelo: modelo || '',
      año: año || new Date().getFullYear(),
      activo: true,
      conductorAsignado: null,
      velocidad: 0,
      lat: 0,
      lng: 0,
      timestamp: Date.now()
    })

    return busId
  } catch (error) {
    console.error('Error creando bus:', error)
    throw error
  }
}

/**
 * Asignar conductor a un bus
 */
export async function asignarConductorAlBus(busId, conductorId) {
  try {
    await updateBus(busId, {
      conductorAsignado: conductorId,
      updatedAt: Date.now()
    })
  } catch (error) {
    console.error('Error asignando conductor al bus:', error)
    throw error
  }
}

/**
 * Validar datos del formulario de nuevo bus
 */
export function validarDatosBus(datos) {
  const errores = []

  if (!datos.placa || datos.placa.trim().length < 3) {
    errores.push('La placa debe tener al menos 3 caracteres')
  }

  if (!datos.rutaAsignada) {
    errores.push('Debe seleccionar una ruta')
  }

  if (datos.capacidad && (datos.capacidad < 1 || datos.capacidad > 100)) {
    errores.push('La capacidad debe estar entre 1 y 100 pasajeros')
  }

  return errores
}

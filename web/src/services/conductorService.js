import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { registerUser } from './authService'
import { getConductores, getConductor } from './firestoreService'
import { subscribeToConductorLocation } from './realtimeService'

/**
 * Crear nuevo conductor
 * - Crea usuario en Firebase Auth
 * - Crea documento en colección 'conductors' de Firestore
 * - Asigna rol 'CONDUCTOR'
 */
export async function crearConductor(conductorData) {
  const { email, password, nombre, telefono, placa, rutaId } = conductorData

  try {
    // Crear usuario en Firebase Auth y documento en Firestore
    const userCredential = await registerUser(email, password, {
      nombre,
      apellido: '',
      rol: 'CONDUCTOR'
    })

    const conductorId = userCredential.uid

    // Crear documento en colección 'conductors' con el uid como ID
    await setDoc(doc(db, 'conductors', conductorId), {
      nombre,
      email,
      telefono,
      placa,
      rutaId,
      activo: true,
      creadoEn: serverTimestamp(),
      numeroDeViajes: 0
    })

    return { id: conductorId, email, nombre }
  } catch (error) {
    console.error('Error creando conductor:', error)
    throw new Error(
      error.code === 'auth/email-already-in-use'
        ? 'El email ya está registrado'
        : 'Error al crear el conductor'
    )
  }
}

/**
 * Obtener lista de todos los conductores
 */
export async function obtenerConductores() {
  try {
    const conductores = await getConductores()
    return conductores
  } catch (error) {
    console.error('Error obteniendo conductores:', error)
    throw error
  }
}

/**
 * Obtener un conductor específico
 */
export async function obtenerConductor(conductorId) {
  try {
    const conductor = await getConductor(conductorId)
    return conductor
  } catch (error) {
    console.error('Error obteniendo conductor:', error)
    throw error
  }
}

/**
 * Actualizar datos del conductor
 */
export async function actualizarConductor(conductorId, datos) {
  try {
    await updateDoc(doc(db, 'conductors', conductorId), {
      ...datos,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error actualizando conductor:', error)
    throw error
  }
}

/**
 * Desactivar conductor (cambiar activo a false)
 */
export async function desactivarConductor(conductorId) {
  try {
    await updateDoc(doc(db, 'conductors', conductorId), {
      activo: false,
      desactivadoEn: serverTimestamp()
    })
  } catch (error) {
    console.error('Error desactivando conductor:', error)
    throw error
  }
}

/**
 * Reactivar conductor
 */
export async function reactivarConductor(conductorId) {
  try {
    await updateDoc(doc(db, 'conductors', conductorId), {
      activo: true,
      reactivadoEn: serverTimestamp()
    })
  } catch (error) {
    console.error('Error reactivando conductor:', error)
    throw error
  }
}

/**
 * Verificar si conductor está activo en tiempo real
 * Retorna true si existe entrada reciente en conductors_location/{conductorId}
 * Se considera reciente si el timestamp es menor a 2 minutos
 */
export function suscribirseAlEstadoEnTiempoReal(conductorId, callback) {
  const DOS_MINUTOS = 2 * 60 * 1000

  return subscribeToConductorLocation(conductorId, (location) => {
    if (!location || !location.timestamp) {
      callback(false)
      return
    }

    const ahora = Date.now()
    const estaActivo = ahora - location.timestamp < DOS_MINUTOS

    callback({
      activo: estaActivo,
      ubicacion: location,
      timestamp: location.timestamp
    })
  })
}

/**
 * Validar datos del formulario de conductor
 */
export function validarDatosConductor(datos) {
  const errores = []

  if (!datos.nombre || datos.nombre.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres')
  }

  if (!datos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.push('Email inválido')
  }

  if (!datos.telefono || datos.telefono.trim().length < 7) {
    errores.push('Teléfono inválido')
  }

  if (!datos.placa || datos.placa.trim().length < 3) {
    errores.push('La placa del bus es requerida')
  }

  if (!datos.rutaId) {
    errores.push('Debe asignar una ruta')
  }

  if (!datos.password || datos.password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres')
  }

  if (datos.password !== datos.passwordConfirm) {
    errores.push('Las contraseñas no coinciden')
  }

  return errores
}

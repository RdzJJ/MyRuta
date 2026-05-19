import { ref, onValue, set, off } from 'firebase/database'
import { realtimeDb } from '../config/firebase'

/**
 * Publicar ubicación del conductor (lo llama la app Flutter, pero
 * aquí lo definimos también para pruebas desde web)
 */
export async function publishLocation(conductorId, locationData) {
  const locationRef = ref(realtimeDb, `conductors_location/${conductorId}`)
  await set(locationRef, {
    lat: locationData.lat,
    lng: locationData.lng,
    velocidad: locationData.velocidad || 0,
    busId: locationData.busId,
    rutaId: locationData.rutaId,
    timestamp: Date.now()
  })
}

/**
 * Suscribirse a la ubicación de UN conductor en tiempo real
 */
export function subscribeToConductorLocation(conductorId, callback) {
  const locationRef = ref(realtimeDb, `conductors_location/${conductorId}`)
  onValue(locationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
  return () => off(locationRef)
}

/**
 * Suscribirse a TODOS los conductores activos en tiempo real
 */
export function subscribeToAllLocations(callback) {
  const locationsRef = ref(realtimeDb, 'conductors_location')
  onValue(locationsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val()
      // Convertir objeto a array con el conductorId incluido
      const locations = Object.entries(data).map(([conductorId, value]) => ({
        conductorId,
        ...value
      }))
      callback(locations)
    } else {
      callback([])
    }
  })
  return () => off(locationsRef)
}
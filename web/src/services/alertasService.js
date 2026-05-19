import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

export const TIPOS_ALERTA = {
  DESVIO: 'DESVIO',
  ACCIDENTE: 'ACCIDENTE',
  MECANICO: 'MECANICO',
  TRAFICO: 'TRAFICO',
  OTRO: 'OTRO'
}

/**
 * Crear alerta (normalmente la llama el conductor desde Flutter,
 * pero la definimos aquí para pruebas y para el admin)
 */
export async function crearAlerta(alertaData) {
  await addDoc(collection(db, 'alertas'), {
    conductorId: alertaData.conductorId,
    busPlaca: alertaData.busPlaca,
    tipo: alertaData.tipo,
    mensaje: alertaData.mensaje,
    lat: alertaData.lat || null,
    lng: alertaData.lng || null,
    timestamp: serverTimestamp(),
    resuelta: false
  })
}

export function detectarDesvio(busLocation, waypoints, umbralMetros = 200) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const distanciaMetros = (p1, p2) => {
    const R = 6371000
    const dLat = toRad(p2.lat - p1.lat)
    const dLng = toRad(p2.lng - p1.lng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const distanciaMinima = Math.min(
    ...waypoints.map((wp) => distanciaMetros(busLocation, wp))
  )

  return distanciaMinima > umbralMetros
}
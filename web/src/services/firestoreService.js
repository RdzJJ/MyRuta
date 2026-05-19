import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// ─── RUTAS ────────────────────────────────────────────────

export async function getRutas() {
  const snap = await getDocs(collection(db, 'rutas'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getRutaById(rutaId) {
  const snap = await getDoc(doc(db, 'rutas', rutaId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createRuta(rutaData) {
  const ref = await addDoc(collection(db, 'rutas'), {
    ...rutaData,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export async function updateRuta(rutaId, data) {
  await updateDoc(doc(db, 'rutas', rutaId), data)
}

export async function getParadasByRuta(rutaId) {
  const snap = await getDocs(collection(db, 'rutas', rutaId, 'paradas'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => a.orden - b.orden)
}

// ─── BUSES ────────────────────────────────────────────────

export async function getBuses() {
  const snap = await getDocs(collection(db, 'buses'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getBusesByRuta(rutaId) {
  const q = query(collection(db, 'buses'), where('rutaAsignada', '==', rutaId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function createBus(busData) {
  const ref = await addDoc(collection(db, 'buses'), {
    ...busData,
    activo: true,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export async function updateBus(busId, data) {
  await updateDoc(doc(db, 'buses', busId), data)
}

// ─── CONDUCTORES ──────────────────────────────────────────

export async function getConductores() {
  const snap = await getDocs(collection(db, 'conductors'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getConductor(conductorId) {
  const snap = await getDoc(doc(db, 'conductors', conductorId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createConductor(conductorData) {
  const ref = await addDoc(collection(db, 'conductors'), {
    ...conductorData,
    activo: true,
    numeroDeViajes: 0,
    createdAt: serverTimestamp()
  })
  return ref.id
}

// ─── ALERTAS ──────────────────────────────────────────────

export async function getAlertas(resuelta = false) {
  const q = query(
    collection(db, 'alertas'),
    where('resuelta', '==', resuelta),
    orderBy('timestamp', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function resolverAlerta(alertaId) {
  await updateDoc(doc(db, 'alertas', alertaId), { resuelta: true })
}

export function subscribeToAlertas(callback) {
  const q = query(
    collection(db, 'alertas'),
    where('resuelta', '==', false),
    orderBy('timestamp', 'desc')
  )
  return onSnapshot(q, snap => {
    const alertas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(alertas)
  })
}

// ─── REAL-TIME (Firestore onSnapshot) ─────────────────────

export function subscribeToBuses(callback) {
  return onSnapshot(collection(db, 'buses'), snap => {
    const buses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(buses)
  })
}

export function subscribeToRutas(callback) {
  return onSnapshot(collection(db, 'rutas'), snap => {
    const rutas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(rutas)
  })
}

// ─── HISTORIAL DE VIAJES ──────────────────────────────────

export async function getHistorialRecorridos(rutaId = null) {
  let q = query(collection(db, 'trips'), orderBy('inicio', 'desc'))
  if (rutaId) {
    q = query(
      collection(db, 'trips'),
      where('rutaId', '==', rutaId),
      orderBy('inicio', 'desc')
    )
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── SUSCRIPCIÓN A CONDUCTORES EN TIEMPO REAL ──────────────

export function subscribeToConductores(callback) {
  return onSnapshot(collection(db, 'conductors'), snap => {
    const conductores = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(conductores)
  })
}
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

/**
 * Login con email y contraseña
 */
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Obtener datos del usuario desde Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid))
  if (!userDoc.exists()) {
    throw new Error('Usuario no encontrado en la base de datos')
  }

  return {
    uid: user.uid,
    email: user.email,
    ...userDoc.data()
  }
}

/**
 * Logout
 */
export async function logout() {
  await signOut(auth)
}

/**
 * Registrar nuevo usuario (solo admin debería llamar esto)
 */
export async function registerUser(email, password, userData) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Guardar datos adicionales en Firestore
  await setDoc(doc(db, 'users', user.uid), {
    email,
    nombre: userData.nombre,
    apellido: userData.apellido || '',
    rol: userData.rol || 'CONDUCTOR',
    createdAt: new Date()
  })

  return user
}

/**
 * Observar cambios en el estado de autenticación
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null)
      return
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        callback({ uid: user.uid, email: user.email, ...userDoc.data() })
      } else {
        callback(null)
      }
    } catch {
      callback(null)
    }
  })
}

/**
 * Obtener usuario actual con su rol
 */
export async function getCurrentUser() {
  const user = auth.currentUser
  if (!user) return null

  const userDoc = await getDoc(doc(db, 'users', user.uid))
  if (!userDoc.exists()) return null

  return { uid: user.uid, email: user.email, ...userDoc.data() }
}
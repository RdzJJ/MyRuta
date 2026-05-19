import 'dotenv/config'
import { adminAuth, adminDb } from '../src/config/firebase.js'

async function createAdmin() {
  const email = 'admin@myruta.com'
  const password = 'Admin123!'

  try {
    // Crear en Firebase Auth
    const user = await adminAuth.createUser({ email, password })
    console.log('✅ Usuario Auth creado:', user.uid)

    // Actualizar documento en Firestore con el UID real
    await adminDb.collection('users').doc(user.uid).set({
      email,
      nombre: 'Administrador',
      rol: 'ADMIN',
      createdAt: new Date()
    })

    // Borrar el doc temporal que creamos antes
    await adminDb.collection('users').doc('admin_001').delete()

    console.log('✅ Admin creado correctamente')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   UID: ${user.uid}`)
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️ El usuario ya existe en Auth')
    } else {
      console.error('❌ Error:', error.message)
    }
  }
}

createAdmin()
import 'dotenv/config'
import { adminDb } from '../src/config/firebase.js'

async function initFirestore() {
  console.log('🚀 Inicializando estructura de Firestore...\n')

  // Ruta de ejemplo
  const rutaRef = adminDb.collection('rutas').doc('ruta_001')
  await rutaRef.set({
    nombre: 'Centro - Norte',
    codigo: 'R001',
    color: '#00FF41',
    status: 'active',
    waypoints: [
      { lat: 6.2442, lng: -75.5812 },
      { lat: 6.2500, lng: -75.5800 },
      { lat: 6.2600, lng: -75.5750 },
      { lat: 6.2700, lng: -75.5700 },
      { lat: 6.2800, lng: -75.5650 }
    ],
    createdAt: new Date()
  })

  // Paradas como subcolección
  const paradas = [
    { nombre: 'Terminal Centro', lat: 6.2442, lng: -75.5812, orden: 1 },
    { nombre: 'Parque Norte',    lat: 6.2600, lng: -75.5750, orden: 2 },
    { nombre: 'Terminal Norte',  lat: 6.2800, lng: -75.5650, orden: 3 }
  ]
  for (const parada of paradas) {
    await rutaRef.collection('paradas').add(parada)
  }
  console.log('✅ Ruta y paradas creadas')

  // Bus de ejemplo
  await adminDb.collection('buses').doc('bus_001').set({
    placa: 'ABC-1234',
    conductorId: '',
    rutaAsignada: 'ruta_001',
    activo: true,
    createdAt: new Date()
  })
  console.log('✅ Bus creado')

  // Admin inicial (luego Auth crea el usuario real)
  await adminDb.collection('users').doc('admin_001').set({
    email: 'admin@myruta.com',
    nombre: 'Administrador',
    rol: 'ADMIN',
    createdAt: new Date()
  })
  console.log('✅ Usuario admin creado')

  console.log('\n🎉 Firestore inicializado correctamente')
}

initFirestore().catch(console.error)
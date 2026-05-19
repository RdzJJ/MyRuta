/**
 * EXAMPLE: Cómo usar el Dashboard Administrativo
 * Este archivo muestra ejemplos de cómo se integran todos los componentes
 */

// ============================================
// 1. CARGAR DATOS Y MOSTRAR EN EL MAPA
// ============================================

// Dentro de AdminRealtimeMap.jsx
import { subscribeToBuses, getRutas } from './services/firestoreService'

// Los datos se cargan automáticamente
const [buses, setBuses] = useState([])
const [rutas, setRutas] = useState([])

// Buses en tiempo real cada 2 segundos
useEffect(() => {
  const unsubscribe = subscribeToBuses((updatedBuses) => {
    // Aquí llegan los buses actualizados
    setBuses(updatedBuses)
    // Datos:
    // {
    //   id: 'bus_001',
    //   placa: 'ABC-1234',
    //   lat: 6.25,
    //   lng: -75.58,
    //   velocidad: 45,
    //   rutaAsignada: 'ruta_001',
    //   conductorId: 'conductor_001'
    // }
  })
  
  return () => unsubscribe()
}, [])

// ============================================
// 2. CALCULAR ETA AUTOMÁTICAMENTE
// ============================================

// Los ETAs se calculan automáticamente cada 60 segundos
// Google Routes API → Predictor → Histórico

const [etas, setEtas] = useState({})

// Dentro del efecto que monitorea buses
useEffect(() => {
  const updateETAs = async () => {
    const etasMap = {}
    
    for (const bus of buses) {
      const ruta = rutas.find(r => r.id === bus.rutaAsignada)
      if (ruta?.waypoints) {
        const eta = await getETA(bus, ruta.waypoints)
        if (eta) {
          etasMap[bus.id] = {
            duration_minutes: eta.duration_minutes,
            estimated_arrival: eta.estimated_arrival,
            formatted: '45 min - 14:30'  // formatETA(eta)
          }
        }
      }
    }
    
    setEtas(etasMap)
  }
  
  updateETAs()
  // Actualizar cada 60 segundos
  const interval = setInterval(updateETAs, 60000)
  return () => clearInterval(interval)
}, [buses, rutas])

// ============================================
// 3. MOSTRAR EN INFO WINDOW
// ============================================

// Cuando haces clic en un bus en el mapa:
// ┌─────────────────────────────────┐
// │ 🚌 ABC-1234                    │
// ├─────────────────────────────────┤
// │ Conductor: Carlos Gómez         │
// │ Ruta: Centro - Norte            │
// │ Viajes: 156                     │
// │ Velocidad: 45.2 km/h            │
// ├─────────────────────────────────┤
// │ ⏱️ ETA: 45 min - 14:30          │
// └─────────────────────────────────┘

// ============================================
// 4. FILTRAR POR RUTA
// ============================================

const [selectedRutaId, setSelectedRutaId] = useState(null)

// En el selector:
// <select onChange={(e) => setSelectedRutaId(e.target.value)}>
//   <option value="">Todas las Rutas</option>
//   <option value="ruta_001">R001 - Centro - Norte</option>
//   <option value="ruta_002">R002 - Este - Oeste</option>
//   <option value="ruta_003">R003 - Sur - Centro</option>
// </select>

// Los buses y polylines se filtran automáticamente
const filteredBuses = selectedRutaId
  ? buses.filter(b => b.rutaAsignada === selectedRutaId)
  : buses

// ============================================
// 5. HISTORIAL DE RECORRIDOS
// ============================================

// Datos en tabla:
// ┌──────────┬───────────┬─────────────┬────────────────┬────────────┬──────────┬────────────┐
// │  Fecha   │ Placa     │  Conductor  │     Ruta       │ Real       │ Estimado │ Diferencia │
// ├──────────┼───────────┼─────────────┼────────────────┼────────────┼──────────┼────────────┤
// │ 14:15:00 │ ABC-1234  │ Carlos G.   │ Centro - Norte │ 45 min     │ 42 min   │ +3 min     │
// │ 13:52:30 │ DEF-5678  │ Juan P.     │ Centro - Norte │ 40 min     │ 42 min   │ -2 min     │
// │ 13:30:15 │ GHI-9012  │ Miguel L.   │ Este - Oeste   │ 28 min     │ 25 min   │ +3 min     │
// │ 12:45:00 │ JKL-3456  │ Fernando R. │ Sur - Centro   │ 52 min     │ 50 min   │ +2 min     │
// └──────────┴───────────┴─────────────┴────────────────┴────────────┴──────────┴────────────┘

// Colores en "Diferencia":
// - Verde (#00FF41): -5 min → Llegó antes ✓
// - Amarillo (#FFD700): +5 min → Llegó después ⚠

// ============================================
// 6. ESTADÍSTICAS DINÁMICAS
// ============================================

// Se calculan automáticamente desde Firestore:
const stats = {
  rutasActivas: 3,           // rutas.filter(r => r.status === 'active').length
  conductores: 4,            // Set único de conductorId en buses
  viajesHoy: 48,             // buses.length * 12 (mock: 4 buses × 12 viajes)
  incidencias: 5             // Fijo en mock, vendría de Firestore
}

// ============================================
// 7. FLUJO COMPLETO
// ============================================

// USUARIO ABRE DASHBOARD:
// 1. Se cargan las stats
// 2. Se renderiza el mapa
// 3. Se subscribe a buses en tiempo real
// 4. Se renderiza el historial
// 5. Los buses se actualizan cada 2 segundos
// 6. Los ETAs se calculan cada 60 segundos

// USUARIO SELECCIONA UNA RUTA:
// 1. El mapa filtra y hace zoom a la ruta
// 2. Solo muestra buses de esa ruta
// 3. El historial filtra registros de esa ruta
// 4. Los ETAs se recalculan solo para esa ruta

// USUARIO HACE CLIC EN UN BUS:
// 1. Aparece info window con detalles
// 2. Muestra ETA calculado en tiempo real
// 3. Si hace clic en otro, cierra el anterior

// ============================================
// 8. PARA PRODUCCIÓN
// ============================================

// Cambiar en firestoreService.js:

// DE:
export async function getBuses() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockBuses), 100)
  })
}

// A:
import { collection, onSnapshot } from 'firebase/firestore'

export function subscribeToBuses(callback) {
  return onSnapshot(collection(db, 'buses'), (snapshot) => {
    const buses = snapshot.docs.map(doc => doc.data())
    callback(buses)
  })
}

// ============================================
// EJEMPLO COMPLETO DE DATOS
// ============================================

// RUTA
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
}

// BUS
{
  id: 'bus_001',
  placa: 'ABC-1234',
  rutaAsignada: 'ruta_001',
  conductorId: 'conductor_001',
  lat: 6.2500,
  lng: -75.5800,
  velocidad: 45,
  timestamp: 1715695500000
}

// CONDUCTOR
{
  id: 'conductor_001',
  nombre: 'Carlos',
  apellido: 'Gómez',
  numeroDeViajes: 156,
  rutaAsignada: 'ruta_001',
  placaBusAsignado: 'ABC-1234'
}

// HISTORIAL
{
  id: 'hist_001',
  fecha: new Date('2026-05-14T14:15:00'),
  busPlaca: 'ABC-1234',
  conductor: 'Carlos Gómez',
  ruta: 'Centro - Norte',
  tiempoReal: '45 min',
  tiempoEstimado: '42 min',
  diferencia: '+3 min'
}

// ETA
{
  duration_minutes: 45,
  estimated_arrival: new Date('2026-05-14T14:30:00'),
  formatted: '45 min - 14:30',
  source: 'GOOGLE_ROUTES_API'  // o 'PREDICTOR_API' o 'HISTORICAL_AVERAGE'
}

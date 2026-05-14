/**
 * MyRuta Web - Admin Dashboard Page
 * 
 * Features:
 * - Real-time map with buses and routes
 * - Travel history with filtering
 * - System statistics and quick actions
 */

import { useState, useEffect } from 'react'
import AdminRealtimeMap from '../../components/Maps/AdminRealtimeMap'
import HistorialRecorridos from '../../components/admin/HistorialRecorridos'
import { getBuses, getRutas } from '../../services/firestoreService'

export default function Dashboard() {
  const [stats, setStats] = useState({
    rutasActivas: 0,
    conductores: 0,
    viajesHoy: 0,
    incidencias: 5
  })

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const [buses, rutas] = await Promise.all([getBuses(), getRutas()])
      
      const rutasActivas = rutas.filter((r) => r.status === 'active').length
      const conductoresSet = new Set(buses.map((b) => b.conductorId))
      
      setStats({
        rutasActivas,
        conductores: conductoresSet.size,
        viajesHoy: buses.length * 12, // Mock: 12 viajes por bus
        incidencias: 5
      })
    }

    loadStats()
  }, [])

  const statsCards = [
    { label: 'Rutas Activas', value: stats.rutasActivas, icon: '🛣️' },
    { label: 'Conductores', value: stats.conductores, icon: '👨‍✈️' },
    { label: 'Viajes Hoy', value: stats.viajesHoy, icon: '🚌' },
    { label: 'Incidencias', value: stats.incidencias, icon: '⚠️' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            📊 Dashboard Administrativo
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 hover:shadow-lg transition transform hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-neon-500 opacity-75 text-sm font-semibold mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-neon-500" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Real-Time Map Section */}
        <div className="mb-8">
          <AdminRealtimeMap />
        </div>

        {/* Travel History Section */}
        <div className="mb-8">
          <HistorialRecorridos />
        </div>

        {/* System Statistics */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 mb-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            📈 Información del Sistema
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-neon-500 to-transparent mb-6"></div>
          
          <div className="space-y-4">
            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ <strong>Mapa en Tiempo Real:</strong> Visualiza todos los buses y rutas activas con actualizaciones cada 2 segundos.
              </p>
            </div>
            
            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ <strong>Historial de Recorridos:</strong> Consulta el desempeño de cada bus, conductor y ruta con comparativas de tiempos estimados vs reales.
              </p>
            </div>

            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ <strong>Filtros Inteligentes:</strong> Selecciona rutas específicas para ver solo buses y registros de esa ruta.
              </p>
            </div>

            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ <strong>Información de Conductores:</strong> Haz clic en los buses del mapa para ver detalles del conductor, número de viajes y rutas asignadas.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['📝 Crear Nueva Ruta', '👥 Gestionar Conductores', '📊 Ver Reportes'].map((action, idx) => (
            <button
              key={idx}
              className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-4 px-6 rounded-xl hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
              style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }}
            >
              {action}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

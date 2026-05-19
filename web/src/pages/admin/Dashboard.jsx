import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LiveMapPage from '../../pages/admin/LiveMap'           // ← INTEGRADO
import HistorialRecorridos from '../../components/admin/HistorialRecorridos'
import { getBuses, getRutas } from '../../services/firestoreService'

export default function Dashboard() {
  const [buses, setBuses] = useState([])
  const navigate = useNavigate()
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
      setBuses(buses)

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
    { label: 'Buses Activos', value: buses.length, icon: '🚌' },
    { label: 'Incidencias', value: stats.incidencias, icon: '⚠️' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-5xl font-bold text-neon-500 mb-2"
            style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}
          >
            Dashboard Administrativo
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent" />
        </div>

        {/* ── 1. MAPA EN VIVO (primero) ─────────────────────────────────────── */}
        {/*
          LiveMapPage tiene su propio layout (min-h-screen + padding).
          Lo envolvemos en un contenedor que anula esos estilos para que
          quede embebido limpiamente dentro del dashboard.
        */}
        <div className="mb-8 [&>div]:min-h-0 [&>div]:p-0 [&>div>main]:px-0 [&>div>main]:py-0 [&>div>main]:max-w-none">
          <LiveMapPage />
        </div>

        {/* ── 2. Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 hover:shadow-lg transition transform hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-neon-500 opacity-75 text-sm font-semibold mb-2">{stat.label}</p>
              <p
                className="text-4xl font-bold text-neon-500"
                style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── 3. Historial de Recorridos ────────────────────────────────────── */}
        <div className="mb-8">
          <HistorialRecorridos />
        </div>

        {/* ── 4. Acciones Rápidas ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/admin/buses')}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-4 px-6 rounded-xl hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }}
          >
            Gestionar Buses
          </button>
          <button
            onClick={() => navigate('/admin/rutas')}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-4 px-6 rounded-xl hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }}
          >
            Gestionar Rutas
          </button>
          <button
            onClick={() => navigate('/admin/conductores')}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-4 px-6 rounded-xl hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }}
          >
            Gestionar Conductores
          </button>
          <button
            onClick={() => navigate('/admin/reportes')}
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-4 px-6 rounded-xl hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }}
          >
            Ver Reportes
          </button>
        </div>
      </main>
    </div>
  )
}

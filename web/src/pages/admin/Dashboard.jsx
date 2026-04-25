/**
 * MyRuta Web - Admin Dashboard Page
 */

export default function Dashboard() {
  const stats = [
    { label: 'Rutas Activas', value: '12', icon: '🛣️' },
    { label: 'Conductores', value: '28', icon: '👨‍✈️' },
    { label: 'Viajes Hoy', value: '342', icon: '🚌' },
    { label: 'Incidencias', value: '5', icon: '⚠️' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            📊 Dashboard Administrativo
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
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

        {/* Main Content Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            📈 Estadísticas del Sistema
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-neon-500 to-transparent mb-6"></div>
          
          <div className="space-y-4">
            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ Los gráficos y estadísticas detalladas se mostrarán aquí cuando se implemente el backend de analytics.
              </p>
            </div>
            
            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ Disponible: Lista de rutas, conductores, viajes y reportes en tiempo real.
              </p>
            </div>

            <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500">
                ✓ Navega usando los botones del sidebar para acceder a funciones específicas.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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

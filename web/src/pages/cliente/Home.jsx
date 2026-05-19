/**
 * MyRuta Web - Cliente Home Page
 */

import { useNavigate } from 'react-router-dom'

const features = [
  { title: 'Consultar Rutas', desc: 'Busca y consulta todas las rutas disponibles', route: '/cliente/rutas' },
  { title: 'Tiempos Estimados', desc: 'Consulta tiempos de llegada en tiempo real', route: '/cliente/tiempos' },
]

const favoriteRoutes = [
  { code: 'A001', from: 'Centro', to: 'Periférico', icon: '⭐' },
  { code: 'A002', from: 'Centro', to: 'Hospital', icon: '⭐' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 30px rgba(0, 255, 65, 0.8)' }}>
            🚀 Bienvenido a MyRuta
          </h1>
          <p className="text-xl text-neon-500 opacity-75 mb-4">
            Tu plataforma inteligente de transporte urbano
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-500 to-transparent"></div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              onClick={() => navigate(feature.route)}
              className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 cursor-pointer hover:shadow-lg transition transform hover:scale-105 hover:border-neon-400"
              style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-neon-500 mb-2">{feature.title}</h3>
              <p className="text-neon-500 opacity-75 mb-4">{feature.desc}</p>
              <div className="text-right">
                <span className="text-neon-500 font-semibold">Ingresar →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Favorite Routes Section */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8 mb-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <h2 className="text-2xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            ⭐ Tus Rutas Favoritas
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-neon-500 to-transparent mb-6"></div>

          {favoriteRoutes.length > 0 ? (
            <div className="space-y-3">
              {favoriteRoutes.map((route, idx) => (
                <div
                  key={idx}
                  className="bg-dark-700 border border-neon-500 rounded-lg p-4 hover:bg-dark-600 transition cursor-pointer flex justify-between items-center"
                  style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}
                >
                  <div>
                    <p className="text-neon-500 font-bold">{route.code}</p>
                    <p className="text-neon-500 opacity-75 text-sm">{route.from} → {route.to}</p>
                  </div>
                  <span className="text-2xl">{route.icon}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-700 border-l-4 border-neon-500 p-6 rounded text-center">
              <p className="text-neon-500">
                💡 Aún no tienes rutas favoritas. Agrega algunas para acceder rápidamente.
              </p>
              <button
                onClick={() => navigate('/cliente/rutas')}
                className="mt-4 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 px-6 py-2 rounded-lg font-semibold hover:from-neon-400 hover:to-neon-500 transition"
                style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}
              >
                Explorar Rutas →
              </button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 text-center" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-4xl mb-2">🌍</p>
            <p className="text-neon-500 opacity-75 text-sm mb-1">Rutas Activas</p>
            <p className="text-3xl font-bold text-neon-500">24</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 text-center" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-4xl mb-2">👥</p>
            <p className="text-neon-500 opacity-75 text-sm mb-1">Conductores En Línea</p>
            <p className="text-3xl font-bold text-green-400">42</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6 text-center" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-4xl mb-2">✓</p>
            <p className="text-neon-500 opacity-75 text-sm mb-1">Puntualidad Promedio</p>
            <p className="text-3xl font-bold text-neon-500">94%</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-dark-800 border-l-4 border-neon-500 p-6 rounded-xl" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
          <p className="text-neon-500">
            🔔 <strong>Notificación:</strong> Tu bus llegaría en 5 minutos a la parada de Centro.
          </p>
        </div>
      </main>
    </div>
  )
}

/**
 * MyRuta Web - Admin Live Map Page
 */

const mockRoutes = [
  { code: 'A001', name: 'Centro - Periférico', status: 'Activa' },
  { code: 'A002', name: 'Norte - Sur', status: 'Activa' },
  { code: 'A003', name: 'Este - Oeste', status: 'Activa' },
]

export default function LiveMapPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            🗺️ Mapa en Vivo
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent mb-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden h-96" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
              <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                <p className="text-neon-500 text-xl" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
                  📍 Mapa de rastreo en tiempo real será integrado aquí
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Routes List */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="font-bold text-xl mb-4 text-neon-500" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
                🛣️ Rutas Activas
              </h3>
              <div className="space-y-3">
                {mockRoutes.map((route, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-dark-700 border-l-4 border-neon-500 rounded cursor-pointer hover:bg-dark-600 transition"
                    style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}
                  >
                    <p className="font-semibold text-neon-500">{route.code}</p>
                    <p className="text-sm text-neon-500 opacity-75">{route.name}</p>
                    <p className="text-xs text-green-400 mt-2">🟢 {route.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
              <h3 className="font-bold text-lg mb-4 text-neon-500" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
                📊 Estadísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-neon-500 border-opacity-30 pb-2">
                  <span className="text-neon-500 opacity-75">Buses en Línea:</span>
                  <span className="text-neon-500 font-bold">24</span>
                </div>
                <div className="flex justify-between items-center border-b border-neon-500 border-opacity-30 pb-2">
                  <span className="text-neon-500 opacity-75">Incidencias:</span>
                  <span className="text-red-400 font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neon-500 opacity-75">Operativos:</span>
                  <span className="text-yellow-400 font-bold">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

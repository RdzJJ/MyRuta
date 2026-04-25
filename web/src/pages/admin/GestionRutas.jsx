/**
 * MyRuta Web - Admin Routes Management Page
 */

const mockRoutes = [
  { code: 'A001', name: 'Centro - Periférico', stops: 12, status: 'Activa' },
  { code: 'B002', name: 'Norte - Sur', stops: 8, status: 'Activa' },
  { code: 'C003', name: 'Este - Oeste', stops: 15, status: 'Activa' },
  { code: 'D004', name: 'Terminal Central', stops: 6, status: 'Mantenimiento' },
]

export default function GestionRutas() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              🛣️ Gestión de Rutas
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent"></div>
          </div>
          <button
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
          >
            ➕ Nueva Ruta
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-700 border-b-2 border-neon-500">
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Código</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Nombre</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Paradas</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Estado</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockRoutes.map((route, idx) => (
                  <tr key={idx} className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                    <td className="py-4 px-6 text-neon-500 font-semibold">{route.code}</td>
                    <td className="py-4 px-6 text-neon-500">{route.name}</td>
                    <td className="py-4 px-6 text-neon-500 opacity-75">{route.stops}</td>
                    <td className="py-4 px-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        route.status === 'Activa' 
                          ? 'bg-neon-500 bg-opacity-20 text-neon-500' 
                          : 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                      }`} style={{ 
                        boxShadow: route.status === 'Activa'
                          ? '0 0 10px rgba(0, 255, 65, 0.3)' 
                          : '0 0 10px rgba(255, 255, 0, 0.2)'
                      }}>
                        {route.status === 'Activa' ? '🟢' : '🟡'} {route.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button className="bg-dark-700 border border-neon-500 text-neon-500 px-4 py-2 rounded-lg hover:bg-neon-500 hover:text-dark-900 transition text-sm font-semibold">
                          ✏️ Editar
                        </button>
                        <button className="bg-dark-700 border border-red-500 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-dark-900 transition text-sm font-semibold">
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">Total de Rutas</p>
            <p className="text-4xl font-bold text-neon-500">12</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">Total de Paradas</p>
            <p className="text-4xl font-bold text-neon-500">98</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">Rutas Activas</p>
            <p className="text-4xl font-bold text-neon-500">11</p>
          </div>
        </div>
      </main>
    </div>
  )
}

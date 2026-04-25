/**
 * MyRuta Web - Admin Conductors Management Page
 */

const mockConductors = [
  { id: 1, name: 'Juan Pérez', license: 'L-123456', route: 'A001', status: 'En línea' },
  { id: 2, name: 'Carlos Ruiz', license: 'L-123457', route: 'B002', status: 'En línea' },
  { id: 3, name: 'María López', license: 'L-123458', route: 'C003', status: 'Fuera de línea' },
]

export default function GestionConductores() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
              👥 Gestión de Conductores
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent"></div>
          </div>
          <button
            className="bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold py-3 px-6 rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
          >
            ➕ Nuevo Conductor
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl overflow-hidden" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-700 border-b-2 border-neon-500">
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Nombre</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Licencia</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Ruta Asignada</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Estado</th>
                  <th className="text-left py-4 px-6 font-bold text-neon-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockConductors.map((conductor) => (
                  <tr key={conductor.id} className="border-b border-neon-500 border-opacity-30 hover:bg-dark-700 transition">
                    <td className="py-4 px-6 text-neon-500">{conductor.name}</td>
                    <td className="py-4 px-6 text-neon-500 opacity-75">{conductor.license}</td>
                    <td className="py-4 px-6 text-neon-500 opacity-75">{conductor.route}</td>
                    <td className="py-4 px-6">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        conductor.status === 'En línea' 
                          ? 'bg-neon-500 bg-opacity-20 text-neon-500' 
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`} style={{ 
                        boxShadow: conductor.status === 'En línea' 
                          ? '0 0 10px rgba(0, 255, 65, 0.3)' 
                          : '0 0 10px rgba(255, 0, 0, 0.2)'
                      }}>
                        {conductor.status === 'En línea' ? '🟢' : '🔴'} {conductor.status}
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
            <p className="text-neon-500 opacity-75 text-sm mb-2">Total de Conductores</p>
            <p className="text-4xl font-bold text-neon-500">28</p>
          </div>
          <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
            <p className="text-neon-500 opacity-75 text-sm mb-2">En Línea</p>
            <p className="text-4xl font-bold text-neon-500">24</p>
          </div>
          <div className="bg-dark-800 border-2 border-red-500 rounded-xl p-6" style={{ boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)' }}>
            <p className="text-red-400 opacity-75 text-sm mb-2">Fuera de Línea</p>
            <p className="text-4xl font-bold text-red-400">4</p>
          </div>
        </div>
      </main>
    </div>
  )
}

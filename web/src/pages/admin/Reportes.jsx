/**
 * MyRuta Web - Admin Reports Page
 */

const reports = [
  { icon: '⏱️', title: 'Reporte de Puntualidad', desc: 'Análisis de puntualidad por ruta y conductor' },
  { icon: '⚠️', title: 'Reporte de Incidencias', desc: 'Listado de problemas e incidentes reportados' },
  { icon: '📊', title: 'Reporte de Desempeño', desc: 'Evaluación del desempeño de conductores' },
  { icon: '🤖', title: 'Predicciones de Delays', desc: 'Predicciones de delays basadas en ML' },
]

export default function Reportes() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold text-neon-500 mb-2" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.8)' }}>
            📋 Reportes y Análisis
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-500 to-transparent mb-8"></div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {reports.map((report, idx) => (
            <div
              key={idx}
              className="bg-dark-800 border-2 border-neon-500 border-l-8 rounded-xl p-6 cursor-pointer hover:shadow-lg transition transform hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}
            >
              <div className="text-4xl mb-3">{report.icon}</div>
              <h3 className="font-bold text-xl text-neon-500 mb-2">{report.title}</h3>
              <p className="text-neon-500 opacity-75">{report.desc}</p>
              <button className="mt-4 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 px-4 py-2 rounded-lg font-semibold hover:from-neon-400 hover:to-neon-500 transition">
                Ver Reporte →
              </button>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="bg-dark-800 border-2 border-neon-500 rounded-xl p-8" style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
          <h2 className="text-2xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.6)' }}>
            📈 Análisis General del Sistema
          </h2>
          <div className="h-1 w-12 bg-gradient-to-r from-neon-500 to-transparent mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-700 border border-neon-500 rounded-lg p-4" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500 opacity-75 text-sm mb-2">Puntualidad Promedio</p>
              <p className="text-3xl font-bold text-neon-500">94.2%</p>
              <p className="text-xs text-green-400 mt-2">↑ 2.3% desde la semana pasada</p>
            </div>
            <div className="bg-dark-700 border border-neon-500 rounded-lg p-4" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500 opacity-75 text-sm mb-2">Incidencias Totales</p>
              <p className="text-3xl font-bold text-red-400">12</p>
              <p className="text-xs text-red-400 mt-2">↑ 3 reportadas hoy</p>
            </div>
            <div className="bg-dark-700 border border-neon-500 rounded-lg p-4" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
              <p className="text-neon-500 opacity-75 text-sm mb-2">Satisfacción del Cliente</p>
              <p className="text-3xl font-bold text-neon-500">4.6/5.0</p>
              <p className="text-xs text-green-400 mt-2">↑ 0.3 puntos vs mes anterior</p>
            </div>
          </div>

          <div className="bg-dark-700 border-l-4 border-neon-500 p-4 rounded" style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)' }}>
            <p className="text-neon-500">
              ✓ Los gráficos detallados se mostrarán cuando el backend de analytics esté implementado.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

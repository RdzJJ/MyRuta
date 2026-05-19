/**
 * MyRuta Web - 404 NotFound Page
 * 
 * Responsibilities:
 * - Display 404 error
 */

import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.05) 25%, rgba(0, 255, 65, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.05) 75%, rgba(0, 255, 65, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}>
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-9xl font-bold text-neon-500 mb-4" style={{ textShadow: '0 0 30px rgba(0, 255, 65, 0.8)' }}>
          404
        </h1>
        <p className="text-3xl font-semibold text-neon-500 mb-4" style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.6)' }}>
          Página no encontrada
        </p>
        <p className="text-neon-500 opacity-75 mb-8 max-w-md mx-auto" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.4)' }}>
          Lo sentimos, la página que estás buscando no existe o ha sido removida del sistema.
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-gradient-to-r from-neon-500 to-neon-600 text-dark-900 font-bold rounded-lg hover:from-neon-400 hover:to-neon-500 transition transform hover:scale-105"
          style={{ boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)' }}
        >
          🏠 Volver al inicio
        </button>
      </div>
    </div>
  )
}

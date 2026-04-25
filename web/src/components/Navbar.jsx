/**
 * MyRuta Web - Navbar Component
 * 
 * Displays navigation bar with:
 * - App logo/title
 * - Login button (for guests)
 * - User menu (for authenticated users)
 * - Role indicator
 */

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b-2 border-neon-500 shadow-neon relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="text-3xl font-bold text-neon-500 drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.8)' }}>
            MyRuta
          </div>
          <span className="text-sm text-neon-500 opacity-75" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.6)' }}>
            Sistema de Monitoreo de Rutas
          </span>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              {/* Admin Dashboard Link */}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 rounded-lg bg-dark-700 border border-neon-500 text-neon-500 hover:bg-neon-500 hover:text-dark-900 transition font-semibold"
                  style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}
                >
                  📊 Dashboard Admin
                </Link>
              )}

              {/* Conductor Tracking Link */}
              {user.role === 'CONDUCTOR' && (
                <Link
                  to="/conductor/tracking"
                  className="px-4 py-2 rounded-lg bg-dark-700 border border-neon-500 text-neon-500 hover:bg-neon-500 hover:text-dark-900 transition font-semibold"
                  style={{ boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}
                >
                  🗺️ Mi Rastreo
                </Link>
              )}

              {/* User Info */}
              <div className="bg-dark-700 px-4 py-2 rounded-lg border border-neon-600" style={{ boxShadow: '0 0 8px rgba(0, 255, 65, 0.2)' }}>
                <div className="text-sm text-neon-500 font-semibold">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-neon-500 opacity-70">{user.role}</div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-dark-700 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-dark-900 transition font-semibold"
                style={{ boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)' }}
              >
                ⏻ Cerrar Sesión
              </button>
            </div>
          ) : (
            /* Login Button for Guests */
            <button
              onClick={handleLoginClick}
              className="px-6 py-2 rounded-lg bg-neon-500 text-dark-900 font-bold hover:bg-neon-400 transition"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.6)' }}
            >
              Iniciar Sesión 
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb / Info Bar */}
      <div className="bg-dark-800 px-4 py-2 text-sm border-t border-neon-500 border-opacity-30">
        {isAuthenticated ? (
          <span className="text-neon-500" style={{ textShadow: '0 0 5px rgba(0, 255, 65, 0.5)' }}>
            ✓ Sesión activa como <strong>{user.role}</strong>
          </span>
        ) : (
          <span className="text-neon-500 opacity-75">
            💡 Explora las rutas disponibles, o inicia sesión para más opciones
          </span>
        )}
      </div>
    </nav>
  )
}

/**
 * MyRuta Web - Navbar Component
 * 
 * Responsibilities:
 * - Display navigation links based on user role
 * - Handle active route styling
 */

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname.includes(path)

  const linkClass = (path) => `
    px-4 py-2 rounded-lg transition
    ${isActive(path)
      ? 'bg-primary-700 text-white'
      : 'text-gray-700 hover:bg-gray-100'
    }
  `

  if (!user) return null

  return (
    <nav className="bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin/dashboard" className={linkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/admin/mapa-vivo" className={linkClass('/mapa-vivo')}>
                Mapa en Vivo
              </Link>
              <Link to="/admin/rutas" className={linkClass('/rutas')}>
                Rutas
              </Link>
              <Link to="/admin/conductores" className={linkClass('/conductores')}>
                Conductores
              </Link>
              <Link to="/admin/reportes" className={linkClass('/reportes')}>
                Reportes
              </Link>
            </>
          )}

          {user.role === 'CLIENTE' && (
            <>
              <Link to="/cliente/home" className={linkClass('/home')}>
                Inicio
              </Link>
              <Link to="/cliente/rutas" className={linkClass('/rutas')}>
                Consultar Rutas
              </Link>
              <Link to="/cliente/tiempos" className={linkClass('/tiempos')}>
                Tiempos Estimados
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

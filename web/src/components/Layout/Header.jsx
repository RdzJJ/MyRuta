/**
 * MyRuta Web - Header Component
 * 
 * Responsibilities:
 * - Display application title
 * - Show user information
 * - Provide logout functionality
 */

import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-dark-800 border-b-2 border-neon-500 shadow-lg" style={{ boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neon-500" style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.8)' }}>
          🚀 MyRuta
        </h1>
        
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-sm border-r border-neon-500 border-opacity-30 pr-4">
                <p className="font-semibold text-neon-500">{user.firstName} {user.lastName}</p>
                <p className="text-neon-500 opacity-75 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-dark-900 rounded-lg transition font-semibold"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

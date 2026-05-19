import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()

  // Esperar autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-neon-500">
        Cargando...
      </div>
    )
  }

  // No autenticado
  if (!user?.uid) {
    return <Navigate to="/login" replace />
  }

  // No es admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
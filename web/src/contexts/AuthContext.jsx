import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, login, logout } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((userData) => {
      setUser(userData)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleLogin = async (email, password) => {
    return await login(email, password)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: handleLogin,
      logout: handleLogout,
      isAuthenticated: !!user,
      isAdmin: user?.rol === 'ADMIN',
      isConductor: user?.rol === 'CONDUCTOR'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
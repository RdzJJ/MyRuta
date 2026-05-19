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
    return () => unsubscribe()
  }, [])

  const handleLogin = async (email, password) => {
    const userData = await login(email, password)
    setUser(userData)
    return userData
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
      isAdmin: user?.rol === 'ADMIN',
      isConductor: user?.rol === 'CONDUCTOR'
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
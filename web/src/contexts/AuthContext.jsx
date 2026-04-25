/**
 * MyRuta Web - AuthContext
 * 
 * Responsibilities:
 * - Global authentication state
 * - User information
 * - Login/logout functionality
 * - Role-based access control
 */

import { createContext, useState, useCallback, useContext, useEffect } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'))

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('authUser')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = useCallback((authData) => {
    // authData = { token, user }
    setLoading(true)
    try {
      const { token: newToken, user: newUser } = authData
      setToken(newToken)
      setUser(newUser)
      setIsAuthenticated(true)
      
      // Store in localStorage
      localStorage.setItem('authToken', newToken)
      localStorage.setItem('authUser', JSON.stringify(newUser))
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use AuthContext
 * @returns {Object} Auth context value with user, token, isAuthenticated, etc.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}

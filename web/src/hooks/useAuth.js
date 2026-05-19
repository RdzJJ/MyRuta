/**
 * MyRuta Web - useAuth Hook
 * 
 * Responsibilities:
 * - Provide auth state and functions
 * - Manage user data
 */

import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  
  return context
}

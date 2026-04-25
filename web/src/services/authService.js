/**
 * MyRuta Web - Auth Service
 * 
 * Responsibilities:
 * - Login and registration
 * - Token management
 */

import api from './api'

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password })
  },

  register: async (userData) => {
    return api.post('/auth/register', userData)
  },

  refreshToken: async (token) => {
    return api.post('/auth/refresh', { token })
  },

  logout: async () => {
    return api.post('/auth/logout')
  }
}

export default authService

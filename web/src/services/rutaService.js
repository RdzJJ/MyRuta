/**
 * MyRuta Web - Ruta Service
 * 
 * Responsibilities:
 * - Route CRUD operations
 * - Get route details
 */

import api from './api'

export const rutaService = {
  listRoutes: async (filters = {}) => {
    return api.get('/rutas', { params: filters })
  },

  getRoute: async (id) => {
    return api.get(`/rutas/${id}`)
  },

  getStops: async (id) => {
    return api.get(`/rutas/${id}/stops`)
  },

  getCurrentLocation: async (id) => {
    return api.get(`/rutas/${id}/current-location`)
  },

  getEstimatedTime: async (id, params) => {
    return api.get(`/rutas/${id}/estimated-time`, { params })
  }
}

export default rutaService

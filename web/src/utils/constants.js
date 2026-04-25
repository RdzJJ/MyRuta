/**
 * MyRuta Web - Application Constants
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  CONDUCTOR: 'CONDUCTOR',
  CLIENTE: 'CLIENTE'
}

export const API_ENDPOINTS = {
  AUTH: '/auth',
  RUTAS: '/rutas',
  CONDUCTORES: '/conductores',
  CLIENTES: '/clientes',
  ADMIN: '/admin'
}

export const SOCKET_EVENTS = {
  LOCATION_UPDATE: 'location:update',
  USER_JOIN: 'user:join',
  CONNECTION: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error'
}

export const DEFAULT_MAP_ZOOM = 13
export const DEFAULT_MAP_CENTER = {
  lat: 0,
  lng: 0
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

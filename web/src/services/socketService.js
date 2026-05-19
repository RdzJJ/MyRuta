/**
 * MyRuta Web - Socket Service
 * 
 * Responsibilities:
 * - Socket.io initialization
 * - Event handling
 * - Connection management
 */

import { io } from 'socket.io-client'

let socket = null

export const socketService = {
  connect: (token) => {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    return socket
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback)
    }
  },

  emit: (event, data) => {
    if (socket) {
      socket.emit(event, data)
    }
  },

  off: (event) => {
    if (socket) {
      socket.off(event)
    }
  },

  getSocket: () => socket
}

export default socketService

/**
 * MyRuta Web - useSocket Hook
 * 
 * Responsibilities:
 * - Manage Socket.io connection
 * - Handle real-time events
 */

import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef(null)

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: localStorage.getItem('authToken')
      }
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  return socketRef.current
}

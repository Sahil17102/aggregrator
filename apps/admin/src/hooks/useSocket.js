import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from 'store/useAuthStore'
import { useNotificationsStore } from 'store/useNotificationsStore'

export const useSocket = () => {
  const { userId } = useAuthStore()
  const { addNotification } = useNotificationsStore()
  const isLocalhost =
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const normalizeSocketUrl = (rawUrl) => {
    const fallback = isLocalhost
      ? 'http://127.0.0.1:5002'
      : 'https://aggregator-backend-7gmk.onrender.com'
    if (!rawUrl) return fallback
    try {
      const candidate = new URL(rawUrl)
      if (candidate.hostname === 'your-backend-url.onrender.com') return fallback
      return candidate.href.replace(/\/+$/, '')
    } catch {
      return fallback
    }
  }
  const socketUrl = normalizeSocketUrl(
    process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL?.replace(/\/api\/?$/, ''),
  )

  useEffect(() => {
    if (!userId) return

    const socket = io(socketUrl)

    socket.emit('register', userId)

    socket.on('new_notification', (notification) => {
      addNotification(notification)
    })

    return () => {
      socket.disconnect()
    }
  }, [addNotification, socketUrl, userId])
}

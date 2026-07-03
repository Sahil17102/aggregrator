// notificationSocket.js
import { io } from 'socket.io-client'
const isLocalhost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
const normalizeSocketUrl = (rawUrl) => {
  const fallback = isLocalhost ? 'http://127.0.0.1:5002' : 'https://aggregator-backend-7gmk.onrender.com'
  if (!rawUrl) return fallback
  try {
    const candidate = new URL(rawUrl)
    if (candidate.hostname === 'your-backend-url.onrender.com') return fallback
    return candidate.href.replace(/\/+$/, '')
  } catch {
    return fallback
  }
}
const URL =
  normalizeSocketUrl(
    process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_BASE_URL?.replace(/\/api\/?$/, ''),
  )
export const socket = io(URL) // Your backend URL

export function registerUser(userId) {
  socket.emit('register', userId)
}

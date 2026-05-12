import { Navigate } from 'react-router-dom'
import FullScreenLoader from '../components/UI/loader/FullScreenLoader'
import { useAuth } from '../context/auth/AuthContext'
import { getPostAuthRedirect } from '../utils/authRedirect'

export default function AppEntry() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Navigate to={getPostAuthRedirect(user)} replace />
}

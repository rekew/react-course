import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { selectIsAuthenticated } from '../features/auth/authSlice.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { useAppSelector } from '../store/hooks.ts'
import Loader from './Loader.tsx'

export default function ProtectedRoute() {
  const { loading } = useAuth()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

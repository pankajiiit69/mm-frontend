import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type Role } from '@fruzoos/auth-core'

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { auth } = useAuth()

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
    const fallbackPath = auth.user.role === 'ADMIN' ? '/admin/dashboard' : '/'
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}

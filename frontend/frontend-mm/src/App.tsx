import { useEffect } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { getAuthenticatedUser } from './api/authClient'
import { AppRouter } from './routes/AppRouter'

function App() {
  const { auth, updateAuthUser } = useAuth()

  // Hydrate verificationStatus from /api/auth/me on every app init
  // since it is intentionally not persisted to localStorage.
  // Skip when verificationStatus is already known to be PROFILE_NOT_CREATED
  // to avoid calling profile/extended/me before a profile exists.
  useEffect(() => {
    if (!auth.isAuthenticated) return
    if (auth.user?.verificationStatus === 'PROFILE_NOT_CREATED') return
    getAuthenticatedUser()
      .then(updateAuthUser)
      .catch(() => {})
  }, [auth.isAuthenticated])

  useEffect(() => {
    console.log('[AuthContext] verificationStatus:', auth.user?.verificationStatus ?? 'N/A')
  }, [auth.user?.verificationStatus])

  return <AppRouter />
}

export default App

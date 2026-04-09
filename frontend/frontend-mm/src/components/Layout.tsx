import { useEffect } from 'react'
import { Link, NavLink, Outlet, matchPath, useLocation } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { GlobalApiLoader } from './GlobalApiLoader'
import { useAsyncData } from '../hooks/useAsyncData'
import { matrimonyApi } from '../api/matrimonyApi'
import { getProfileNavLabel, getProfilePageTitle } from '../utils/profileRelationText'

function resolvePageTitle(pathname: string, profilePageTitle: string) {
  if (pathname === '/') return 'Discover'
  if (pathname === '/shortlists') return 'Shortlists'
  if (pathname === '/interests') return 'Interests'
  if (pathname === '/relation') return 'Profile Relation'
  if (pathname === '/profile') return profilePageTitle
  if (pathname === '/admin/dashboard') return 'Dashboard'
  if (pathname === '/admin/users') return 'Users'
  if (pathname === '/admin/profiles') return 'Profiles'
  if (pathname === '/admin/picklists') return 'Picklists'
  if (matchPath('/profiles/:profileId', pathname)) return 'Profile Details'
  if (pathname === '/login') return 'Sign In'
  if (pathname === '/register') return 'Register'
  if (pathname === '/reset-password') return 'Reset Password'
  if (pathname === '/about') return 'About'
  if (pathname === '/404') return 'Not Found'
  return 'Page'
}

export function Layout() {
  const { auth, logout } = useAuth()
  const location = useLocation()
  const profileRelation = null
  const profilePageTitle = getProfilePageTitle(profileRelation)
  const profileNavLabel = getProfileNavLabel(profileRelation)

  const currentUserEmail = auth.user?.email?.trim().toLowerCase() ?? ''

  const shouldLoadAdminName = auth.isAuthenticated && auth.user?.role === 'ADMIN' && Boolean(currentUserEmail)
  const { data: adminUserForEmail } = useAsyncData(
    async () => {
      const response = await matrimonyApi.adminListUsers({
        page: 1,
        size: 1,
        email: currentUserEmail,
      })

      return {
        userEmail: currentUserEmail,
        fullName: response.data.items[0]?.name ?? '',
      }
    },
    [currentUserEmail, auth.user?.role],
    shouldLoadAdminName,
  )

  const authDisplayName = auth.user?.name?.trim() || ''
  const adminFullName =
    adminUserForEmail?.userEmail === currentUserEmail ? adminUserForEmail.fullName?.trim() || '' : ''
  const profileDisplayName = auth.user?.role === 'ADMIN'
    ? adminFullName || authDisplayName || 'User'
    : authDisplayName || 'User'
  const profileEmail = auth.user?.email?.trim() || ''
  const headerUserLabel = profileEmail ? `${profileDisplayName} [${profileEmail}]` : profileDisplayName

  useEffect(() => {
    document.title = `MM-${resolvePageTitle(location.pathname, profilePageTitle)}`
  }, [location.pathname, profilePageTitle])

  return (
    <div className="app-shell">
      <GlobalApiLoader />
      <header className="topbar">
        <Link to="/" className="brand">Var Vadhu Khoj</Link>
        <nav className="nav">
          {auth.user?.role === 'USER' && <NavLink to="/">Discover</NavLink>}
          {auth.user?.role === 'USER' && <NavLink to="/shortlists">Shortlists</NavLink>}
          {auth.user?.role === 'USER' && <NavLink to="/interests">Interests</NavLink>}
          {auth.user?.role === 'USER' && <NavLink to="/profile">{profileNavLabel}</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/users">Users</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/profiles">Profiles</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/picklists">Picklists</NavLink>}
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="auth-actions">
          {auth.isAuthenticated ? (
            <>
              <span className="welcome">{headerUserLabel}</span>
              <button
                type="button"
                className="logout-icon-button topbar-action topbar-action-logout"
                aria-label="Logout"
                title="Logout"
                onClick={() => void logout()}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="action-icon-svg"
                  aria-hidden="true"
                >
                  <path
                    d="M9 4H6.75A1.75 1.75 0 0 0 5 5.75v12.5A1.75 1.75 0 0 0 6.75 20H9M13 16l4-4m0 0-4-4m4 4H9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="action-label">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-icon-link topbar-action topbar-action-login">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="action-icon-svg"
                  aria-hidden="true"
                >
                  <path
                    d="M15 4h2.25A1.75 1.75 0 0 1 19 5.75v12.5A1.75 1.75 0 0 1 17.25 20H15M11 16l-4-4m0 0 4-4m-4 4h8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="action-label">Sign In</span>
              </Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

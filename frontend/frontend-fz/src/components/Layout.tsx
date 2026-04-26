import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { useCart } from '../hooks/useCart'

export function Layout() {
  const { auth, logout } = useAuth()
  const { cart } = useCart()
  const isAdmin = auth.user?.role === 'ADMIN'
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const headerActionsClassName = `header-actions${isMobileMenuOpen ? ' mobile-open' : ''}${auth.isAuthenticated ? ' is-authenticated' : ' is-guest'}`
  const headerMenuPanelClassName = `header-menu-panel${isMobileMenuOpen ? ' mobile-open' : ''}`

  return (
    <div className="app-shell">
      <header className={`site-header app-header${isMobileMenuOpen ? ' mobile-open' : ''}`}>
        <Link to="/" className="brand">Fruzoos</Link>
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span aria-hidden="true">☰</span>
          <span>Menu</span>
        </button>
        <div className={headerMenuPanelClassName}>
          <nav
            id="primary-navigation"
            className={`nav-links nav-links-app${isMobileMenuOpen ? ' mobile-open' : ''}`}
            aria-label="Primary navigation"
          >
            <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
            <NavLink to="/catalog" onClick={closeMobileMenu}>Catalog</NavLink>
            <NavLink to="/about" onClick={closeMobileMenu}>About</NavLink>
            {!isAdmin && <NavLink to="/cart" onClick={closeMobileMenu}>Cart ({cart.items.length})</NavLink>}
            {!isAdmin && <NavLink to="/checkout" onClick={closeMobileMenu}>Checkout</NavLink>}
            {auth.isAuthenticated && !isAdmin && <NavLink to="/orders" onClick={closeMobileMenu}>My Orders</NavLink>}
            {auth.user?.role === 'ADMIN' && <NavLink to="/admin/dashboard" onClick={closeMobileMenu}>Dashboard</NavLink>}
            {auth.user?.role === 'ADMIN' && <NavLink to="/admin/products" onClick={closeMobileMenu}>Products</NavLink>}
            {auth.user?.role === 'ADMIN' && <NavLink to="/admin/inventory" onClick={closeMobileMenu}>Inventory</NavLink>}
            {auth.user?.role === 'ADMIN' && <NavLink to="/admin/orders" onClick={closeMobileMenu}>Orders</NavLink>}
            {auth.isAuthenticated && <NavLink to="/profile" onClick={closeMobileMenu}>Profile</NavLink>}
          </nav>
          <div className={headerActionsClassName}>
            {auth.isAuthenticated ? (
              <>
                <span className="header-user">{auth.user?.name}</span>
                <button
                  type="button"
                  className="header-pill-link"
                  onClick={() => {
                    void logout()
                    closeMobileMenu()
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="header-pill-link" onClick={closeMobileMenu}>Sign In</Link>
                <Link to="/register" className="header-pill-link" onClick={closeMobileMenu}>Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
        />
      ) : null}

      <main className="content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Fruzoos Juice App</p>
      </footer>
    </div>
  )
}

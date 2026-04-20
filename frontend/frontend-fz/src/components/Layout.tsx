import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { useCart } from '../hooks/useCart'

export function Layout() {
  const { auth, logout } = useAuth()
  const { cart } = useCart()
  const isAdmin = auth.user?.role === 'ADMIN'

  return (
    <div className="app-shell">
      <header className="site-header app-header">
        <Link to="/" className="brand">Fruzoos</Link>
        <nav className="nav-links nav-links-app" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/catalog">Catalog</NavLink>
          <NavLink to="/about">About</NavLink>
          {!isAdmin && <NavLink to="/cart">Cart ({cart.items.length})</NavLink>}
          {!isAdmin && <NavLink to="/checkout">Checkout</NavLink>}
          {auth.isAuthenticated && !isAdmin && <NavLink to="/orders">My Orders</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/products">Products</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/inventory">Inventory</NavLink>}
          {auth.user?.role === 'ADMIN' && <NavLink to="/admin/orders">Orders</NavLink>}
          {auth.isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
        </nav>
        <div className="header-actions">
          {auth.isAuthenticated ? (
            <>
              <span className="header-user">{auth.user?.name}</span>
              <button type="button" className="header-pill-link" onClick={() => void logout()}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-pill-link">Sign In</Link>
              <Link to="/register" className="header-pill-link">Register</Link>
            </>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Fruzoos Juice App</p>
      </footer>
    </div>
  )
}

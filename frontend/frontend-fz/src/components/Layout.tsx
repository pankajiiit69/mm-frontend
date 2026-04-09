import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { useCart } from '../hooks/useCart'

export function Layout() {
  const { auth, logout } = useAuth()
  const { cart } = useCart()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">Fruzoos</Link>
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/cart">Cart ({cart.items.length})</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
          {auth.isAuthenticated && <NavLink to="/orders">My Orders</NavLink>}
          {auth.user?.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/dashboard">Admin Dashboard</NavLink>
              <NavLink to="/admin/products">Products</NavLink>
              <NavLink to="/admin/inventory">Inventory</NavLink>
              <NavLink to="/admin/orders">Orders</NavLink>
            </>
          )}
          {auth.isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
        </nav>
        <div className="auth-actions">
          {auth.isAuthenticated ? (
            <>
              <span className="welcome">{auth.user?.name}</span>
              <button onClick={() => void logout()}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
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

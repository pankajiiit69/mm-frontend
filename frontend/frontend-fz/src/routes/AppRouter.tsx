import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../pages/HomePage'
import { CatalogPage } from '../pages/CatalogPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { MyOrdersPage } from '../pages/MyOrdersPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { AboutPage } from '../pages/AboutPage'
import { ProfilePage } from '../pages/ProfilePage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { ProductManagementPage } from '../pages/admin/ProductManagementPage'
import { InventoryManagementPage } from '../pages/admin/InventoryManagementPage'
import { OrderManagementPage } from '../pages/admin/OrderManagementPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/products" element={<ProductManagementPage />} />
          <Route path="/admin/inventory" element={<InventoryManagementPage />} />
          <Route path="/admin/orders" element={<OrderManagementPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

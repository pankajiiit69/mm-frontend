import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from '../pages/HomePage'
import { ProfileDetailPage } from '../pages/ProfileDetailPage'
import { ShortlistsPage } from '../pages/ShortlistsPage'
import { InterestsPage } from '../pages/InterestsPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { AboutPage } from '../pages/AboutPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RelationPage } from '../pages/RelationPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { AdminProfilesPage } from '../pages/admin/AdminProfilesPage'
import { AdminPicklistsPage } from '../pages/admin/AdminPicklistsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route index element={<HomePage />} />
          <Route path="/profiles/:profileId" element={<ProfileDetailPage />} />
          <Route path="/shortlists" element={<ShortlistsPage />} />
          <Route path="/interests" element={<InterestsPage />} />
          <Route path="/relation" element={<RelationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/profiles" element={<AdminProfilesPage />} />
          <Route path="/admin/picklists" element={<AdminPicklistsPage />} />
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

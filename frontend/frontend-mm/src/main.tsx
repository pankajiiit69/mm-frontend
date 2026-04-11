import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@fruzoos/auth-core'
import { authClient } from './api/authClient'
import { AUTH_KEY, storage } from './utils/storage'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ToastContainer'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const hasGoogleClientId = Boolean(googleClientId.trim())

const appTree = (
  <BrowserRouter>
    <AuthProvider authClient={authClient} storage={storage} storageKey={AUTH_KEY}>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(
  hasGoogleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider> : appTree,
)

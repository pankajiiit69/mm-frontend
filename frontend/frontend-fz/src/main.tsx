import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@fruzoos/auth-core'
import { CartProvider } from './context/CartContext.tsx'
import { authClient } from './api/authClient'
import { AUTH_KEY, storage } from './utils/storage'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const hasGoogleClientId = Boolean(googleClientId.trim())

const appTree = (
  <BrowserRouter>
    <AuthProvider authClient={authClient} storage={storage} storageKey={AUTH_KEY}>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)

createRoot(document.getElementById('root')!).render(
  hasGoogleClientId ? <GoogleOAuthProvider clientId={googleClientId}>{appTree}</GoogleOAuthProvider> : appTree,
)

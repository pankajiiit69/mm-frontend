import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { TelegramLoginButton, type TelegramAuthUser, useAuth } from '@fruzoos/auth-core'
import { FieldError } from '../components/FieldError'
import { getAuthenticatedUser } from '../api/authClient'
import { resolvePostAuthRoute } from '../utils/authNavigation'
import { isEmailValid, minLength } from '../utils/validation'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

const hasGoogleClientId = Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim())
const telegramBotName = (import.meta.env.VITE_TELEGRAM_BOT_NAME ?? '').trim()
const hasTelegramBotName = Boolean(telegramBotName)
const DISCOVERY_PREFILL_ON_LOGIN_KEY = 'mm.discovery.prefillOnLogin.v1'

export function LoginPage() {
  const { login, socialLogin, updateAuthUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('user@matrimony.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!isEmailValid(email) || !minLength(password, 6)) {
      setError('Enter a valid email and a password with at least 6 characters.')
      return
    }

    setError('')
    try {
      await login({ email, password })
      const authUser = await getAuthenticatedUser()
      updateAuthUser(authUser)
      window.sessionStorage.setItem(DISCOVERY_PREFILL_ON_LOGIN_KEY, '1')
      navigate(resolvePostAuthRoute(authUser.verificationStatus))
    } catch (err) {
      setError('Login failed. Please verify credentials and try again.')
      showToast(extractApiError(err, 'Login failed. Please verify credentials and try again.'), 'error')
    }
  }

  const onGoogleSuccess = async (response: CredentialResponse) => {
    const idToken = response.credential
    if (!idToken || idToken.length < 6) {
      setError('Google did not return a valid idToken.')
      return
    }

    setError('')
    try {
      await socialLogin('google', idToken)
      const authUser = await getAuthenticatedUser()
      updateAuthUser(authUser)
      window.sessionStorage.setItem(DISCOVERY_PREFILL_ON_LOGIN_KEY, '1')
      navigate(resolvePostAuthRoute(authUser.verificationStatus))
    } catch (err) {
      setError('Google login failed. Please try again.')
      showToast(extractApiError(err, 'Google login failed. Please try again.'), 'error')
    }
  }

  const onTelegramAuth = async (user: TelegramAuthUser) => {
    setError('')
    try {
      await socialLogin('telegram', JSON.stringify(user))
      const authUser = await getAuthenticatedUser()
      updateAuthUser(authUser)
      window.sessionStorage.setItem(DISCOVERY_PREFILL_ON_LOGIN_KEY, '1')
      navigate(resolvePostAuthRoute(authUser.verificationStatus))
    } catch (err) {
      setError('Telegram login failed. Please try again.')
      showToast(extractApiError(err, 'Telegram login failed. Please try again.'), 'error')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <article className="card auth-panel auth-panel-info stack-wide">
          <p className="auth-kicker">Welcome Back</p>
          <h1>Sign In to Var Vadhu Khoj</h1>
          <p className="auth-subtitle">
            Connect with meaningful matches, review interests, and manage your profile with confidence.
          </p>
          <ul className="auth-benefits">
            <li>Discover verified profiles with clear details</li>
            <li>Track sent and received interests easily</li>
            <li>Keep your shortlist and profile in one place</li>
          </ul>
        </article>

        <article className="card auth-panel auth-panel-form stack-wide">
          <h2>Sign In</h2>
          <p className="auth-subtitle">Use your email and password to continue.</p>

          <form onSubmit={onSubmit} className="stack">
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>

            <button type="submit">Sign In</button>

            <div className="inline-actions auth-links-row">
              <Link to="/reset-password">Forgot password?</Link>
              <Link to="/register">Create account</Link>
            </div>

            <FieldError message={error} />
          </form>

          {(hasGoogleClientId || hasTelegramBotName) && (
            <div className="stack auth-social-block">
              <p className="auth-social-title">Or continue with</p>
              {hasGoogleClientId && (
                <GoogleLogin
                  onSuccess={(response) => void onGoogleSuccess(response)}
                  onError={() => { setError('Google login failed.'); showToast('Google login failed.', 'error') }}
                />
              )}
              {hasTelegramBotName && (
                <TelegramLoginButton
                  botName={telegramBotName}
                  onAuth={(user) => void onTelegramAuth(user)}
                  onError={(message) => { setError(message); showToast(message, 'error') }}
                />
              )}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

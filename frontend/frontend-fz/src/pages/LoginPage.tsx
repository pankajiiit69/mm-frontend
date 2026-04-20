import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '@fruzoos/auth-core'
import { FieldError } from '../components/FieldError'
import { isEmailValid, minLength } from '../utils/validation'

const hasGoogleClientId = Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim())

export function LoginPage() {
  const { login, socialLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('user@fruzoos.local')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!isEmailValid(email) || !minLength(password, 6)) {
      setError('Enter a valid email and a password with at least 6 characters.')
      return
    }

    setError('')
    try {
      await login({ email, password })
      navigate('/')
    } catch {
      setError('Sign in failed. Please verify credentials and try again.')
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
      navigate('/')
    } catch {
      setError('Google sign in failed. Please try again.')
    }
  }

  return (
    <section className="stack-wide auth-page">
      <form onSubmit={onSubmit} className="stack auth-form-card">
        <h1 className="auth-card-title">Sign In</h1>
        <p className="auth-card-subtitle">Sign in to continue your fresh juice orders and delivery tracking.</p>

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Sign In</button>
        {hasGoogleClientId && (
          <div className="google-auth-wrap">
            <GoogleLogin
              onSuccess={(response) => void onGoogleSuccess(response)}
              onError={() => setError('Google sign in failed.')}
            />
          </div>
        )}
        <div className="inline-actions">
          <Link to="/reset-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
        <FieldError message={error} />
      </form>
    </section>
  )
}

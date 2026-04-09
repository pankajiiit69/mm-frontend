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
      setError('Login failed. Please verify credentials and try again.')
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
      setError('Google login failed. Please try again.')
    }
  }

  return (
    <section>
      <h1>Login</h1>
      <p>Try seeded credentials: user@fruzoos.local / password123</p>
      <p>Social login calls API: POST /api/auth/social/{'{provider}'} with idToken.</p>
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
        {hasGoogleClientId && (
          <div className="stack">
            <GoogleLogin
              onSuccess={(response) => void onGoogleSuccess(response)}
              onError={() => setError('Google login failed.')}
            />
          </div>
        )}
        <Link to="/reset-password">Forgot password?</Link>
        <FieldError message={error} />
      </form>
    </section>
  )
}

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { FieldError } from '../components/FieldError'
import { getAuthenticatedUser } from '../api/authClient'
import { resolvePostAuthRoute } from '../utils/authNavigation'
import { isEmailValid, minLength } from '../utils/validation'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

export function RegisterPage() {
  const { register, updateAuthUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countryCode, setCountryCode] = useState('91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const normalizedPhone = `+${countryCode}${mobileNumber}`
  const isPhoneValid = () => /^\d{1,3}$/.test(countryCode.trim()) && /^\d{10}$/.test(mobileNumber.trim())
  const phoneValidationMessage = 'Enter a valid country code (1-3 digits) and 10-digit mobile number.'

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!isPhoneValid()) {
      setError(phoneValidationMessage)
      return
    }

    if (!minLength(name, 3) || !isEmailValid(email) || !minLength(password, 6)) {
      setError('Name, email, and password do not meet validation requirements.')
      return
    }

    setError('')
    try {
      const registeredUser = await register({ name, email, password, phone: normalizedPhone })
      if (registeredUser.verificationStatus !== 'PROFILE_NOT_CREATED') {
        const authUser = await getAuthenticatedUser()
        updateAuthUser(authUser)
        navigate(resolvePostAuthRoute(authUser.verificationStatus))
      } else {
        navigate(resolvePostAuthRoute(registeredUser.verificationStatus))
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
      showToast(extractApiError(err, 'Registration failed. Please try again.'), 'error')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <article className="card auth-panel auth-panel-info stack-wide">
          <p className="auth-kicker">Start Your Journey</p>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">
            Join Var Vadhu Khoj to build your profile, discover relevant matches, and connect with intent.
          </p>
          <ul className="auth-benefits">
            <li>Simple onboarding for profile and preferences</li>
            <li>Modern discovery and shortlist experience</li>
            <li>Secure and structured interest flow</li>
          </ul>
        </article>

        <article className="card auth-panel auth-panel-form stack-wide">
          <h2>Register</h2>
          <p className="auth-subtitle">Create your account in a few quick steps.</p>

          <form onSubmit={onSubmit} className="stack">
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <div className="phone-field-group">
              <label className="phone-country-code-field">
                Country Code
                <span className="phone-prefix">+</span>
                <input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  type="text"
                  inputMode="numeric"
                  placeholder="91"
                  maxLength={3}
                  required
                />
              </label>
              <label className="phone-mobile-field">
                Mobile Number
                <input
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </label>
            </div>
            <label>
              Password
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button type="submit">Create Account</button>

            <div className="inline-actions auth-links-row">
              <span className="info-text">Already have an account?</span>
              <Link to="/login">Sign In</Link>
            </div>

            <FieldError message={error} />
          </form>
        </article>
      </div>
    </section>
  )
}

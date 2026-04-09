import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { FieldError } from '../components/FieldError'
import { isEmailValid, minLength } from '../utils/validation'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('newuser@fruzoos.local')
  const [password, setPassword] = useState('password')
  const [countryCode, setCountryCode] = useState('91')
  const [mobileNumber, setMobileNumber] = useState('')
  const [error, setError] = useState('')

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
      await register({ name, email, password, phone: normalizedPhone })
      navigate('/')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <section>
      <h1>Register</h1>
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
        <FieldError message={error} />
      </form>
    </section>
  )
}

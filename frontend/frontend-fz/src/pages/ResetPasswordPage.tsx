import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '../api/authClient'
import { FieldError } from '../components/FieldError'
import { minLength } from '../utils/validation'

type ResetStep = 'requestOtp' | 'verifyOtp' | 'resetPassword' | 'done'

export function ResetPasswordPage() {
  const [step, setStep] = useState<ResetStep>('requestOtp')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')

  const isMobileValid = (value: string) => value.trim().length >= 10 && value.trim().length <= 20

  const onRequestOtp = async (event: FormEvent) => {
    event.preventDefault()

    if (!isMobileValid(mobile)) {
      setError('Enter a valid registered mobile number (10 to 20 digits with country code if needed).')
      return
    }

    setError('')
    try {
      const response = await authClient.requestPasswordResetOtp({ mobile: mobile.trim() })
      setInfo(response.data.message)
      setStep('verifyOtp')
    } catch {
      setError('Unable to send OTP. Please verify mobile number and try again.')
    }
  }

  const onVerifyOtp = async (event: FormEvent) => {
    event.preventDefault()

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter a valid 6-digit OTP.')
      return
    }

    setError('')
    try {
      const response = await authClient.verifyPasswordResetOtp({
        mobile: mobile.trim(),
        otp: otp.trim(),
      })
      setResetToken(response.data.resetToken)
      setInfo('OTP verified successfully. Set your new password.')
      setStep('resetPassword')
    } catch {
      setError('OTP verification failed. Please try again.')
    }
  }

  const onResetPassword = async (event: FormEvent) => {
    event.preventDefault()

    if (!minLength(newPassword, 8)) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setError('')
    try {
      const response = await authClient.resetPassword({
        resetToken,
        newPassword,
      })
      setInfo(response.data.message)
      setStep('done')
    } catch {
      setError('Password reset failed. Please try again.')
    }
  }

  return (
    <section>
      <h1>Reset Password</h1>
      <p>Complete OTP verification to set a new password for your account.</p>

      {info && <p className="info-text">{info}</p>}

      {step === 'requestOtp' && (
        <form onSubmit={onRequestOtp} className="stack">
          <label>
            Registered Mobile
            <input
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              placeholder="+919876543210"
              required
            />
          </label>
          <button type="submit">Send OTP</button>
          <FieldError message={error} />
        </form>
      )}

      {step === 'verifyOtp' && (
        <form onSubmit={onVerifyOtp} className="stack">
          <label>
            OTP
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
              required
            />
          </label>
          <div className="inline-actions">
            <button type="submit">Verify OTP</button>
            <button
              type="button"
              onClick={() => {
                setStep('requestOtp')
                setOtp('')
                setInfo('')
                setError('')
              }}
            >
              Resend OTP
            </button>
          </div>
          <FieldError message={error} />
        </form>
      )}

      {step === 'resetPassword' && (
        <form onSubmit={onResetPassword} className="stack">
          <label>
            New Password
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          <label>
            Confirm New Password
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          <button type="submit">Update Password</button>
          <FieldError message={error} />
        </form>
      )}

      {step === 'done' && (
        <div className="stack">
          <p>Password reset is complete.</p>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </section>
  )
}

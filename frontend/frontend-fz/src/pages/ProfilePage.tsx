import { useState, type FormEvent } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { userApi } from '../api/userApi'
import { AsyncState } from '../components/AsyncState'
import { FieldError } from '../components/FieldError'
import { useAsyncData } from '../hooks/useAsyncData'
import { isEmailValid, minLength } from '../utils/validation'

export function ProfilePage() {
  const { auth, updateAuthUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const enabled = Boolean(auth.user)
  const { loading, error: loadError } = useAsyncData(
    async () => {
      const response = await userApi.getMyProfile(
        auth.user
          ? {
              id: auth.user.id,
              displayName: auth.user.name,
              email: auth.user.email,
              role: auth.user.role,
              phone: auth.user.phone ?? null,
            }
          : null,
      )
      const profile = response.data
      setName(profile.displayName)
      setEmail(profile.email)
      setPhone(profile.phone ?? '')
      return profile
    },
    [auth.user?.id],
    enabled,
  )

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!minLength(name, 3) || !isEmailValid(email)) {
      setError('Enter a valid name and email before saving profile.')
      setMessage('')
      return
    }

    if (phone.trim() && !/^\+?[0-9]{10,20}$/.test(phone.trim())) {
      setError('Phone must be 10 to 20 digits (optional + prefix).')
      setMessage('')
      return
    }

    setError('')

    try {
      const response = await userApi.updateMyProfile(
        {
          displayName: name.trim(),
          phone: phone.trim() || undefined,
        },
        auth.user
          ? {
              id: auth.user.id,
              displayName: auth.user.name,
              email: auth.user.email,
              role: auth.user.role,
              phone: auth.user.phone ?? null,
            }
          : null,
      )

      const profile = response.data
      setName(profile.displayName)
      setEmail(profile.email)
      setPhone(profile.phone ?? '')
      updateAuthUser({
        id: profile.id,
        name: profile.displayName,
        email: profile.email,
        role: profile.role,
        phone: profile.phone ?? null,
      })
      setMessage(response.message || 'Profile updated successfully.')
    } catch {
      setError('Unable to update profile. Please try again.')
      setMessage('')
    }
  }

  return (
    <section className="stack-wide">
      <h1>My Profile</h1>
      <p>Signed in as role: {auth.user?.role}</p>
      <AsyncState loading={loading} error={loadError}>
        <form className="stack" onSubmit={onSubmit}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919876543210" />
          </label>
          <button type="submit">Save Profile</button>
        </form>
      </AsyncState>
      <FieldError message={error} />
      {message && <p className="success-text">{message}</p>}
    </section>
  )
}

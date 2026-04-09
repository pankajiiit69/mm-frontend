import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FieldError } from '../components/FieldError'

const RELATION_OPTIONS = [
  { value: 'SELF', label: 'Self', description: 'You are creating your own profile.' },
  { value: 'SON', label: 'Son', description: 'You are creating a profile for your son.' },
  { value: 'DAUGHTER', label: 'Daughter', description: 'You are creating a profile for your daughter.' },
  { value: 'BROTHER', label: 'Brother', description: 'You are creating a profile for your brother.' },
  { value: 'SISTER', label: 'Sister', description: 'You are creating a profile for your sister.' },
  { value: 'RELATIVE', label: 'Relative', description: 'You are creating a profile for a relative.' },
  { value: 'FRIEND', label: 'Friend', description: 'You are creating a profile for a friend.' },
] as const

export function RelationPage() {
  const navigate = useNavigate()
  const [relation, setRelation] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!relation) {
      setError('Please choose for whom you are creating this profile.')
      return
    }

    navigate('/profile', { state: { relation } })
  }

  return (
    <section className="auth-page">
      <div className="auth-layout">
        <article className="card auth-panel auth-panel-info stack-wide">
          <p className="auth-kicker">Step 1 of 2</p>
          <h1>Who is this profile for?</h1>
          <p className="auth-subtitle">
            Select the relation to start onboarding. On the next step, you will complete profile details.
          </p>
          <ul className="auth-benefits">
            <li>Choose the correct relation for better profile context</li>
            <li>Continue directly to profile creation after selection</li>
            <li>You can update profile details later from My Profile</li>
          </ul>
        </article>

        <article className="card auth-panel auth-panel-form stack-wide">
          <h2>Profile Relation</h2>
          <p className="auth-subtitle">Select one option below to proceed.</p>
          <form onSubmit={onSubmit} className="stack">
            <div className="relation-options-grid" role="radiogroup" aria-label="Creating profile for">
              {RELATION_OPTIONS.map((option) => {
                const isSelected = relation === option.value
                return (
                  <label
                    key={option.value}
                    className={`relation-option-card ${isSelected ? 'relation-option-card-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="relation"
                      value={option.value}
                      checked={isSelected}
                      onChange={(event) => setRelation(event.target.value)}
                      className="relation-option-input"
                    />
                    <span className="relation-option-title">{option.label}</span>
                    <span className="relation-option-description">{option.description}</span>
                  </label>
                )
              })}
            </div>

            <button type="submit">Continue to Profile Creation</button>
            <FieldError message={error} />
          </form>
        </article>
      </div>
    </section>
  )
}
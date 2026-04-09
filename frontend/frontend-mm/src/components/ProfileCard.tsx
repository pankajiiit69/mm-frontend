import { useState, type ReactNode } from 'react'
import { GenderAvatarArtwork } from './GenderAvatarArtwork'
import { formatEnumLabel } from '../utils/format'
import type { Gender, MatrimonyProfileSummary } from '../types/matrimony'

interface ProfileCardProps {
  profile: MatrimonyProfileSummary
  religionLabel?: string
  educationLabel?: string
  occupationLabel?: string
  avatarGender?: Gender
  actions: ReactNode
  onOpen?: () => void
}

export function ProfileCard({
  profile,
  religionLabel,
  educationLabel,
  occupationLabel,
  avatarGender,
  actions,
  onOpen,
}: ProfileCardProps) {
  const resolvedGender = profile.gender ?? avatarGender
  const [photoError, setPhotoError] = useState(false)
  const showAvatar = !profile.profilePhotoUrl || photoError
  const avatarClassName =
    resolvedGender === 'MALE'
      ? 'profile-card-fallback profile-card-fallback-male'
      : resolvedGender === 'FEMALE'
        ? 'profile-card-fallback profile-card-fallback-female'
        : 'profile-card-fallback'

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!onOpen) return
    if ((event.target as HTMLElement).closest('.inline-actions')) {
      return
    }
    onOpen()
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!onOpen) return
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    if ((event.target as HTMLElement).closest('.inline-actions')) {
      return
    }
    event.preventDefault()
    onOpen()
  }

  return (
    <article
      className={`card profile-result-card${onOpen ? ' profile-result-card-clickable' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
    >
      {profile.verified && (
        <span className="profile-card-verified-badge" aria-label="Verified profile" title="Verified profile">
          ✓
        </span>
      )}
      {profile.profilePhotoUrl && !showAvatar ? (
        <img
          className="profile-card-image"
          src={profile.profilePhotoUrl}
          alt={`${profile.fullName} profile`}
          onError={() => setPhotoError(true)}
        />
      ) : (
        <div className={avatarClassName} aria-label={`${profile.fullName} avatar`}>
          <GenderAvatarArtwork gender={resolvedGender} />
        </div>
      )}
      <h3>{profile.fullName}</h3>
      <p>Ref: {profile.referenceId}</p>
      <p>
        {profile.age} years • {formatEnumLabel(profile.maritalStatus)}
      </p>
      <p>
        {profile.city} • {religionLabel ?? profile.religion}
      </p>
      {profile.education && <p>Education: {educationLabel ?? profile.education}</p>}
      {profile.occupation && <p>Occupation: {occupationLabel ?? profile.occupation}</p>}
      <div className="inline-actions">{actions}</div>
    </article>
  )
}
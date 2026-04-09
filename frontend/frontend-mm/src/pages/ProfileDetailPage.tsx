import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { GenderAvatarArtwork } from '../components/GenderAvatarArtwork'
import { PhotoGalleryStrip } from '../components/PhotoGalleryStrip'
import { PhotoLightbox } from '../components/PhotoLightbox'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatEnumLabel } from '../utils/format'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

function asText(value: string | number | undefined | null, fallback = '-') {
  if (value === undefined || value === null) {
    return fallback
  }

  const normalized = String(value).trim()
  return normalized ? normalized : fallback
}

export function ProfileDetailPage() {
  const { profileId } = useParams<{ profileId: string }>()
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDownloadingBiodata, setIsDownloadingBiodata] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { showToast } = useToast()

  const enabled = Boolean(profileId)

  const { data, loading, error } = useAsyncData(
    async () => {
      if (!profileId) {
        throw new Error('Profile id is missing.')
      }
      const response = await matrimonyApi.getProfileById(profileId)
      return response.data
    },
    [profileId],
    enabled,
  )
  const profile = data
  const lightboxImages =
    profile?.galleryPhotos?.map((photo, index) => ({
      imageUrl: photo.photoUrl,
      alt: `${profile.fullName} gallery ${index + 1}`,
    })) ?? []
  const profileAvatarClassName =
    profile?.gender === 'MALE'
      ? 'profile-upload-preview profile-card-fallback profile-card-fallback-male'
      : profile?.gender === 'FEMALE'
        ? 'profile-upload-preview profile-card-fallback profile-card-fallback-female'
        : 'profile-upload-preview profile-card-fallback'

  const onSendInterest = async () => {
    if (!profileId) return
    setMessage('')
    setErrorMessage('')
    try {
      const response = await matrimonyApi.sendInterest({ toProfileId: Number(profileId) })
      setMessage(response.message || 'Interest sent successfully.')
      showToast(response.message || 'Interest sent successfully.', 'success')
    } catch (err) {
      setErrorMessage('Unable to send interest to this profile.')
      showToast(extractApiError(err, 'Unable to send interest to this profile.'), 'error')
    }
  }

  const onShortlist = async () => {
    if (!profileId) return
    setMessage('')
    setErrorMessage('')
    try {
      const response = await matrimonyApi.addProfileToShortlist(profileId)
      setMessage(response.message || 'Profile shortlisted successfully.')
      showToast(response.message || 'Profile shortlisted successfully.', 'success')
    } catch (err) {
      setErrorMessage('Unable to shortlist this profile.')
      showToast(extractApiError(err, 'Unable to shortlist this profile.'), 'error')
    }
  }

  const onDownloadBiodata = async () => {
    if (!profileId) return

    setMessage('')
    setErrorMessage('')
    setIsDownloadingBiodata(true)

    try {
      const { blob, fileName } = await matrimonyApi.downloadBiodataByProfileId(profileId)
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || 'biodata.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      setMessage('Biodata downloaded successfully.')
      showToast('Biodata downloaded successfully.', 'success')
    } catch (err) {
      setErrorMessage('Biodata not available for this profile.')
      showToast(extractApiError(err, 'Biodata not available for this profile.'), 'error')
    } finally {
      setIsDownloadingBiodata(false)
    }
  }

  return (
    <section className="stack-wide">
      <div className="inline-actions">
        <Link to="/">← Back to Discover</Link>
      </div>

      <AsyncState loading={loading} error={error}>
        {profile && (
          <article className="card stack-wide">
            <div className="profile-heading-row">
              <h1>{profile.fullName}</h1>
              <span className="profile-reference-chip">Ref ID: {profile.referenceId}</span>
            </div>
            <p>
              {profile.age} years • {formatEnumLabel(profile.gender)} • {formatEnumLabel(profile.maritalStatus)}
            </p>

            <h3>Photos</h3>
            <div className="stack-wide">
              <div className="stack">
                <strong>Profile Photo</strong>
                {profile.profilePhotoUrl ? (
                  <img className="profile-upload-preview" src={profile.profilePhotoUrl} alt={profile.fullName} />
                ) : (
                  <div className={profileAvatarClassName} aria-label={`${profile.fullName} avatar`}>
                    <GenderAvatarArtwork gender={profile.gender} />
                  </div>
                )}

                <strong>Gallery Photos</strong>
                <PhotoGalleryStrip
                  photos={profile.galleryPhotos ?? []}
                  emptyText="No gallery photos available."
                  onOpenPhoto={setSelectedImageIndex}
                  getImageAlt={(index) => `${profile.fullName} gallery ${index + 1}`}
                  getOpenAriaLabel={(index) => `Open ${profile.fullName} gallery ${index + 1}`}
                />
              </div>

              <div className="stack">
                <strong>Biodata (PDF)</strong>
                {profile.biodataUrl ? (
                  <div className="inline-actions">
                    <span className="info-text">Available</span>
                    <button
                      type="button"
                      className="biodata-icon-button"
                      disabled={isDownloadingBiodata}
                      onClick={() => void onDownloadBiodata()}
                    >
                      {isDownloadingBiodata ? 'Downloading...' : '↓'}
                    </button>
                  </div>
                ) : (
                  <span className="info-text">Not shared</span>
                )}
              </div>
            </div>

            <h3>Basic Details</h3>
            <div className="toolbar-grid">
              <label>
                Full Name
                <input value={profile.fullName} readOnly />
              </label>
              <label>
                Gender
                <input value={formatEnumLabel(profile.gender)} readOnly />
              </label>
              <label>
                Date Of Birth
                <input value={asText(profile.dateOfBirth)} readOnly />
              </label>
              <label>
                Religion
                <input value={asText(profile.religion)} readOnly />
              </label>
              <label>
                Mother Tongue
                <input value={asText(profile.motherTongue)} readOnly />
              </label>
              <label>
                Caste
                <input value={asText(profile.caste)} readOnly />
              </label>
              <label>
                Marital Status
                <input value={formatEnumLabel(profile.maritalStatus)} readOnly />
              </label>
              <label>
                City
                <input value={asText(profile.city)} readOnly />
              </label>
              <label>
                State
                <input value={asText(profile.state)} readOnly />
              </label>
              <label>
                Country
                <input value={asText(profile.country)} readOnly />
              </label>
              <label>
                Education
                <input value={asText(profile.education)} readOnly />
              </label>
              <label>
                Occupation
                <input value={asText(profile.occupation)} readOnly />
              </label>
              <label>
                Annual Income (INR)
                <input value={`₹${Math.round(profile.annualIncome ?? 0).toLocaleString('en-IN')}`} readOnly />
              </label>
              <label>
                Profile Completion
                <input value={`${profile.profileCompletion}%`} readOnly />
              </label>
            </div>

            <label>
              Bio
              <textarea value={asText(profile.bio, 'Not shared')} rows={4} readOnly />
            </label>

            <h3>Partner Preferences</h3>
            <div className="toolbar-grid">
              <label>
                Preferred City
                <input value={asText(profile.preference?.preferredCity)} readOnly />
              </label>
              <label>
                Preferred Religion
                <input value={asText(profile.preference?.preferredReligion)} readOnly />
              </label>
              <label>
                Preferred Caste
                <input value={asText(profile.preference?.preferredCaste)} readOnly />
              </label>
              <label>
                Preferred Education
                <input value={asText(profile.preference?.preferredEducation)} readOnly />
              </label>
              <label>
                Preferred Min Age
                <input value={asText(profile.preference?.minAge)} readOnly />
              </label>
              <label>
                Preferred Max Age
                <input value={asText(profile.preference?.maxAge)} readOnly />
              </label>
            </div>

            <div className="inline-actions">
              <button onClick={() => void onSendInterest()}>Send Interest</button>
              <button onClick={() => void onShortlist()}>Add to Shortlist</button>
            </div>

            {message && <p className="success-text">{message}</p>}
            {errorMessage && <p className="error-text">{errorMessage}</p>}

            {selectedImageIndex !== null && lightboxImages.length > 0 && (
              <PhotoLightbox
                images={lightboxImages}
                currentIndex={selectedImageIndex}
                onNavigate={setSelectedImageIndex}
                onClose={() => setSelectedImageIndex(null)}
              />
            )}
          </article>
        )}
      </AsyncState>
    </section>
  )
}
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { GenderAvatarArtwork } from '../components/GenderAvatarArtwork'
import { PhotoIdentifierImage } from '../components/PhotoIdentifierImage'
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

function asYesNo(value: boolean | undefined | null) {
  if (value === undefined || value === null) return '-'
  return value ? 'Yes' : 'No'
}

function asList(values: string[] | undefined, fallback = '-') {
  if (!values || values.length === 0) return fallback
  return values.join(', ')
}

export function ProfileDetailPage() {
  const { referenceId } = useParams<{ referenceId: string }>()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isDownloadingBiodata, setIsDownloadingBiodata] = useState(false)
  const [isShortlistBusy, setIsShortlistBusy] = useState(false)
  const [shortlistOverride, setShortlistOverride] = useState<boolean | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { showToast } = useToast()

  const enabled = Boolean(referenceId)

  const { data, loading, error } = useAsyncData(
    async () => {
      if (!referenceId) {
        throw new Error('Reference id is missing.')
      }
      const response = await matrimonyApi.getProfileByReferenceId(referenceId)
      return response.data
    },
    [referenceId],
    enabled,
  )
  const profile = data?.profile
  const connection = data?.connection
  const isShortlisted = shortlistOverride ?? Boolean(connection?.shortlisted)
  const hasInterest = Boolean(connection?.interestSentStatus || connection?.interestReceivedStatus)
  const lightboxImages =
    profile?.galleryPhotos?.map((photo, index) => ({
      photoIdentifier: photo.photoIdentifier,
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
    if (!profile?.profileId) return
    setMessage('')
    setErrorMessage('')
    try {
      const response = await matrimonyApi.sendInterest({ toProfileId: Number(profile.profileId) })
      setMessage(response.message || 'Interest sent successfully.')
      showToast(response.message || 'Interest sent successfully.', 'success')
    } catch (err) {
      setErrorMessage('Unable to send interest to this profile.')
      showToast(extractApiError(err, 'Unable to send interest to this profile.'), 'error')
    }
  }

  const onToggleShortlist = async () => {
    if (!profile?.profileId) return
    setMessage('')
    setErrorMessage('')
    setIsShortlistBusy(true)

    try {
      if (isShortlisted) {
        const response = await matrimonyApi.removeProfileFromShortlist(profile.profileId)
        setShortlistOverride(false)
        setMessage(response.message || 'Profile removed from shortlist.')
        showToast(response.message || 'Profile removed from shortlist.', 'success')
      } else {
        const response = await matrimonyApi.addProfileToShortlist(profile.profileId)
        setShortlistOverride(true)
        setMessage(response.message || 'Profile shortlisted successfully.')
        showToast(response.message || 'Profile shortlisted successfully.', 'success')
      }
    } catch (err) {
      setErrorMessage('Unable to update shortlist for this profile.')
      showToast(extractApiError(err, 'Unable to update shortlist for this profile.'), 'error')
    } finally {
      setIsShortlistBusy(false)
    }
  }

  const onDownloadBiodata = async () => {
    if (!profile?.profileId) return

    setMessage('')
    setErrorMessage('')
    setIsDownloadingBiodata(true)

    try {
      const { blob, fileName } = await matrimonyApi.downloadBiodataByProfileId(profile.profileId)
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
                {profile.profilePhotoIdentifier || profile.profilePhotoUrl ? (
                  <PhotoIdentifierImage
                    className="profile-upload-preview"
                    photoIdentifier={profile.profilePhotoIdentifier}
                    fallbackSrc={profile.profilePhotoUrl}
                    alt={profile.fullName}
                    fallback={
                      <div className={profileAvatarClassName} aria-label={`${profile.fullName} avatar`}>
                        <GenderAvatarArtwork gender={profile.gender} />
                      </div>
                    }
                  />
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
                {profile.biodataIdentifier ? (
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
                Relation To User
                <input value={asText(profile.relationToUser ? formatEnumLabel(profile.relationToUser) : undefined)} readOnly />
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
                Area Code (PIN/ZIP)
                <input value={asText(profile.areaCode)} readOnly />
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
            </div>

            <h3>Community Details</h3>
            <div className="toolbar-grid">
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
                Sub Caste
                <input value={asText(profile.subCaste)} readOnly />
              </label>
              <label>
                Languages Known
                <input value={asList(profile.languagesKnown)} readOnly />
              </label>
            </div>

            <h3>Professional Details</h3>
            <div className="toolbar-grid">
              <label>
                Education
                <input value={asText(profile.education)} readOnly />
              </label>
              <label>
                Occupation
                <input value={asText(profile.occupation)} readOnly />
              </label>
              <label>
                Employment Type
                <input value={asText(profile.employmentType ? formatEnumLabel(profile.employmentType) : undefined)} readOnly />
              </label>
              <label>
                Company Name
                <input value={asText(profile.companyName)} readOnly />
              </label>
              <label>
                Work Location
                <input value={asText(profile.workLocation)} readOnly />
              </label>
              <label>
                Annual Income (INR)
                <input value={`₹${Math.round(profile.annualIncome ?? 0).toLocaleString('en-IN')}`} readOnly />
              </label>
              <label>
                Height (cm)
                <input value={asText(profile.heightCm)} readOnly />
              </label>
              <label>
                Diet
                <input value={asText(profile.diet ? formatEnumLabel(profile.diet) : undefined)} readOnly />
              </label>
              <label>
                Smoking
                <input value={asYesNo(profile.smoking)} readOnly />
              </label>
              <label>
                Drinking
                <input value={asYesNo(profile.drinking)} readOnly />
              </label>
              <label>
                Fitness Level
                <input value={asText(profile.fitnessLevel)} readOnly />
              </label>
              <label>
                Hobbies
                <input value={asList(profile.hobbies)} readOnly />
              </label>
              <label>
                Willing To Relocate
                <input value={asYesNo(profile.willingToRelocate)} readOnly />
              </label>
              <label>
                Profile Completion
                <input value={`${profile.profileCompletion}%`} readOnly />
              </label>
            </div>

            <h3>Horoscope Details</h3>
            <div className="toolbar-grid">
              <label>
                Gothra
                <input value={asText(profile.gothra)} readOnly />
              </label>
              <label>
                Manglik
                <input value={asYesNo(profile.manglik)} readOnly />
              </label>
              <label>
                Horoscope Available
                <input value={asYesNo(profile.horoscopeAvailable)} readOnly />
              </label>
            </div>

            <label>
              Bio
              <textarea value={asText(profile.bio, 'Not shared')} rows={4} readOnly />
            </label>

            <h3>Family Details</h3>
            <div className="toolbar-grid">
              <label>
                Family Type
                <input value={asText(profile.familyType ? formatEnumLabel(profile.familyType) : undefined)} readOnly />
              </label>
              <label>
                Family Values
                <input value={asText(profile.familyValues ? formatEnumLabel(profile.familyValues) : undefined)} readOnly />
              </label>
              <label>
                Father's Occupation
                <input value={asText(profile.fatherOccupation)} readOnly />
              </label>
              <label>
                Mother's Occupation
                <input value={asText(profile.motherOccupation)} readOnly />
              </label>
              <label>
                Siblings Count
                <input value={asText(profile.siblingsCount)} readOnly />
              </label>
              <label>
                Family Location
                <input value={asText(profile.familyLocation)} readOnly />
              </label>
            </div>

            <label>
              About Family
              <textarea value={asText(profile.aboutFamily, 'Not shared')} rows={3} readOnly />
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
                Preferred Occupation
                <input value={asText(profile.preference?.preferredOccupation)} readOnly />
              </label>
              <label>
                Preferred Location
                <input value={asText(profile.preference?.preferredLocation)} readOnly />
              </label>
              <label>
                Preferred Min Height (cm)
                <input value={asText(profile.preference?.preferredHeightMinCm)} readOnly />
              </label>
              <label>
                Preferred Max Height (cm)
                <input value={asText(profile.preference?.preferredHeightMaxCm)} readOnly />
              </label>
              <label>
                Preferred Min Age
                <input value={asText(profile.preference?.minAge)} readOnly />
              </label>
              <label>
                Preferred Max Age
                <input value={asText(profile.preference?.maxAge)} readOnly />
              </label>
              <label>
                Must Haves
                <input value={asList(profile.preference?.mustHaves)} readOnly />
              </label>
              <label>
                Deal Breakers
                <input value={asList(profile.preference?.dealBreakers)} readOnly />
              </label>
            </div>

            <h3>Privacy and Verification</h3>
            <div className="toolbar-grid">
              <label>
                Profile Visibility
                <input value={asText(profile.profileVisibility ? formatEnumLabel(profile.profileVisibility) : undefined)} readOnly />
              </label>
              <label>
                Photo Visibility
                <input value={asText(profile.photoVisibility ? formatEnumLabel(profile.photoVisibility) : undefined)} readOnly />
              </label>
              <label>
                Contact Visibility
                <input value={asText(profile.contactVisibility ? formatEnumLabel(profile.contactVisibility) : undefined)} readOnly />
              </label>
              <label>
                ID Verified
                <input value={asYesNo(profile.idVerified)} readOnly />
              </label>
            </div>

            <div className="inline-actions">
              {hasInterest ? (
                <button type="button" onClick={() => navigate('/interests')}>View Interest</button>
              ) : (
                <button type="button" onClick={() => void onSendInterest()}>Send Interest</button>
              )}
              <button type="button" disabled={isShortlistBusy} onClick={() => void onToggleShortlist()}>
                {isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
              </button>
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
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@fruzoos/auth-core'
import { useLocation } from 'react-router-dom'
import { getAuthenticatedUser } from '../api/authClient'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { FieldError } from '../components/FieldError'
import { GenderAvatarArtwork } from '../components/GenderAvatarArtwork'
import { PhotoIdentifierImage } from '../components/PhotoIdentifierImage'
import { PhotoGalleryStrip } from '../components/PhotoGalleryStrip'
import { PhotoLightbox } from '../components/PhotoLightbox'
import { PicklistSingleSelect } from '../components/PicklistSingleSelect'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'
import {
  getProfileDescription,
  getProfileHeading,
  getSaveProfileButtonLabel,
} from '../utils/profileRelationText'
import type { Gender, MaritalStatus, PicklistItem, Photo } from '../types/matrimony'

function parseCsvToPicklistItems(value: string | undefined): PicklistItem[] {
  if (!value?.trim()) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ name: item, value: item }))
}

function firstCsvItem(value: string | undefined): string {
  return parseCsvToPicklistItems(value)[0]?.name ?? ''
}

function resolvePicklistItem(options: PicklistItem[], name: string): PicklistItem | null {
  if (!name) return null
  const matched = options.find((option) => option.name === name)
  return matched ?? { name, value: name }
}

function getDefaultAdultDateOfBirth() {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
}

const AGE_OPTIONS = Array.from({ length: 63 }, (_, index) => String(index + 18))

export function ProfilePage() {
  const { auth, updateAuthUser } = useAuth()
  const location = useLocation()
  const routerRelation = (location.state as { relation?: string } | null)?.relation ?? null

  const [profileRelation, setProfileRelation] = useState<string | null>(routerRelation)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'' | Gender>('')
  const [dateOfBirth, setDateOfBirth] = useState(getDefaultAdultDateOfBirth)
  const [religion, setReligion] = useState('')
  const [motherTongue, setMotherTongue] = useState('')
  const [maritalStatus, setMaritalStatus] = useState<'' | MaritalStatus>('')
  const [city, setCity] = useState('')
  const [selectedCaste, setSelectedCaste] = useState<PicklistItem | null>(null)
  const [selectedEducation, setSelectedEducation] = useState<PicklistItem | null>(null)
  const [selectedOccupation, setSelectedOccupation] = useState<PicklistItem | null>(null)
  const [annualIncome, setAnnualIncome] = useState('')
  const [bio, setBio] = useState('')
  const [profilePhotoIdentifier, setProfilePhotoIdentifier] = useState('')
  const [profilePhotoFallbackUrl, setProfilePhotoFallbackUrl] = useState('')
  const [preferredCity, setPreferredCity] = useState('')
  const [preferredReligion, setPreferredReligion] = useState<PicklistItem | null>(null)
  const [preferredCaste, setPreferredCaste] = useState<PicklistItem | null>(null)
  const [preferredEducation, setPreferredEducation] = useState<PicklistItem | null>(null)
  const [preferredMinAge, setPreferredMinAge] = useState('')
  const [preferredMaxAge, setPreferredMaxAge] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { showToast } = useToast()
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false)
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState(false)
  const [isUploadingBiodata, setIsUploadingBiodata] = useState(false)
  const [isDownloadingBiodata, setIsDownloadingBiodata] = useState(false)
  const [pendingProfilePhotoFile, setPendingProfilePhotoFile] = useState<File | null>(null)
  const [biodataUrl, setBiodataUrl] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const galleryPhotoInputRef = useRef<HTMLInputElement>(null)
  const biodataInputRef = useRef<HTMLInputElement>(null)

  const { data: educations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('EDUCATION')
  }, [])

  const { data: occupations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('OCCUPATION')
  }, [])

  const { data: religions } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('RELIGION')
  }, [])

  const { data: castes } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('CASTE')
  }, [])

  const { data: motherTongues } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('MOTHER_TONGUE')
  }, [])

  const profileAvatarClassName =
    gender === 'MALE'
      ? 'profile-upload-preview profile-photo-add-trigger profile-card-fallback profile-card-fallback-male'
      : gender === 'FEMALE'
        ? 'profile-upload-preview profile-photo-add-trigger profile-card-fallback profile-card-fallback-female'
        : 'profile-upload-preview profile-photo-add-trigger profile-card-fallback'

  const educationOptions = useMemo(() => educations ?? [], [educations])
  const occupationOptions = useMemo(() => occupations ?? [], [occupations])
  const religionOptions = useMemo(() => religions ?? [], [religions])
  const casteOptions = useMemo(() => castes ?? [], [castes])
  const motherTongueOptions = useMemo(() => motherTongues ?? [], [motherTongues])
  const biodataDisplayName = 'biodata'
  const profileHeading = getProfileHeading(profileRelation)
  const profileDescription = getProfileDescription(profileRelation)
  const saveProfileLabel = getSaveProfileButtonLabel(profileRelation)

  const enabled = Boolean(auth.user)
  const isProfileNotCreated = auth.user?.verificationStatus?.trim().toUpperCase() === 'PROFILE_NOT_CREATED'
  const shouldLoadExistingProfile = enabled && !isProfileNotCreated
  const {
    data: galleryPhotosData,
    loading: galleryLoading,
    error: galleryError,
    reload: reloadGallery,
  } = useAsyncData(
    async () => {
      const response = await matrimonyApi.listGalleryPhotos()
      return response.data
    },
    [auth.user?.id],
    shouldLoadExistingProfile,
  )

  const galleryPhotos = galleryPhotosData ?? []
  const lightboxImages = galleryPhotos.map((photo, index) => ({
    photoIdentifier: photo.photoIdentifier,
    imageUrl: photo.photoUrl,
    alt: `Gallery photo ${index + 1}`,
  }))

  const { loading, error: loadError } = useAsyncData(
    async () => {
      const response = await matrimonyApi.getMyProfile()
      const profile = response.data
      setReferenceId(profile.referenceId ?? '')
      setName(profile.fullName)
      setGender(profile.gender)
      setDateOfBirth(profile.dateOfBirth ?? '')
      setMotherTongue(profile.motherTongue ?? '')
      setReligion(profile.religion)
      setMaritalStatus(profile.maritalStatus)
      setCity(profile.city)
      setSelectedCaste(resolvePicklistItem(casteOptions, profile.caste ?? ''))
      setSelectedEducation(resolvePicklistItem(educationOptions, firstCsvItem(profile.education)))
      setSelectedOccupation(resolvePicklistItem(occupationOptions, firstCsvItem(profile.occupation)))
      setAnnualIncome(String(profile.annualIncome ?? ''))
      setBio(profile.bio ?? '')
      setProfilePhotoIdentifier(profile.profilePhotoIdentifier ?? '')
      setProfilePhotoFallbackUrl(profile.profilePhotoUrl ?? '')
      setBiodataUrl(profile.biodataUrl ?? '')
      setProfileRelation(profile.relationToUser ?? null)
      setPreferredCity(profile.preference?.preferredCity ?? '')
      setPreferredReligion(resolvePicklistItem(religionOptions, profile.preference?.preferredReligion ?? ''))
      setPreferredCaste(resolvePicklistItem(casteOptions, profile.preference?.preferredCaste ?? ''))
      setPreferredEducation(resolvePicklistItem(educationOptions, profile.preference?.preferredEducation ?? ''))
      setPreferredMinAge(profile.preference?.minAge ? String(profile.preference.minAge) : '')
      setPreferredMaxAge(profile.preference?.maxAge ? String(profile.preference.maxAge) : '')
      return profile
    },
    [auth.user?.id],
    shouldLoadExistingProfile,
  )

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters long.')
      showToast('Full name must be at least 2 characters long.', 'error')
      setMessage('')
      return
    }

    if (!dateOfBirth || !gender || !maritalStatus || !religion.trim() || !city.trim()) {
      setError('Date of birth, gender, marital status, religion, and city are required.')
      showToast('Date of birth, gender, marital status, religion, and city are required.', 'error')
      setMessage('')
      return
    }

    setError('')

    try {
      const response = await matrimonyApi.upsertMyProfile({
        fullName: name.trim(),
        gender,
        dateOfBirth: dateOfBirth || undefined,
        motherTongue: motherTongue || undefined,
        religion: religion.trim(),
        caste: selectedCaste?.name || undefined,
        maritalStatus,
        city: city.trim(),
        education: selectedEducation?.name || undefined,
        occupation: selectedOccupation?.name || undefined,
        annualIncome: annualIncome ? Number(annualIncome) : undefined,
        bio: bio.trim() || undefined,
        relationToUser: profileRelation || undefined,
        preference: {
          preferredCity: preferredCity.trim() || undefined,
          preferredReligion: preferredReligion?.name || undefined,
          preferredCaste: preferredCaste?.name || undefined,
          preferredEducation: preferredEducation?.name || undefined,
          minAge: preferredMinAge ? Number(preferredMinAge) : undefined,
          maxAge: preferredMaxAge ? Number(preferredMaxAge) : undefined,
        },
      })

      const profile = response.data
      setReferenceId(profile.referenceId ?? '')
      setName(profile.fullName)
      setGender(profile.gender)
      setDateOfBirth(profile.dateOfBirth ?? '')
      setMotherTongue(profile.motherTongue ?? '')
      setReligion(profile.religion)
      setMaritalStatus(profile.maritalStatus)
      setCity(profile.city)
      setSelectedCaste(resolvePicklistItem(casteOptions, profile.caste ?? ''))
      setSelectedEducation(resolvePicklistItem(educationOptions, firstCsvItem(profile.education)))
      setSelectedOccupation(resolvePicklistItem(occupationOptions, firstCsvItem(profile.occupation)))
      setAnnualIncome(String(profile.annualIncome ?? ''))
      setBio(profile.bio ?? '')
      setProfilePhotoIdentifier(profile.profilePhotoIdentifier ?? '')
      setProfilePhotoFallbackUrl(profile.profilePhotoUrl ?? '')
      setBiodataUrl(profile.biodataUrl ?? '')
      setProfileRelation(profile.relationToUser ?? null)
      setPreferredCity(profile.preference?.preferredCity ?? '')
      setPreferredReligion(resolvePicklistItem(religionOptions, profile.preference?.preferredReligion ?? ''))
      setPreferredCaste(resolvePicklistItem(casteOptions, profile.preference?.preferredCaste ?? ''))
      setPreferredEducation(resolvePicklistItem(educationOptions, profile.preference?.preferredEducation ?? ''))
      setPreferredMinAge(profile.preference?.minAge ? String(profile.preference.minAge) : '')
      setPreferredMaxAge(profile.preference?.maxAge ? String(profile.preference.maxAge) : '')

      updateAuthUser({
        id: auth.user?.id ?? '',
        name: profile.fullName,
        email: auth.user?.email ?? '',
        role: auth.user?.role ?? 'USER',
        phone: auth.user?.phone ?? null,
        verificationStatus: auth.user?.verificationStatus ?? null,
      })
      // After first profile creation, refresh verificationStatus from /api/auth/me
      if (isProfileNotCreated) {
        try {
          const fresh = await getAuthenticatedUser()
          updateAuthUser(fresh)
        } catch {
          // non-critical
        }
      }
      setMessage(response.message || 'Profile updated successfully.')
      showToast(response.message || 'Profile updated successfully.', 'success')
    } catch (err) {
      setError('Unable to update profile. Please try again.')
      showToast(extractApiError(err, 'Unable to update profile. Please try again.'), 'error')
      setMessage('')
    }
  }

  const onUploadProfilePhoto = async (file: File) => {
    setIsUploadingProfilePhoto(true)

    try {
      const response = await matrimonyApi.uploadProfilePhoto(file)
      setProfilePhotoIdentifier(response.data.photoIdentifier ?? '')
      setProfilePhotoFallbackUrl(response.data.photoUrl ?? '')
      showToast(response.message || 'Profile photo uploaded successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to upload profile photo. Please try again.'), 'error')
    } finally {
      setIsUploadingProfilePhoto(false)
    }
  }

  const onUploadGalleryPhoto = async (file: File) => {
    setIsUploadingGalleryPhoto(true)

    try {
      const response = await matrimonyApi.uploadGalleryPhoto(file)
      showToast(response.message || 'Gallery photo uploaded successfully.', 'success')
      await reloadGallery()
    } catch (err) {
      showToast(extractApiError(err, 'Unable to upload gallery photo. Please try again.'), 'error')
    } finally {
      setIsUploadingGalleryPhoto(false)
    }
  }

  const onDeleteGalleryPhoto = async (photo: Photo) => {
    if (!photo.id) {
      showToast('Unable to delete this photo.', 'error')
      return
    }

    const shouldDelete = window.confirm('Are you sure you want to delete this photo?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await matrimonyApi.deleteGalleryPhoto(photo.id)
      showToast(response.message || 'Gallery photo deleted successfully.', 'success')
      await reloadGallery()
    } catch (err) {
      showToast(extractApiError(err, 'Unable to delete gallery photo. Please try again.'), 'error')
    }
  }

  const onDeleteProfilePhoto = async () => {
    if (!profilePhotoIdentifier && !profilePhotoFallbackUrl) {
      return
    }

    const shouldDelete = window.confirm('Are you sure you want to delete your profile photo?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await matrimonyApi.upsertMyProfile({ profilePhotoIdentifier: '' })
      setProfilePhotoIdentifier(response.data.profilePhotoIdentifier ?? '')
      setProfilePhotoFallbackUrl(response.data.profilePhotoUrl ?? '')
      showToast(response.message || 'Profile photo deleted successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to delete profile photo. Please try again.'), 'error')
    }
  }

  const onUploadBiodata = async (file: File) => {
    setIsUploadingBiodata(true)

    try {
      const response = await matrimonyApi.uploadBiodata(file)
      const refreshedProfile = await matrimonyApi.getMyProfile()
      setBiodataUrl(refreshedProfile.data.biodataUrl ?? '')
      showToast(response.message || 'Biodata uploaded successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to upload biodata. Please try again.'), 'error')
    } finally {
      setIsUploadingBiodata(false)
    }
  }

  const onDeleteBiodata = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete biodata?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await matrimonyApi.deleteMyBiodata()
      setBiodataUrl('')
      showToast(response.message || 'Biodata deleted successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to delete biodata. Please try again.'), 'error')
    }
  }

  const onDownloadBiodata = async () => {
    if (!biodataUrl) {
      showToast('Biodata not available.', 'error')
      return
    }

    setIsDownloadingBiodata(true)

    try {
      const { blob, fileName } = await matrimonyApi.downloadMyBiodata()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || 'biodata.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      showToast('Biodata downloaded successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to download biodata. Please try again.'), 'error')
    } finally {
      setIsDownloadingBiodata(false)
    }
  }

  return (
    <section className="stack-wide">
      <div className="profile-heading-row">
        <h1>{profileHeading}</h1>
        {referenceId && <span className="profile-reference-chip">Ref ID: {referenceId}</span>}
      </div>
      <p>{profileDescription}</p>
      <AsyncState loading={loading} error={loadError}>
        <form className="stack-wide" onSubmit={onSubmit}>
          <h3>Photos</h3>
          <div className="stack-wide">
            <div className="stack">
              <strong>Profile Photo</strong>
              <div className="profile-photo-editable">
                {profilePhotoIdentifier || profilePhotoFallbackUrl ? (
                  <PhotoIdentifierImage
                    className="profile-upload-preview"
                    photoIdentifier={profilePhotoIdentifier}
                    fallbackSrc={profilePhotoFallbackUrl}
                    alt="Profile"
                    fallback={
                      <button
                        type="button"
                        className={profileAvatarClassName}
                        aria-label="Add profile photo"
                        disabled={isUploadingProfilePhoto}
                        onClick={() => profilePhotoInputRef.current?.click()}
                      >
                        <GenderAvatarArtwork gender={gender} />
                      </button>
                    }
                  />
                ) : (
                  <button
                    type="button"
                    className={profileAvatarClassName}
                    aria-label="Add profile photo"
                    disabled={isUploadingProfilePhoto}
                    onClick={() => profilePhotoInputRef.current?.click()}
                  >
                    <GenderAvatarArtwork gender={gender} />
                  </button>
                )}
                <button
                  type="button"
                  className="photo-icon-button photo-icon-edit"
                  aria-label="Edit profile photo"
                  disabled={isUploadingProfilePhoto || (!profilePhotoIdentifier && !profilePhotoFallbackUrl)}
                  onClick={() => profilePhotoInputRef.current?.click()}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="photo-icon-button photo-icon-delete"
                  aria-label="Delete profile photo"
                  disabled={isUploadingProfilePhoto || (!profilePhotoIdentifier && !profilePhotoFallbackUrl)}
                  onClick={() => void onDeleteProfilePhoto()}
                >
                  ✕
                </button>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isUploadingProfilePhoto}
                  className="visually-hidden-file-input"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    setPendingProfilePhotoFile(file)
                    void onUploadProfilePhoto(file).then(() => {
                      setPendingProfilePhotoFile(null)
                      event.target.value = ''
                    })
                  }}
                />
              </div>
              {isUploadingProfilePhoto && <p className="info-text">Uploading profile photo...</p>}
              {pendingProfilePhotoFile && !isUploadingProfilePhoto && (
                <p className="info-text">Selected: {pendingProfilePhotoFile.name}</p>
              )}
            </div>

            <div className="stack-wide">
              <div className="stack">
                <strong>Gallery Photos</strong>
                {isUploadingGalleryPhoto && <p className="info-text">Uploading gallery photo...</p>}
              </div>

              {galleryLoading && <p className="info-text">Loading gallery...</p>}
              {galleryError && <p className="error-text">{galleryError}</p>}

              {!galleryLoading && !galleryError && (
                <>
                  <PhotoGalleryStrip
                    photos={galleryPhotos}
                    emptyText="No gallery photos yet."
                    onOpenPhoto={setSelectedImageIndex}
                    getImageAlt={(index) => `Gallery photo ${index + 1}`}
                    getOpenAriaLabel={() => 'Open gallery photo'}
                    leadingContent={
                      <article className="photo-gallery-card photo-gallery-add-card">
                        <button
                          type="button"
                          className="photo-gallery-add-trigger"
                          aria-label="Add gallery photo"
                          disabled={isUploadingGalleryPhoto}
                          onClick={() => galleryPhotoInputRef.current?.click()}
                        >
                          +
                        </button>
                        <input
                          ref={galleryPhotoInputRef}
                          type="file"
                          accept="image/*"
                          disabled={isUploadingGalleryPhoto}
                          className="visually-hidden-file-input"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (!file) return
                            void onUploadGalleryPhoto(file).finally(() => {
                              event.target.value = ''
                            })
                          }}
                        />
                      </article>
                    }
                    renderPhotoAction={(photo) => (
                      <button
                        type="button"
                        className="photo-icon-button photo-icon-delete"
                        aria-label="Delete gallery photo"
                        onClick={() => void onDeleteGalleryPhoto(photo)}
                      >
                        ✕
                      </button>
                    )}
                  />
                </>
              )}
            </div>

            {selectedImageIndex !== null && lightboxImages.length > 0 && (
              <PhotoLightbox
                images={lightboxImages}
                currentIndex={selectedImageIndex}
                onNavigate={setSelectedImageIndex}
                onClose={() => setSelectedImageIndex(null)}
              />
            )}
          </div>

          <h3>Basic Details</h3>
          <div className="toolbar-grid">
            <label>
              <span className="field-label">Full Name <span className="required-mark">*</span></span>
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              <span className="field-label">Gender <span className="required-mark">*</span></span>
              <select value={gender} onChange={(event) => setGender(event.target.value as '' | Gender)} required>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label>
              <span className="field-label">Date Of Birth <span className="required-mark">*</span></span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                required
              />
            </label>
            <label>
              <span className="field-label">Religion <span className="required-mark">*</span></span>
              <select value={religion} onChange={(event) => setReligion(event.target.value)} required>
                <option value="">Select religion</option>
                {religionOptions.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mother Tongue
              <select value={motherTongue} onChange={(event) => setMotherTongue(event.target.value)}>
                <option value="">Select mother tongue</option>
                {motherTongueOptions.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.value}
                  </option>
                ))}
              </select>
            </label>
            <PicklistSingleSelect
              label="Caste"
              placeholder="Type to search caste"
              options={casteOptions}
              selectedItem={selectedCaste}
              onChange={setSelectedCaste}
            />
            <label>
              <span className="field-label">Marital Status <span className="required-mark">*</span></span>
              <select
                value={maritalStatus}
                onChange={(event) => setMaritalStatus(event.target.value as '' | MaritalStatus)}
                required
              >
                <option value="">Select marital status</option>
                <option value="NEVER_MARRIED">Never Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
                <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
              </select>
            </label>
            <label>
              <span className="field-label">City <span className="required-mark">*</span></span>
              <input value={city} onChange={(event) => setCity(event.target.value)} required />
            </label>
            <PicklistSingleSelect
              label="Education"
              placeholder="Type to search education"
              options={educationOptions}
              selectedItem={selectedEducation}
              onChange={setSelectedEducation}
            />
            <PicklistSingleSelect
              label="Occupation"
              placeholder="Type to search occupation"
              options={occupationOptions}
              selectedItem={selectedOccupation}
              onChange={setSelectedOccupation}
            />
            <label>
              Annual Income (INR)
              <input
                type="number"
                min={0}
                value={annualIncome}
                onChange={(event) => setAnnualIncome(event.target.value)}
              />
            </label>
          </div>

          <label>
            Bio
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={2000} />
          </label>

          <h3>Partner Preferences</h3>
          <div className="toolbar-grid">
            <label>
              Preferred City
              <input value={preferredCity} onChange={(event) => setPreferredCity(event.target.value)} />
            </label>
            <PicklistSingleSelect
              label="Preferred Religion"
              placeholder="Type to search religion"
              options={religionOptions}
              selectedItem={preferredReligion}
              onChange={setPreferredReligion}
            />
            <PicklistSingleSelect
              label="Preferred Caste"
              placeholder="Type to search caste"
              options={casteOptions}
              selectedItem={preferredCaste}
              onChange={setPreferredCaste}
            />
            <PicklistSingleSelect
              label="Preferred Education"
              placeholder="Type to search education"
              options={educationOptions}
              selectedItem={preferredEducation}
              onChange={setPreferredEducation}
            />
            <label>
              Preferred Min Age
              <select value={preferredMinAge} onChange={(event) => setPreferredMinAge(event.target.value)}>
                <option value="">Any</option>
                {AGE_OPTIONS.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preferred Max Age
              <select value={preferredMaxAge} onChange={(event) => setPreferredMaxAge(event.target.value)}>
                <option value="">Any</option>
                {AGE_OPTIONS.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="stack">
            <h3>Biodata (PDF)</h3>
            <div className="biodata-row">
              {!biodataUrl && (
                <button
                  type="button"
                  className="biodata-icon-button"
                  aria-label="Add biodata"
                  disabled={isUploadingBiodata}
                  onClick={() => biodataInputRef.current?.click()}
                >
                  +
                </button>
              )}
              <input
                ref={biodataInputRef}
                type="file"
                accept="application/pdf"
                disabled={isUploadingBiodata}
                className="visually-hidden-file-input"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  void onUploadBiodata(file).finally(() => {
                    event.target.value = ''
                  })
                }}
              />
              {biodataUrl ? (
                <button
                  type="button"
                  className="biodata-file-link"
                  disabled={isDownloadingBiodata}
                  onClick={() => void onDownloadBiodata()}
                >
                  {isDownloadingBiodata ? 'Downloading...' : biodataDisplayName}
                </button>
              ) : (
                <span className="info-text">No biodata uploaded</span>
              )}
              {biodataUrl && (
                <>
                  <button
                    type="button"
                    className="biodata-icon-button"
                    aria-label="Download biodata"
                    disabled={isDownloadingBiodata}
                    onClick={() => void onDownloadBiodata()}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="biodata-icon-button"
                    aria-label="Edit biodata"
                    disabled={isUploadingBiodata}
                    onClick={() => biodataInputRef.current?.click()}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="biodata-icon-button"
                    aria-label="Delete biodata"
                    onClick={() => void onDeleteBiodata()}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            {isUploadingBiodata && <p className="info-text">Uploading biodata...</p>}
          </div>

          <button type="submit">{saveProfileLabel}</button>
        </form>
      </AsyncState>
      <FieldError message={error} />
      {message && <p className="success-text">{message}</p>}
    </section>
  )
}

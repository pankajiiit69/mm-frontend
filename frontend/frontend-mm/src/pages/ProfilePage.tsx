import { useMemo, useRef, useState } from 'react'
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
} from '../utils/profileRelationText'
import type {
  ContactVisibility,
  DietType,
  EmploymentType,
  FamilyType,
  FamilyValues,
  Gender,
  MaritalStatus,
  MatrimonyProfileDetail,
  Photo,
  PhotoVisibility,
  PicklistItem,
  ProfileVisibility,
} from '../types/matrimony'

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

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

function parseCommaSeparatedList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toCommaSeparatedText(values?: string[]) {
  return values?.join(', ') ?? ''
}

function normalizeOptionalText(value?: string | null) {
  const normalized = (value ?? '').replace(/\r\n/g, '\n').trim()
  return normalized || undefined
}

function normalizeOptionalNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeStringArray(values?: string[] | null) {
  return (values ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function normalizeAreaCode(value: string) {
  return value.replace(/\s+/g, '').toUpperCase()
}

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
  const [languagesKnownText, setLanguagesKnownText] = useState('')
  const [maritalStatus, setMaritalStatus] = useState<'' | MaritalStatus>('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [selectedCaste, setSelectedCaste] = useState<PicklistItem | null>(null)
  const [subCaste, setSubCaste] = useState('')
  const [gothra, setGothra] = useState('')
  const [manglik, setManglik] = useState<'' | 'YES' | 'NO'>('')
  const [horoscopeAvailable, setHoroscopeAvailable] = useState<'' | 'YES' | 'NO'>('')
  const [selectedEducation, setSelectedEducation] = useState<PicklistItem | null>(null)
  const [selectedOccupation, setSelectedOccupation] = useState<PicklistItem | null>(null)
  const [employmentType, setEmploymentType] = useState<'' | EmploymentType>('')
  const [companyName, setCompanyName] = useState('')
  const [workLocation, setWorkLocation] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [diet, setDiet] = useState<'' | DietType>('')
  const [smoking, setSmoking] = useState<'' | 'YES' | 'NO'>('')
  const [drinking, setDrinking] = useState<'' | 'YES' | 'NO'>('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [hobbiesText, setHobbiesText] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<'' | 'YES' | 'NO'>('')
  const [bio, setBio] = useState('')
  const [profilePhotoIdentifier, setProfilePhotoIdentifier] = useState('')
  const [profilePhotoFallbackUrl, setProfilePhotoFallbackUrl] = useState('')
  const [familyType, setFamilyType] = useState<'' | FamilyType>('')
  const [familyValues, setFamilyValues] = useState<'' | FamilyValues>('')
  const [fatherOccupation, setFatherOccupation] = useState('')
  const [motherOccupation, setMotherOccupation] = useState('')
  const [siblingsCount, setSiblingsCount] = useState('')
  const [familyLocation, setFamilyLocation] = useState('')
  const [aboutFamily, setAboutFamily] = useState('')
  const [preferredCity, setPreferredCity] = useState('')
  const [preferredReligion, setPreferredReligion] = useState<PicklistItem | null>(null)
  const [preferredCaste, setPreferredCaste] = useState<PicklistItem | null>(null)
  const [preferredEducation, setPreferredEducation] = useState<PicklistItem | null>(null)
  const [preferredOccupation, setPreferredOccupation] = useState<PicklistItem | null>(null)
  const [preferredLocation, setPreferredLocation] = useState('')
  const [preferredHeightMinCm, setPreferredHeightMinCm] = useState('')
  const [preferredHeightMaxCm, setPreferredHeightMaxCm] = useState('')
  const [mustHavesText, setMustHavesText] = useState('')
  const [dealBreakersText, setDealBreakersText] = useState('')
  const [preferredMinAge, setPreferredMinAge] = useState('')
  const [preferredMaxAge, setPreferredMaxAge] = useState('')
  const [profileVisibility, setProfileVisibility] = useState<'' | ProfileVisibility>('')
  const [photoVisibility, setPhotoVisibility] = useState<'' | PhotoVisibility>('')
  const [contactVisibility, setContactVisibility] = useState<'' | ContactVisibility>('')
  const [idVerified, setIdVerified] = useState<'' | 'YES' | 'NO'>('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [savedProfile, setSavedProfile] = useState<MatrimonyProfileDetail | null>(null)
  const { showToast } = useToast()
  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = useState(false)
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState(false)
  const [isUploadingBiodata, setIsUploadingBiodata] = useState(false)
  const [isDownloadingBiodata, setIsDownloadingBiodata] = useState(false)
  const [pendingProfilePhotoFile, setPendingProfilePhotoFile] = useState<File | null>(null)
  const [biodataIdentifier, setBiodataIdentifier] = useState('')
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
      hydrateProfile(profile)
      return profile
    },
    [auth.user?.id],
    shouldLoadExistingProfile,
  )

  const hydrateProfile = (profile: MatrimonyProfileDetail) => {
    setSavedProfile(profile)
    setReferenceId(profile.referenceId ?? '')
    setName(profile.fullName)
    setGender(profile.gender)
    setDateOfBirth(profile.dateOfBirth ?? '')
    setMotherTongue(profile.motherTongue ?? '')
    setLanguagesKnownText(toCommaSeparatedText(profile.languagesKnown))
    setReligion(profile.religion)
    setMaritalStatus(profile.maritalStatus)
    setCity(profile.city)
    setState(profile.state ?? '')
    setCountry(profile.country ?? '')
    setAreaCode(profile.areaCode ?? '')
    setSelectedCaste(resolvePicklistItem(casteOptions, profile.caste ?? ''))
    setSubCaste(profile.subCaste ?? '')
    setGothra(profile.gothra ?? '')
    setManglik(profile.manglik === undefined ? '' : profile.manglik ? 'YES' : 'NO')
    setHoroscopeAvailable(profile.horoscopeAvailable === undefined ? '' : profile.horoscopeAvailable ? 'YES' : 'NO')
    setSelectedEducation(resolvePicklistItem(educationOptions, firstCsvItem(profile.education)))
    setSelectedOccupation(resolvePicklistItem(occupationOptions, firstCsvItem(profile.occupation)))
    setEmploymentType(profile.employmentType ?? '')
    setCompanyName(profile.companyName ?? '')
    setWorkLocation(profile.workLocation ?? '')
    setAnnualIncome(String(profile.annualIncome ?? ''))
    setHeightCm(profile.heightCm ? String(profile.heightCm) : '')
    setDiet(profile.diet ?? '')
    setSmoking(profile.smoking === undefined ? '' : profile.smoking ? 'YES' : 'NO')
    setDrinking(profile.drinking === undefined ? '' : profile.drinking ? 'YES' : 'NO')
    setFitnessLevel(profile.fitnessLevel ?? '')
    setHobbiesText(toCommaSeparatedText(profile.hobbies))
    setWillingToRelocate(profile.willingToRelocate === undefined ? '' : profile.willingToRelocate ? 'YES' : 'NO')
    setBio(profile.bio ?? '')
    setProfilePhotoIdentifier(profile.profilePhotoIdentifier ?? '')
    setProfilePhotoFallbackUrl(profile.profilePhotoUrl ?? '')
    setBiodataIdentifier(profile.biodataIdentifier ?? '')
    setProfileRelation(profile.relationToUser ?? null)
    setFamilyType(profile.familyType ?? '')
    setFamilyValues(profile.familyValues ?? '')
    setFatherOccupation(profile.fatherOccupation ?? '')
    setMotherOccupation(profile.motherOccupation ?? '')
    setSiblingsCount(profile.siblingsCount === undefined ? '' : String(profile.siblingsCount))
    setFamilyLocation(profile.familyLocation ?? '')
    setAboutFamily(profile.aboutFamily ?? '')
    setPreferredCity(profile.preference?.preferredCity ?? '')
    setPreferredReligion(resolvePicklistItem(religionOptions, profile.preference?.preferredReligion ?? ''))
    setPreferredCaste(resolvePicklistItem(casteOptions, profile.preference?.preferredCaste ?? ''))
    setPreferredEducation(resolvePicklistItem(educationOptions, profile.preference?.preferredEducation ?? ''))
    setPreferredOccupation(resolvePicklistItem(occupationOptions, profile.preference?.preferredOccupation ?? ''))
    setPreferredLocation(profile.preference?.preferredLocation ?? '')
    setPreferredHeightMinCm(profile.preference?.preferredHeightMinCm ? String(profile.preference.preferredHeightMinCm) : '')
    setPreferredHeightMaxCm(profile.preference?.preferredHeightMaxCm ? String(profile.preference.preferredHeightMaxCm) : '')
    setMustHavesText(toCommaSeparatedText(profile.preference?.mustHaves))
    setDealBreakersText(toCommaSeparatedText(profile.preference?.dealBreakers))
    setPreferredMinAge(profile.preference?.minAge ? String(profile.preference.minAge) : '')
    setPreferredMaxAge(profile.preference?.maxAge ? String(profile.preference.maxAge) : '')
    setProfileVisibility(profile.profileVisibility ?? '')
    setPhotoVisibility(profile.photoVisibility ?? '')
    setContactVisibility(profile.contactVisibility ?? '')
    setIdVerified(profile.idVerified === undefined ? '' : profile.idVerified ? 'YES' : 'NO')
  }

  const buildBasicPayload = () => ({
    fullName: name.trim(),
    gender: gender || undefined,
    dateOfBirth: dateOfBirth || undefined,
    maritalStatus: maritalStatus || undefined,
    city: toTitleCase(city) || undefined,
    state: state.trim() || undefined,
    country: country.trim() || undefined,
    areaCode: normalizeAreaCode(areaCode) || undefined,
    relationToUser: profileRelation || undefined,
    bio: bio.trim() || undefined,
    profilePhotoIdentifier: profilePhotoIdentifier || undefined,
  })

  const buildCommunityPayload = () => ({
    religion: normalizeOptionalText(religion),
    motherTongue: normalizeOptionalText(motherTongue),
    caste: normalizeOptionalText(selectedCaste?.name),
    subCaste: normalizeOptionalText(subCaste),
    languagesKnown: normalizeStringArray(parseCommaSeparatedList(languagesKnownText)),
  })

  const buildProfessionalPayload = () => ({
    education: normalizeOptionalText(selectedEducation?.name),
    occupation: normalizeOptionalText(selectedOccupation?.name),
    employmentType: employmentType || undefined,
    companyName: normalizeOptionalText(companyName),
    workLocation: normalizeOptionalText(workLocation),
    annualIncome: annualIncome ? Number(annualIncome) : undefined,
    heightCm: heightCm ? Number(heightCm) : undefined,
    diet: diet || undefined,
    smoking: smoking === '' ? undefined : smoking === 'YES',
    drinking: drinking === '' ? undefined : drinking === 'YES',
    fitnessLevel: normalizeOptionalText(fitnessLevel),
    hobbies: normalizeStringArray(parseCommaSeparatedList(hobbiesText)),
    willingToRelocate: willingToRelocate === '' ? undefined : willingToRelocate === 'YES',
  })

  const buildHoroscopePayload = () => ({
    gothra: gothra.trim() || undefined,
    manglik: manglik === '' ? undefined : manglik === 'YES',
    horoscopeAvailable: horoscopeAvailable === '' ? undefined : horoscopeAvailable === 'YES',
  })

  const buildFamilyPayload = () => ({
    familyType: familyType || undefined,
    familyValues: familyValues || undefined,
    fatherOccupation: normalizeOptionalText(fatherOccupation),
    motherOccupation: normalizeOptionalText(motherOccupation),
    siblingsCount: normalizeOptionalNumber(siblingsCount),
    familyLocation: normalizeOptionalText(familyLocation),
    aboutFamily: normalizeOptionalText(aboutFamily),
  })

  const buildPartnerPreferencesPayload = () => ({
    preference: {
      preferredCity: normalizeOptionalText(preferredCity),
      preferredReligion: normalizeOptionalText(preferredReligion?.name),
      preferredCaste: normalizeOptionalText(preferredCaste?.name),
      preferredEducation: normalizeOptionalText(preferredEducation?.name),
      preferredOccupation: normalizeOptionalText(preferredOccupation?.name),
      preferredLocation: normalizeOptionalText(preferredLocation),
      preferredHeightMinCm: normalizeOptionalNumber(preferredHeightMinCm),
      preferredHeightMaxCm: normalizeOptionalNumber(preferredHeightMaxCm),
      mustHaves: normalizeStringArray(parseCommaSeparatedList(mustHavesText)),
      dealBreakers: normalizeStringArray(parseCommaSeparatedList(dealBreakersText)),
      minAge: normalizeOptionalNumber(preferredMinAge),
      maxAge: normalizeOptionalNumber(preferredMaxAge),
    },
  })

  const buildPrivacyPayload = () => ({
    profileVisibility: profileVisibility || undefined,
    photoVisibility: photoVisibility || undefined,
    contactVisibility: contactVisibility || undefined,
    idVerified: idVerified === '' ? undefined : idVerified === 'YES',
  })

  const isEqualPayload = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right)

  const isBasicDirty = savedProfile
    ? !isEqualPayload(buildBasicPayload(), {
        fullName: savedProfile.fullName?.trim() || undefined,
        gender: savedProfile.gender || undefined,
        dateOfBirth: savedProfile.dateOfBirth || undefined,
        maritalStatus: savedProfile.maritalStatus || undefined,
        city: toTitleCase(savedProfile.city || '') || undefined,
        state: savedProfile.state?.trim() || undefined,
        country: savedProfile.country?.trim() || undefined,
        areaCode: normalizeAreaCode(savedProfile.areaCode || '') || undefined,
        relationToUser: savedProfile.relationToUser || undefined,
        bio: savedProfile.bio?.trim() || undefined,
        profilePhotoIdentifier: savedProfile.profilePhotoIdentifier || undefined,
      })
    : false

  const isCommunityDirty = savedProfile
    ? !isEqualPayload(buildCommunityPayload(), {
        religion: normalizeOptionalText(savedProfile.religion),
        motherTongue: normalizeOptionalText(savedProfile.motherTongue),
        caste: normalizeOptionalText(savedProfile.caste),
        subCaste: normalizeOptionalText(savedProfile.subCaste),
        languagesKnown: normalizeStringArray(savedProfile.languagesKnown),
      })
    : false

  const isProfessionalDirty = savedProfile
    ? !isEqualPayload(buildProfessionalPayload(), {
        education: normalizeOptionalText(firstCsvItem(savedProfile.education)),
        occupation: normalizeOptionalText(firstCsvItem(savedProfile.occupation)),
        employmentType: savedProfile.employmentType || undefined,
        companyName: normalizeOptionalText(savedProfile.companyName),
        workLocation: normalizeOptionalText(savedProfile.workLocation),
        annualIncome: savedProfile.annualIncome ?? undefined,
        heightCm: savedProfile.heightCm ?? undefined,
        diet: savedProfile.diet || undefined,
        smoking: savedProfile.smoking,
        drinking: savedProfile.drinking,
        fitnessLevel: normalizeOptionalText(savedProfile.fitnessLevel),
        hobbies: normalizeStringArray(savedProfile.hobbies),
        willingToRelocate: savedProfile.willingToRelocate,
      })
    : false

  const isHoroscopeDirty = savedProfile
    ? !isEqualPayload(buildHoroscopePayload(), {
        gothra: savedProfile.gothra?.trim() || undefined,
        manglik: savedProfile.manglik,
        horoscopeAvailable: savedProfile.horoscopeAvailable,
      })
    : false

  const isFamilyDirty = savedProfile
    ? !isEqualPayload(buildFamilyPayload(), {
        familyType: savedProfile.familyType || undefined,
        familyValues: savedProfile.familyValues || undefined,
        fatherOccupation: normalizeOptionalText(savedProfile.fatherOccupation),
        motherOccupation: normalizeOptionalText(savedProfile.motherOccupation),
        siblingsCount: normalizeOptionalNumber(savedProfile.siblingsCount),
        familyLocation: normalizeOptionalText(savedProfile.familyLocation),
        aboutFamily: normalizeOptionalText(savedProfile.aboutFamily),
      })
    : false

  const isPreferencesDirty = savedProfile
    ? !isEqualPayload(buildPartnerPreferencesPayload(), {
        preference: {
          preferredCity: normalizeOptionalText(savedProfile.preference?.preferredCity),
          preferredReligion: normalizeOptionalText(savedProfile.preference?.preferredReligion),
          preferredCaste: normalizeOptionalText(savedProfile.preference?.preferredCaste),
          preferredEducation: normalizeOptionalText(savedProfile.preference?.preferredEducation),
          preferredOccupation: normalizeOptionalText(savedProfile.preference?.preferredOccupation),
          preferredLocation: normalizeOptionalText(savedProfile.preference?.preferredLocation),
          preferredHeightMinCm: normalizeOptionalNumber(savedProfile.preference?.preferredHeightMinCm),
          preferredHeightMaxCm: normalizeOptionalNumber(savedProfile.preference?.preferredHeightMaxCm),
          mustHaves: normalizeStringArray(savedProfile.preference?.mustHaves),
          dealBreakers: normalizeStringArray(savedProfile.preference?.dealBreakers),
          minAge: normalizeOptionalNumber(savedProfile.preference?.minAge),
          maxAge: normalizeOptionalNumber(savedProfile.preference?.maxAge),
        },
      })
    : false

  const isPrivacyDirty = savedProfile
    ? !isEqualPayload(buildPrivacyPayload(), {
        profileVisibility: savedProfile.profileVisibility || undefined,
        photoVisibility: savedProfile.photoVisibility || undefined,
        contactVisibility: savedProfile.contactVisibility || undefined,
        idVerified: savedProfile.idVerified,
      })
    : false

  const shouldEnableSectionSave = (isDirty: boolean) => isProfileNotCreated || isDirty

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
      const response = await matrimonyApi.updateMyProfileBasicDetails({ profilePhotoIdentifier: '' })
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
      setBiodataIdentifier(refreshedProfile.data.biodataIdentifier ?? '')
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
      setBiodataIdentifier('')
      showToast(response.message || 'Biodata deleted successfully.', 'success')
    } catch (err) {
      showToast(extractApiError(err, 'Unable to delete biodata. Please try again.'), 'error')
    }
  }

  const onDownloadBiodata = async () => {
    if (!biodataIdentifier) {
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

  const saveSection = async (
    sectionKey: string,
    action: () => Promise<{ message: string; data: MatrimonyProfileDetail }>,
    fallbackErrorMessage: string,
  ) => {
    setError('')
    setMessage('')
    setSavingSection(sectionKey)

    try {
      const response = await action()
      hydrateProfile(response.data)
      updateAuthUser({
        id: auth.user?.id ?? '',
        name: response.data.fullName,
        email: auth.user?.email ?? '',
        role: auth.user?.role ?? 'USER',
        phone: auth.user?.phone ?? null,
        verificationStatus: auth.user?.verificationStatus ?? null,
      })

      if (isProfileNotCreated) {
        try {
          const fresh = await getAuthenticatedUser()
          updateAuthUser(fresh)
        } catch {
          // non-critical
        }
      }

      const successMessage = response.message || 'Section updated successfully.'
      setMessage(successMessage)
      showToast(successMessage, 'success')
    } catch (err) {
      setError(fallbackErrorMessage)
      setMessage('')
      showToast(extractApiError(err, fallbackErrorMessage), 'error')
    } finally {
      setSavingSection(null)
    }
  }

  const onSaveBasicDetails = async () => {
    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters long.')
      showToast('Full name must be at least 2 characters long.', 'error')
      setMessage('')
      return
    }

    const calculatedAge = calculateAge(dateOfBirth)
    if (calculatedAge === null || calculatedAge < 18 || calculatedAge > 80) {
      setError('You must be between 18 and 80 years old to create a profile.')
      showToast('You must be between 18 and 80 years old to create a profile.', 'error')
      setMessage('')
      return
    }

    if (!gender || !maritalStatus || !profileRelation || !city.trim() || !country.trim()) {
      setError('Gender, marital status, relation to user, city, and country are required.')
      showToast('Gender, marital status, relation to user, city, and country are required.', 'error')
      setMessage('')
      return
    }

    if (bio.trim().length > 0 && bio.trim().length < 50) {
      setError('Bio must be at least 50 characters if provided.')
      showToast('Bio must be at least 50 characters if provided.', 'error')
      setMessage('')
      return
    }

    await saveSection(
      'basic',
      () => matrimonyApi.updateMyProfileBasicDetails(buildBasicPayload()),
      'Unable to update basic details. Please try again.',
    )
  }

  const onSaveCommunityDetails = async () => {
    if (!religion.trim()) {
      setError('Religion is required.')
      showToast('Religion is required.', 'error')
      setMessage('')
      return
    }

    await saveSection(
      'community',
      () => matrimonyApi.updateMyProfileCommunityDetails(buildCommunityPayload()),
      'Unable to update community details. Please try again.',
    )
  }

  const onSaveProfessionalDetails = async () => {
    await saveSection(
      'professional',
      () => matrimonyApi.updateMyProfileProfessionalDetails(buildProfessionalPayload()),
      'Unable to update professional details. Please try again.',
    )
  }

  const onSaveHoroscopeDetails = async () => {
    await saveSection(
      'horoscope',
      () => matrimonyApi.updateMyProfileHoroscopeDetails(buildHoroscopePayload()),
      'Unable to update horoscope details. Please try again.',
    )
  }

  const onSaveFamilyDetails = async () => {
    await saveSection(
      'family',
      () => matrimonyApi.updateMyProfileFamilyDetails(buildFamilyPayload()),
      'Unable to update family details. Please try again.',
    )
  }

  const onSavePartnerPreferences = async () => {
    if (preferredMinAge && preferredMaxAge && Number(preferredMinAge) > Number(preferredMaxAge)) {
      setError('Preferred minimum age cannot be greater than preferred maximum age.')
      showToast('Preferred minimum age cannot be greater than preferred maximum age.', 'error')
      setMessage('')
      return
    }

    await saveSection(
      'preferences',
      () => matrimonyApi.updateMyProfilePartnerPreferences(buildPartnerPreferencesPayload()),
      'Unable to update partner preferences. Please try again.',
    )
  }

  const onSavePrivacySettings = async () => {
    await saveSection(
      'privacy',
      () => matrimonyApi.updateMyProfilePrivacySettings(buildPrivacyPayload()),
      'Unable to update privacy settings. Please try again.',
    )
  }

  return (
    <section className="stack-wide">
      <div className="profile-heading-row">
        <h1>{profileHeading}</h1>
        {referenceId && <span className="profile-reference-chip">Ref ID: {referenceId}</span>}
      </div>
      <p>{profileDescription}</p>
      <AsyncState loading={loading} error={loadError}>
        <form className="stack-wide" onSubmit={(event) => event.preventDefault()}>
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

          <h3>
            Basic Details
            {isBasicDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
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
              <span className="field-label">Relation To User <span className="required-mark">*</span></span>
              <select
                value={profileRelation ?? ''}
                onChange={(event) => setProfileRelation(event.target.value || null)}
                required
              >
                <option value="">Select relation</option>
                <option value="SELF">Self</option>
                <option value="SON">Son</option>
                <option value="DAUGHTER">Daughter</option>
                <option value="BROTHER">Brother</option>
                <option value="SISTER">Sister</option>
                <option value="RELATIVE">Relative</option>
                <option value="FRIEND">Friend</option>
              </select>
            </label>
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
            <label>
              Area Code (PIN/ZIP)
              <input value={areaCode} onChange={(event) => setAreaCode(event.target.value)} />
            </label>
            <label>
              State
              <input value={state} onChange={(event) => setState(event.target.value)} />
            </label>
            <label>
              <span className="field-label">Country <span className="required-mark">*</span></span>
              <input value={country} onChange={(event) => setCountry(event.target.value)} required />
            </label>
          </div>
          <label>
            Bio
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={2000} />
          </label>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isBasicDirty)} onClick={() => void onSaveBasicDetails()}>
              {savingSection === 'basic' ? 'Saving Basic Details...' : 'Save Basic Details'}
            </button>
          </div>

          <h3>
            Community Details
            {isCommunityDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
          <div className="toolbar-grid professional-details-grid">
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
              Sub Caste
              <input value={subCaste} onChange={(event) => setSubCaste(event.target.value)} />
            </label>
            <label>
              Languages Known (comma separated)
              <input value={languagesKnownText} onChange={(event) => setLanguagesKnownText(event.target.value)} />
            </label>
          </div>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isCommunityDirty)} onClick={() => void onSaveCommunityDetails()}>
              {savingSection === 'community' ? 'Saving Community Details...' : 'Save Community Details'}
            </button>
          </div>

          <h3>
            Professional Details
            {isProfessionalDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
          <div className="toolbar-grid">
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
            <label>
              Employment Type
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value as '' | EmploymentType)}
              >
                <option value="">Select employment type</option>
                <option value="PRIVATE">Private</option>
                <option value="GOVERNMENT">Government</option>
                <option value="BUSINESS">Business</option>
                <option value="SELF_EMPLOYED">Self Employed</option>
                <option value="NOT_WORKING">Not Working</option>
                <option value="STUDENT">Student</option>
              </select>
            </label>
            <label>
              Company Name
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </label>
            <label>
              Work Location
              <input value={workLocation} onChange={(event) => setWorkLocation(event.target.value)} />
            </label>
            <label>
              Height (cm)
              <input type="number" min={120} max={230} value={heightCm} onChange={(event) => setHeightCm(event.target.value)} />
            </label>
            <label>
              Diet
              <select value={diet} onChange={(event) => setDiet(event.target.value as '' | DietType)}>
                <option value="">Not specified</option>
                <option value="VEGETARIAN">Vegetarian</option>
                <option value="EGGETARIAN">Eggetarian</option>
                <option value="NON_VEGETARIAN">Non Vegetarian</option>
                <option value="VEGAN">Vegan</option>
                <option value="JAIN">Jain</option>
                <option value="OCCASIONALLY_NON_VEG">Occasionally Non Veg</option>
              </select>
            </label>
            <label>
              Smoking
              <select value={smoking} onChange={(event) => setSmoking(event.target.value as '' | 'YES' | 'NO')}>
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
            <label>
              Drinking
              <select value={drinking} onChange={(event) => setDrinking(event.target.value as '' | 'YES' | 'NO')}>
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
            <label>
              Fitness Level
              <input value={fitnessLevel} onChange={(event) => setFitnessLevel(event.target.value)} />
            </label>
            <label>
              Willing To Relocate
              <select
                value={willingToRelocate}
                onChange={(event) => setWillingToRelocate(event.target.value as '' | 'YES' | 'NO')}
              >
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
            <label className="toolbar-grid-full-span">
              Hobbies (comma separated)
              <input value={hobbiesText} onChange={(event) => setHobbiesText(event.target.value)} />
            </label>
          </div>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isProfessionalDirty)} onClick={() => void onSaveProfessionalDetails()}>
              {savingSection === 'professional' ? 'Saving Professional Details...' : 'Save Professional Details'}
            </button>
          </div>

          <h3>
            Horoscope Details
            {isHoroscopeDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
          <div className="toolbar-grid">
            <label>
              Gothra
              <input value={gothra} onChange={(event) => setGothra(event.target.value)} />
            </label>
            <label>
              Manglik
              <select value={manglik} onChange={(event) => setManglik(event.target.value as '' | 'YES' | 'NO')}>
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
            <label>
              Horoscope Available
              <select
                value={horoscopeAvailable}
                onChange={(event) => setHoroscopeAvailable(event.target.value as '' | 'YES' | 'NO')}
              >
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
          </div>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isHoroscopeDirty)} onClick={() => void onSaveHoroscopeDetails()}>
              {savingSection === 'horoscope' ? 'Saving Horoscope Details...' : 'Save Horoscope Details'}
            </button>
          </div>

          <h3>
            Family Details
            {isFamilyDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
          <div className="toolbar-grid">
            <label>
              Family Type
              <select value={familyType} onChange={(event) => setFamilyType(event.target.value as '' | FamilyType)}>
                <option value="">Not specified</option>
                <option value="NUCLEAR">Nuclear</option>
                <option value="JOINT">Joint</option>
                <option value="EXTENDED">Extended</option>
              </select>
            </label>
            <label>
              Family Values
              <select
                value={familyValues}
                onChange={(event) => setFamilyValues(event.target.value as '' | FamilyValues)}
              >
                <option value="">Not specified</option>
                <option value="TRADITIONAL">Traditional</option>
                <option value="MODERATE">Moderate</option>
                <option value="LIBERAL">Liberal</option>
              </select>
            </label>
            <label>
              Father's Occupation
              <input value={fatherOccupation} onChange={(event) => setFatherOccupation(event.target.value)} />
            </label>
            <label>
              Mother's Occupation
              <input value={motherOccupation} onChange={(event) => setMotherOccupation(event.target.value)} />
            </label>
            <label>
              Siblings Count
              <input type="number" min={0} max={20} value={siblingsCount} onChange={(event) => setSiblingsCount(event.target.value)} />
            </label>
            <label>
              Family Location
              <input value={familyLocation} onChange={(event) => setFamilyLocation(event.target.value)} />
            </label>
          </div>

          <label>
            About Family
            <textarea
              value={aboutFamily}
              onChange={(event) => setAboutFamily(event.target.value)}
              rows={3}
              maxLength={1000}
            />
          </label>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isFamilyDirty)} onClick={() => void onSaveFamilyDetails()}>
              {savingSection === 'family' ? 'Saving Family Details...' : 'Save Family Details'}
            </button>
          </div>

          <h3>
            Partner Preferences
            {isPreferencesDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
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
            <PicklistSingleSelect
              label="Preferred Occupation"
              placeholder="Type to search occupation"
              options={occupationOptions}
              selectedItem={preferredOccupation}
              onChange={setPreferredOccupation}
            />
            <label>
              Preferred Location
              <input value={preferredLocation} onChange={(event) => setPreferredLocation(event.target.value)} />
            </label>
            <label>
              Preferred Min Height (cm)
              <input
                type="number"
                min={120}
                max={230}
                value={preferredHeightMinCm}
                onChange={(event) => setPreferredHeightMinCm(event.target.value)}
              />
            </label>
            <label>
              Preferred Max Height (cm)
              <input
                type="number"
                min={120}
                max={230}
                value={preferredHeightMaxCm}
                onChange={(event) => setPreferredHeightMaxCm(event.target.value)}
              />
            </label>
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
            <label>
              Must Haves (comma separated)
              <input value={mustHavesText} onChange={(event) => setMustHavesText(event.target.value)} />
            </label>
            <label>
              Deal Breakers (comma separated)
              <input value={dealBreakersText} onChange={(event) => setDealBreakersText(event.target.value)} />
            </label>
          </div>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isPreferencesDirty)} onClick={() => void onSavePartnerPreferences()}>
              {savingSection === 'preferences' ? 'Saving Partner Preferences...' : 'Save Partner Preferences'}
            </button>
          </div>

          <h3>
            Privacy and Verification
            {isPrivacyDirty && <span className="section-status-indicator">Unsaved</span>}
          </h3>
          <div className="toolbar-grid">
            <label>
              Profile Visibility
              <select
                value={profileVisibility}
                onChange={(event) => setProfileVisibility(event.target.value as '' | ProfileVisibility)}
              >
                <option value="">Not specified</option>
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members only</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </label>
            <label>
              Photo Visibility
              <select
                value={photoVisibility}
                onChange={(event) => setPhotoVisibility(event.target.value as '' | PhotoVisibility)}
              >
                <option value="">Not specified</option>
                <option value="VISIBLE_TO_ALL">Visible to all</option>
                <option value="MEMBERS_ONLY">Members only</option>
                <option value="ON_REQUEST">On request</option>
              </select>
            </label>
            <label>
              Contact Visibility
              <select
                value={contactVisibility}
                onChange={(event) => setContactVisibility(event.target.value as '' | ContactVisibility)}
              >
                <option value="">Not specified</option>
                <option value="VISIBLE_TO_MATCHES">Visible to matches</option>
                <option value="ON_ACCEPTED_INTEREST">On accepted interest</option>
                <option value="HIDDEN">Hidden</option>
              </select>
            </label>
            <label>
              ID Verified
              <select value={idVerified} onChange={(event) => setIdVerified(event.target.value as '' | 'YES' | 'NO')}>
                <option value="">Not specified</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
            </label>
          </div>
          <div className="inline-actions">
            <button type="button" disabled={Boolean(savingSection) || !shouldEnableSectionSave(isPrivacyDirty)} onClick={() => void onSavePrivacySettings()}>
              {savingSection === 'privacy' ? 'Saving Privacy Settings...' : 'Save Privacy Settings'}
            </button>
          </div>

          <div className="stack">
            <h3>Biodata (PDF)</h3>
            <div className="biodata-row">
              {!biodataIdentifier && (
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
              {biodataIdentifier ? (
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
              {biodataIdentifier && (
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

        </form>
      </AsyncState>
      <FieldError message={error} />
      {message && <p className="success-text">{message}</p>}
    </section>
  )
}

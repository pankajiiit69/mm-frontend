import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { PicklistChipFilter } from '../components/PicklistChipFilter'
import { ProfileCard } from '../components/ProfileCard'
import { PaginationControls } from '../components/PaginationControls'
import { useAsyncData } from '../hooks/useAsyncData'
import type { Gender, MaritalStatus, PicklistItem } from '../types/matrimony'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

const AGE_OPTIONS = Array.from({ length: 63 }, (_, index) => String(index + 18))
const DISCOVERY_FILTERS_STORAGE_KEY = 'mm.discovery.filters.v1'
const DISCOVERY_PREFILL_ON_LOGIN_KEY = 'mm.discovery.prefillOnLogin.v1'

interface PersistedDiscoveryFilters {
  gender: '' | Gender
  maritalStatus: '' | MaritalStatus
  religion: string
  caste: string
  motherTongue: string
  city: string
  selectedEducations: PicklistItem[]
  selectedOccupations: PicklistItem[]
  minAge: string
  maxAge: string
  page: number
}

function parseCsvToPicklistItems(value: string | undefined): PicklistItem[] {
  if (!value?.trim()) return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ name: item, value: item }))
}

function getOppositeGender(gender?: Gender) {
  if (gender === 'MALE') return 'FEMALE' as const
  if (gender === 'FEMALE') return 'MALE' as const
  return undefined
}

function formatMaritalStatus(value: MaritalStatus | '') {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatGender(value: Gender | '') {
  if (!value) return ''
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function HomePage() {
  const { auth } = useAuth()
  const [gender, setGender] = useState<'' | Gender>('')
  const [maritalStatus, setMaritalStatus] = useState<'' | MaritalStatus>('')
  const [religion, setReligion] = useState('')
  const [caste, setCaste] = useState('')
  const [motherTongue, setMotherTongue] = useState('')
  const [city, setCity] = useState('')
  const [selectedEducations, setSelectedEducations] = useState<PicklistItem[]>([])
  const [selectedOccupations, setSelectedOccupations] = useState<PicklistItem[]>([])
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [shortlistOverrides, setShortlistOverrides] = useState<Record<string, boolean>>({})
  const [shortlistBusyId, setShortlistBusyId] = useState<string | null>(null)
  const { showToast } = useToast()
  const hasRestoredFiltersRef = useRef(false)
  const shouldForcePreferencePrefillRef = useRef(false)

  useEffect(() => {
    shouldForcePreferencePrefillRef.current = window.sessionStorage.getItem(DISCOVERY_PREFILL_ON_LOGIN_KEY) === '1'
  }, [])

  useEffect(() => {
    if (shouldForcePreferencePrefillRef.current) {
      return
    }

    try {
      const stored = window.sessionStorage.getItem(DISCOVERY_FILTERS_STORAGE_KEY)
      if (!stored) {
        return
      }

      const parsed = JSON.parse(stored) as Partial<PersistedDiscoveryFilters>

      setGender((parsed.gender as '' | Gender) ?? '')
      setMaritalStatus((parsed.maritalStatus as '' | MaritalStatus) ?? '')
      setReligion(parsed.religion ?? '')
      setCaste(parsed.caste ?? '')
      setMotherTongue(parsed.motherTongue ?? '')
      setCity(parsed.city ?? '')
      setSelectedEducations(Array.isArray(parsed.selectedEducations) ? parsed.selectedEducations : [])
      setSelectedOccupations(Array.isArray(parsed.selectedOccupations) ? parsed.selectedOccupations : [])
      setMinAge(parsed.minAge ?? '')
      setMaxAge(parsed.maxAge ?? '')
      setPage(typeof parsed.page === 'number' && parsed.page > 0 ? parsed.page : 1)
      hasRestoredFiltersRef.current = true
    } catch {
      window.sessionStorage.removeItem(DISCOVERY_FILTERS_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const payload: PersistedDiscoveryFilters = {
      gender,
      maritalStatus,
      religion,
      caste,
      motherTongue,
      city,
      selectedEducations,
      selectedOccupations,
      minAge,
      maxAge,
      page,
    }

    window.sessionStorage.setItem(DISCOVERY_FILTERS_STORAGE_KEY, JSON.stringify(payload))
  }, [
    gender,
    maritalStatus,
    religion,
    caste,
    motherTongue,
    city,
    selectedEducations,
    selectedOccupations,
    minAge,
    maxAge,
    page,
  ])

  const pageSize = 12

  const { data: religions } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('RELIGION')
  }, [])

  const { data: educations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('EDUCATION')
  }, [])

  const { data: occupations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('OCCUPATION')
  }, [])

  const { data: castes } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('CASTE')
  }, [])

  const { data: motherTongues } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('MOTHER_TONGUE')
  }, [])

  const religionOptions = useMemo(() => religions ?? [], [religions])
  const casteOptions = castes ?? []
  const motherTongueOptions = motherTongues ?? []
  const educationOptions = useMemo(() => educations ?? [], [educations])
  const occupationOptions = useMemo(() => occupations ?? [], [occupations])

  const shouldLoadMyProfile = auth.isAuthenticated && auth.user?.role === 'USER'
  const { data: myProfile } = useAsyncData(
    async () => {
      const response = await matrimonyApi.getMyProfile()
      return response.data
    },
    [auth.user?.id],
    shouldLoadMyProfile,
  )

  useEffect(() => {
    if (!myProfile) return

    if (hasRestoredFiltersRef.current && !shouldForcePreferencePrefillRef.current) {
      return
    }

    setReligion(myProfile.preference?.preferredReligion ?? '')
    setCaste(myProfile.preference?.preferredCaste ?? '')
    setMotherTongue(myProfile.preference?.preferredMotherTongue ?? '')
    setCity(myProfile.preference?.preferredCity ?? '')
    setMaritalStatus(myProfile.preference?.preferredMaritalStatus ?? '')
    setMinAge(myProfile.preference?.minAge ? String(myProfile.preference.minAge) : '')
    setMaxAge(myProfile.preference?.maxAge ? String(myProfile.preference.maxAge) : '')
    setSelectedEducations(parseCsvToPicklistItems(myProfile.preference?.preferredEducation))
    setSelectedOccupations([])
    setPage(1)

    if (shouldForcePreferencePrefillRef.current) {
      window.sessionStorage.removeItem(DISCOVERY_PREFILL_ON_LOGIN_KEY)
      shouldForcePreferencePrefillRef.current = false
    }
  }, [myProfile])

  const religionMap = useMemo(() => new Map(religionOptions.map((item) => [item.name, item.value])), [religionOptions])
  const casteMap = useMemo(() => new Map(casteOptions.map((item) => [item.name, item.value])), [casteOptions])
  const educationMap = useMemo(() => new Map(educationOptions.map((item) => [item.name, item.value])), [educationOptions])
  const occupationMap = useMemo(() => new Map(occupationOptions.map((item) => [item.name, item.value])), [occupationOptions])

  const displayValue = (value: string | undefined, map: Map<string, string>) => {
    if (!value) {
      return undefined
    }

    return map.get(value) ?? value
  }

  const queryPayload = useMemo(
    () => ({
      page,
      size: pageSize,
      gender: gender || undefined,
      maritalStatus: maritalStatus || undefined,
      religion,
      caste,
      motherTongue,
      city,
      education: selectedEducations.length > 0 ? selectedEducations.map((item) => item.name) : undefined,
      occupation: selectedOccupations.length > 0 ? selectedOccupations.map((item) => item.name) : undefined,
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
    }),
    [
      page,
      gender,
      maritalStatus,
      religion,
      caste,
      motherTongue,
      city,
      selectedEducations,
      selectedOccupations,
      minAge,
      maxAge,
    ],
  )

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await matrimonyApi.discoverProfiles(queryPayload)
      return response.data
    },
    [queryPayload],
  )

  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)
  const profiles = data?.items ?? []
  const profileGender = myProfile?.gender
  const shouldHideGenderFilter = profileGender === 'MALE' || profileGender === 'FEMALE'
  const inferredCardGender = getOppositeGender(profileGender)

  useEffect(() => {
    if (!shouldHideGenderFilter) return
    if (!gender) return
    setGender('')
    setPage(1)
  }, [shouldHideGenderFilter, gender])

  const handleSendInterest = async (profileId: number) => {
    setActionMessage('')
    setActionError('')
    try {
      const response = await matrimonyApi.sendInterest({ toProfileId: profileId })
      setActionMessage(response.message || 'Interest sent successfully.')
      showToast(response.message || 'Interest sent successfully.', 'success')
    } catch (err) {
      setActionError('Unable to send interest for this profile.')
      showToast(extractApiError(err, 'Unable to send interest for this profile.'), 'error')
    }
  }

  const handleToggleShortlist = async (profileId: string, isShortlisted: boolean) => {
    setActionMessage('')
    setActionError('')
    setShortlistBusyId(profileId)

    try {
      if (isShortlisted) {
        const response = await matrimonyApi.removeProfileFromShortlist(profileId)
        setShortlistOverrides((previous) => ({ ...previous, [profileId]: false }))
        setActionMessage(response.message || 'Profile removed from shortlist.')
        showToast(response.message || 'Profile removed from shortlist.', 'success')
      } else {
        const response = await matrimonyApi.addProfileToShortlist(profileId)
        setShortlistOverrides((previous) => ({ ...previous, [profileId]: true }))
        setActionMessage(response.message || 'Profile shortlisted successfully.')
        showToast(response.message || 'Profile shortlisted successfully.', 'success')
      }
    } catch (err) {
      setActionError('Unable to update shortlist for this profile.')
      showToast(extractApiError(err, 'Unable to update shortlist for this profile.'), 'error')
    } finally {
      setShortlistBusyId(null)
    }
  }

  const clearFilters = () => {
    setGender('')
    setMaritalStatus('')
    setReligion('')
    setCaste('')
    setMotherTongue('')
    setCity('')
    setSelectedEducations([])
    setSelectedOccupations([])
    setMinAge('')
    setMaxAge('')
    setPage(1)
    setActionError('')
    setActionMessage('')
  }

  const hasAppliedFilters = Boolean(
    gender
    || maritalStatus
    || religion
    || caste
    || motherTongue
    || city
    || minAge
    || maxAge
    || selectedEducations.length > 0
    || selectedOccupations.length > 0,
  )

  return (
    <section className="stack-wide">
      <div>
        <h1>Discover Profiles</h1>
        <p>Search matrimonial profiles by city, religion, marital status, education, occupation, and age range.</p>
      </div>

      <div className="applied-filters">
        <div className="chip-list">
          {gender && (
            <button type="button" className="chip-button" onClick={() => {
              setGender('')
              setPage(1)
            }}>
              Gender: {formatGender(gender)} ×
            </button>
          )}
          {maritalStatus && (
            <button type="button" className="chip-button" onClick={() => {
              setMaritalStatus('')
              setPage(1)
            }}>
              Marital: {formatMaritalStatus(maritalStatus)} ×
            </button>
          )}
          {religion && (
            <button type="button" className="chip-button" onClick={() => {
              setReligion('')
              setPage(1)
            }}>
              Religion: {displayValue(religion, religionMap)} ×
            </button>
          )}
          {caste && (
            <button type="button" className="chip-button" onClick={() => {
              setCaste('')
              setPage(1)
            }}>
              Caste: {displayValue(caste, casteMap)} ×
            </button>
          )}
          {motherTongue && (
            <button type="button" className="chip-button" onClick={() => {
              setMotherTongue('')
              setPage(1)
            }}>
              Mother Tongue: {motherTongue} ×
            </button>
          )}
          {city && (
            <button type="button" className="chip-button" onClick={() => {
              setCity('')
              setPage(1)
            }}>
              City: {city} ×
            </button>
          )}
          {minAge && (
            <button type="button" className="chip-button" onClick={() => {
              setMinAge('')
              setPage(1)
            }}>
              Min Age: {minAge} ×
            </button>
          )}
          {maxAge && (
            <button type="button" className="chip-button" onClick={() => {
              setMaxAge('')
              setPage(1)
            }}>
              Max Age: {maxAge} ×
            </button>
          )}

          {selectedEducations.map((item) => (
            <button
              key={`education-${item.name}`}
              type="button"
              className="chip-button"
              onClick={() => {
                setSelectedEducations((previous) => previous.filter((entry) => entry.name !== item.name))
                setPage(1)
              }}
            >
              Education: {item.value} ×
            </button>
          ))}

          {selectedOccupations.map((item) => (
            <button
              key={`occupation-${item.name}`}
              type="button"
              className="chip-button"
              onClick={() => {
                setSelectedOccupations((previous) => previous.filter((entry) => entry.name !== item.name))
                setPage(1)
              }}
            >
              Occupation: {item.value} ×
            </button>
          ))}

          <button
            type="button"
            className="chip-action-button chip-action-clear"
            onClick={clearFilters}
            disabled={!hasAppliedFilters}
          >
            Clear Filters
          </button>
          <button type="button" className="chip-action-button chip-action-refresh" onClick={() => void reload()}>
            Refresh
          </button>
        </div>
      </div>

      <div className="toolbar-grid">
        {!shouldHideGenderFilter && (
          <label>
            Gender
            <select
              value={gender}
              onChange={(event) => {
                setPage(1)
                setGender(event.target.value as '' | Gender)
              }}
            >
              <option value="">All</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
        )}

        <label>
          Marital Status
          <select
            value={maritalStatus}
            onChange={(event) => {
              setPage(1)
              setMaritalStatus(event.target.value as '' | MaritalStatus)
            }}
          >
            <option value="">All</option>
            <option value="NEVER_MARRIED">Never Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
            <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
          </select>
        </label>

        <label>
          Religion
          <select
            value={religion}
            onChange={(event) => {
              setPage(1)
              setReligion(event.target.value)
            }}
          >
            <option value="">All</option>
            {religionOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Caste
          <select
            value={caste}
            onChange={(event) => {
              setPage(1)
              setCaste(event.target.value)
            }}
          >
            <option value="">All</option>
            {casteOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label>
          Mother Tongue
          <select
            value={motherTongue}
            onChange={(event) => {
              setPage(1)
              setMotherTongue(event.target.value)
            }}
          >
            <option value="">All</option>
            {motherTongueOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.value}
              </option>
            ))}
          </select>
        </label>

        <label>
          City
          <input
            value={city}
            onChange={(event) => {
              setPage(1)
              setCity(event.target.value)
            }}
            placeholder="e.g. Pune"
          />
        </label>

        <PicklistChipFilter
          label="Education"
          placeholder="Type to search education"
          options={educationOptions}
          selectedItems={selectedEducations}
          onChange={setSelectedEducations}
          onApply={() => setPage(1)}
          showChips={false}
        />

        <PicklistChipFilter
          label="Occupation"
          placeholder="Type to search occupation"
          options={occupationOptions}
          selectedItems={selectedOccupations}
          onChange={setSelectedOccupations}
          onApply={() => setPage(1)}
          showChips={false}
        />

        <label>
          Min Age
          <select
            value={minAge}
            onChange={(event) => {
              setPage(1)
              setMinAge(event.target.value)
            }}
          >
            <option value="">Any</option>
            {AGE_OPTIONS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </label>

        <label>
          Max Age
          <select
            value={maxAge}
            onChange={(event) => {
              setPage(1)
              setMaxAge(event.target.value)
            }}
          >
            <option value="">Any</option>
            {AGE_OPTIONS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionMessage && <p className="success-text">{actionMessage}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && profiles.length === 0}
        emptyMessage="No profiles found for current filters."
      >
        <div className="card-grid discovery-card-grid">
          {profiles.map((profile) => {
            const isShortlisted = shortlistOverrides[profile.profileId] ?? Boolean(profile.shortlisted)
            const hasInterest = Boolean(profile.interestSentStatus || profile.interestReceivedStatus)

            return (
              <ProfileCard
                key={profile.profileId}
                profile={profile}
                religionLabel={displayValue(profile.religion, religionMap)}
                educationLabel={displayValue(profile.education, educationMap)}
                occupationLabel={displayValue(profile.occupation, occupationMap)}
                avatarGender={inferredCardGender}
                onOpen={() => navigate(`/profiles/${profile.referenceId}`)}
                cornerAction={
                  <button
                    type="button"
                    className={`profile-card-heart-button${isShortlisted ? ' profile-card-heart-button-active' : ''}`}
                    aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                    disabled={shortlistBusyId === profile.profileId}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      void handleToggleShortlist(profile.profileId, isShortlisted)
                    }}
                  >
                    ♥
                  </button>
                }
                actions={
                  <>
                    {hasInterest ? (
                      <button type="button" onClick={() => navigate('/interests')}>
                        View Interest
                      </button>
                    ) : (
                      <button type="button" onClick={() => void handleSendInterest(Number(profile.profileId))}>
                        Send Interest
                      </button>
                    )}
                  </>
                }
              />
            )
          })}
        </div>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}

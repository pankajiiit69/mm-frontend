import { useNavigate } from 'react-router-dom'
import { useAuth } from '@fruzoos/auth-core'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { ProfileCard } from '../components/ProfileCard'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'
import { useMemo, useState } from 'react'
import { getOppositeGender } from '../utils/profileCard'

export function ShortlistsPage() {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [shortlistBusyId, setShortlistBusyId] = useState<string | null>(null)
  const { showToast } = useToast()

  const { data: religions } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('RELIGION')
  }, [])

  const { data: educations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('EDUCATION')
  }, [])

  const { data: occupations } = useAsyncData(async () => {
    return await matrimonyApi.getPicklistItems('OCCUPATION')
  }, [])

  const religionMap = useMemo(() => new Map((religions ?? []).map((item) => [item.name, item.value])), [religions])
  const educationMap = useMemo(
    () => new Map((educations ?? []).map((item) => [item.name, item.value])),
    [educations],
  )
  const occupationMap = useMemo(
    () => new Map((occupations ?? []).map((item) => [item.name, item.value])),
    [occupations],
  )

  const displayValue = (value: string | undefined, map: Map<string, string>) => {
    if (!value) {
      return undefined
    }

    return map.get(value) ?? value
  }

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await matrimonyApi.listShortlistedProfiles(page, 12)
      return response.data
    },
    [page],
  )

  const shouldLoadMyProfile = auth.isAuthenticated && auth.user?.role === 'USER'
  const { data: myProfile } = useAsyncData(
    async () => {
      const response = await matrimonyApi.getMyProfile()
      return response.data
    },
    [auth.user?.id],
    shouldLoadMyProfile,
  )

  const profiles = data?.items ?? []
  const inferredCardGender = getOppositeGender(myProfile?.gender)

  const handleSendInterest = async (profileId: number) => {
    setActionError('')
    setMessage('')
    try {
      const response = await matrimonyApi.sendInterest({ toProfileId: profileId })
      setMessage(response.message || 'Interest sent successfully.')
      showToast(response.message || 'Interest sent successfully.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to send interest for this profile.')
      showToast(extractApiError(err, 'Unable to send interest for this profile.'), 'error')
    }
  }

  const handleToggleShortlist = async (profileId: string, isShortlisted: boolean) => {
    setActionError('')
    setMessage('')
    setShortlistBusyId(profileId)

    try {
      if (isShortlisted) {
        const response = await matrimonyApi.removeProfileFromShortlist(profileId)
        setMessage(response.message || 'Profile removed from shortlist.')
        showToast(response.message || 'Profile removed from shortlist.', 'success')
      } else {
        const response = await matrimonyApi.addProfileToShortlist(profileId)
        setMessage(response.message || 'Profile shortlisted successfully.')
        showToast(response.message || 'Profile shortlisted successfully.', 'success')
      }
      await reload()
    } catch (err) {
      setActionError('Unable to update shortlist for this profile.')
      showToast(extractApiError(err, 'Unable to update shortlist for this profile.'), 'error')
    } finally {
      setShortlistBusyId(null)
    }
  }

  return (
    <section className="stack-wide">
      <h1>My Shortlisted Profiles</h1>
      {message && <p className="success-text">{message}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && profiles.length === 0}
        emptyMessage="You have no shortlisted profiles yet."
      >
        <div className="card-grid discovery-card-grid">
          {profiles.map((profile) => {
            const isShortlisted = Boolean(profile.shortlisted)
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

      <PaginationControls currentPage={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </section>
  )
}
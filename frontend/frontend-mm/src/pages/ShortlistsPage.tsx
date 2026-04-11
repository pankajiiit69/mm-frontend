import { useNavigate } from 'react-router-dom'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { ProfileCard } from '../components/ProfileCard'
import { useAsyncData } from '../hooks/useAsyncData'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'
import { useMemo, useState } from 'react'

export function ShortlistsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
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

  const profiles = data?.items ?? []
  const inferredCardGender = undefined

  const onRemove = async (profileId: string) => {
    setActionError('')
    setMessage('')
    try {
      const response = await matrimonyApi.removeProfileFromShortlist(profileId)
      setMessage(response.message || 'Profile removed from shortlist.')
      showToast(response.message || 'Profile removed from shortlist.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to remove profile from shortlist.')
      showToast(extractApiError(err, 'Unable to remove profile from shortlist.'), 'error')
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
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.profileId}
              profile={profile}
              religionLabel={displayValue(profile.religion, religionMap)}
              educationLabel={displayValue(profile.education, educationMap)}
              occupationLabel={displayValue(profile.occupation, occupationMap)}
              avatarGender={inferredCardGender}
              onOpen={() => navigate(`/profiles/${profile.referenceId}`)}
              actions={
                <>
                <button type="button" onClick={() => void onRemove(profile.profileId)}>
                  Remove
                </button>
                </>
              }
            />
          ))}
        </div>
      </AsyncState>

      <PaginationControls currentPage={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
    </section>
  )
}
import { useEffect, useState } from 'react'
import { matrimonyApi } from '../../api/matrimonyApi'
import { AsyncState } from '../../components/AsyncState'
import { PaginationControls } from '../../components/PaginationControls'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { Gender } from '../../types/matrimony'
import { useToast } from '../../context/ToastContext'
import { extractApiError } from '../../utils/apiError'

export function AdminProfilesPage() {
  const [page, setPage] = useState(1)
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'' | Gender>('')
  const [religion, setReligion] = useState('')
  const [city, setCity] = useState('')
  const [verified, setVerified] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL')
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [openActionsProfileId, setOpenActionsProfileId] = useState<number | null>(null)
  const { showToast } = useToast()

  const pageSize = 12

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await matrimonyApi.adminListProfiles({
        page,
        size: pageSize,
        fullName,
        gender: gender || undefined,
        religion,
        city,
        verified: verified === 'ALL' ? undefined : verified === 'VERIFIED',
      })
      return response.data
    },
    [page, fullName, gender, religion, city, verified],
  )

  const profiles = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)

  const verifyProfile = async (profileId: number, shouldVerify: boolean) => {
    setMessage('')
    setActionError('')
    try {
      const response = shouldVerify
        ? await matrimonyApi.adminVerifyProfile(profileId)
        : await matrimonyApi.adminUnverifyProfile(profileId)
      setMessage(response.message || 'Profile verification updated.')
      showToast(response.message || 'Profile verification updated.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to update profile verification status.')
      showToast(extractApiError(err, 'Unable to update profile verification status.'), 'error')
    }
  }

  const deleteProfile = async (profileId: number) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this profile?')
    if (!shouldDelete) {
      return
    }

    setMessage('')
    setActionError('')
    try {
      const response = await matrimonyApi.adminDeleteProfile(profileId)
      setMessage(response.message || 'Profile deleted.')
      showToast(response.message || 'Profile deleted.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to delete profile.')
      showToast(extractApiError(err, 'Unable to delete profile.'), 'error')
    }
  }

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('.row-actions-menu')) {
        return
      }
      setOpenActionsProfileId(null)
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [])

  return (
    <section className="stack-wide">
      <h1>Profiles</h1>

      <div className="toolbar-grid">
        <label>
          Full Name
          <input
            value={fullName}
            onChange={(event) => {
              setPage(1)
              setFullName(event.target.value)
            }}
          />
        </label>

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

        <label>
          Religion
          <input
            value={religion}
            onChange={(event) => {
              setPage(1)
              setReligion(event.target.value)
            }}
          />
        </label>

        <label>
          City
          <input
            value={city}
            onChange={(event) => {
              setPage(1)
              setCity(event.target.value)
            }}
          />
        </label>

        <label>
          Verified
          <select
            value={verified}
            onChange={(event) => {
              setPage(1)
              setVerified(event.target.value as 'ALL' | 'VERIFIED' | 'UNVERIFIED')
            }}
          >
            <option value="ALL">All</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </label>
      </div>

      {message && <p className="success-text">{message}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && profiles.length === 0}
        emptyMessage="No profiles found."
      >
        <table className="table admin-profiles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>City</th>
              <th>Religion</th>
              <th>Marital Status</th>
              <th>Verification Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.profileId}>
                <td>{profile.profileId}</td>
                <td>{profile.fullName}</td>
                <td>{profile.age}</td>
                <td>{profile.city}</td>
                <td>{profile.religion}</td>
                <td>{profile.maritalStatus}</td>
                <td>{profile.verified ? 'VERIFIED' : 'UNVERIFIED'}</td>
                <td>
                  <div className="row-actions-menu">
                    <button
                      type="button"
                      className="row-actions-trigger"
                      aria-label="Open actions"
                      title="Actions"
                      onClick={() =>
                        setOpenActionsProfileId((previous) =>
                          previous === Number(profile.profileId) ? null : Number(profile.profileId),
                        )
                      }
                    >
                      ⋯
                    </button>
                    {openActionsProfileId === Number(profile.profileId) && (
                      <div className="row-actions-list">
                        <button
                          type="button"
                          className="row-action-link"
                          onClick={() => {
                            setOpenActionsProfileId(null)
                            void verifyProfile(Number(profile.profileId), !profile.verified)
                          }}
                        >
                          {profile.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          type="button"
                          className="row-action-link"
                          onClick={() => {
                            setOpenActionsProfileId(null)
                            void deleteProfile(Number(profile.profileId))
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}

import { useState } from 'react'
import { matrimonyApi } from '../../api/matrimonyApi'
import { AsyncState } from '../../components/AsyncState'
import { PaginationControls } from '../../components/PaginationControls'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { VerificationStatus } from '../../types/matrimony'
import { useToast } from '../../context/ToastContext'
import { extractApiError } from '../../utils/apiError'
import { formatEnumLabel } from '../../utils/format'

const VERIFICATION_STATUS_OPTIONS: VerificationStatus[] = [
  'PENDING_EMAIL',
  'PENDING_PHONE',
  'PENDING_PROFILE',
  'PROFILE_NOT_CREATED',
  'VERIFIED',
]

export function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'' | VerificationStatus>('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const { showToast } = useToast()

  const pageSize = 10

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await matrimonyApi.adminListUsers({
        page,
        size: pageSize,
        email,
        name,
        verificationStatus: verificationStatus || undefined,
        active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
      })
      return response.data
    },
    [page, email, name, verificationStatus, activeFilter],
  )

  const users = data?.items ?? []
  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)

  const isProtectedAdminUser = (email: string) => email.toLowerCase().includes('admin')

  const applyVerificationStatus = async (userId: number, status: VerificationStatus) => {
    setMessage('')
    setActionError('')
    try {
      const response = await matrimonyApi.adminSetUserVerificationStatus(userId, status)
      setMessage(response.message || 'Verification status updated.')
      showToast(response.message || 'Verification status updated.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to update verification status.')
      showToast(extractApiError(err, 'Unable to update verification status.'), 'error')
    }
  }

  const toggleUserActive = async (userId: number, nextActive: boolean, userEmail: string) => {
    if (!nextActive && isProtectedAdminUser(userEmail)) {
      setMessage('')
      setActionError('Admin users cannot be deactivated or deleted.')
      showToast('Admin users cannot be deactivated or deleted.', 'error')
      return
    }

    setMessage('')
    setActionError('')
    try {
      const response = nextActive
        ? await matrimonyApi.adminActivateUser(userId)
        : await matrimonyApi.adminDeactivateUser(userId)
      setMessage(response.message || 'User status updated.')
      showToast(response.message || 'User status updated.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to update user status.')
      showToast(extractApiError(err, 'Unable to update user status.'), 'error')
    }
  }

  return (
    <section className="stack-wide">
      <h1>Users</h1>
      <p className="info-text">Search, verify, and control account activation from one place.</p>

      <div className="toolbar-grid">
        <label>
          Email
          <input
            value={email}
            onChange={(event) => {
              setPage(1)
              setEmail(event.target.value)
            }}
          />
        </label>

        <label>
          Name
          <input
            value={name}
            onChange={(event) => {
              setPage(1)
              setName(event.target.value)
            }}
          />
        </label>

        <label>
          Verification Status
          <select
            value={verificationStatus}
            onChange={(event) => {
              setPage(1)
              setVerificationStatus(event.target.value as '' | VerificationStatus)
            }}
          >
            <option value="">All</option>
            {VERIFICATION_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Active
          <select
            value={activeFilter}
            onChange={(event) => {
              setPage(1)
              setActiveFilter(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')
            }}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>

        <div className="inline-actions toolbar-grid-full-span">
          <button
            type="button"
            onClick={() => {
              setPage(1)
              setEmail('')
              setName('')
              setVerificationStatus('')
              setActiveFilter('ALL')
            }}
          >
            Reset Filters
          </button>
          <span className="info-text">{data?.total ?? 0} users</span>
        </div>
      </div>

      {message && <p className="success-text">{message}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && users.length === 0}
        emptyMessage="No users found."
      >
        <div className="interest-table-shell">
          <table className="table admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Active</th>
                <th>Verification</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone ?? '-'}</td>
                  <td>
                    <span className={`admin-status-chip ${user.active ? 'admin-status-chip-success' : 'admin-status-chip-muted'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="admin-status-chip admin-status-chip-info">{formatEnumLabel(user.verificationStatus)}</span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="inline-actions">
                      <button
                        type="button"
                        disabled={user.active && isProtectedAdminUser(user.email)}
                        title={
                          user.active && isProtectedAdminUser(user.email)
                            ? 'Admin users cannot be deactivated or deleted'
                            : undefined
                        }
                        onClick={() => void toggleUserActive(user.id, !user.active, user.email)}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <select
                        value={user.verificationStatus}
                        onChange={(event) =>
                          void applyVerificationStatus(user.id, event.target.value as VerificationStatus)
                        }
                      >
                        {VERIFICATION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {formatEnumLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AsyncState>

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}

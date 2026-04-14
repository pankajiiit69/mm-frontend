import { useState } from 'react'
import { Link } from 'react-router-dom'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { useAsyncData } from '../hooks/useAsyncData'
import type { InterestStatus } from '../types/matrimony'
import { formatEnumLabel } from '../utils/format'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

type Tab = 'sent' | 'received'

function resolveThumbnailSrc(blob?: string) {
  const value = blob?.trim()
  if (!value) {
    return ''
  }
  if (value.startsWith('data:image/')) {
    return value
  }
  return `data:image/jpeg;base64,${value}`
}

function resolveInterestStatusClass(status: InterestStatus) {
  if (status === 'ACCEPTED') return 'interest-status-chip interest-status-chip-accepted'
  if (status === 'DECLINED' || status === 'WITHDRAWN') return 'interest-status-chip interest-status-chip-declined'
  return 'interest-status-chip interest-status-chip-sent'
}

export function InterestsPage() {
  const [tab, setTab] = useState<Tab>('sent')
  const [sentPage, setSentPage] = useState(1)
  const [receivedPage, setReceivedPage] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [actionError, setActionError] = useState('')
  const { showToast } = useToast()

  const sentState = useAsyncData(
    async () => {
      const response = await matrimonyApi.listSentInterests(sentPage, 10)
      return response.data
    },
    [sentPage],
    tab === 'sent',
  )

  const receivedState = useAsyncData(
    async () => {
      const response = await matrimonyApi.listReceivedInterests(receivedPage, 10)
      return response.data
    },
    [receivedPage],
    tab === 'received',
  )

  const onUpdateStatus = async (interestId: number, status: InterestStatus) => {
    setFeedback('')
    setActionError('')
    try {
      const response = await matrimonyApi.updateInterestStatus(interestId, status)
      setFeedback(response.message || 'Interest status updated.')
      showToast(response.message || 'Interest status updated.', 'success')
      if (tab === 'sent') {
        await sentState.reload()
      } else {
        await receivedState.reload()
      }
    } catch (err) {
      setActionError('Unable to update interest status.')
      showToast(extractApiError(err, 'Unable to update interest status.'), 'error')
    }
  }

  const onResendInterest = async (toProfileId: string) => {
    setFeedback('')
    setActionError('')
    try {
      const response = await matrimonyApi.sendInterest({ toProfileId: Number(toProfileId) })
      setFeedback(response.message || 'Interest resent successfully.')
      showToast(response.message || 'Interest resent successfully.', 'success')
      await sentState.reload()
    } catch (err) {
      setActionError('Unable to resend interest.')
      showToast(extractApiError(err, 'Unable to resend interest.'), 'error')
    }
  }

  const activeState = tab === 'sent' ? sentState : receivedState
  const items = activeState.data?.items ?? []
  const currentPage = tab === 'sent' ? sentPage : receivedPage

  return (
    <section className="stack-wide">
      <h1>Interests</h1>
      <p className="info-text">Track your requests and quickly open profile details using reference IDs.</p>

      <div className="interest-tabs" role="tablist" aria-label="Interest tabs">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sent'}
          className={`interest-tab-button${tab === 'sent' ? ' interest-tab-button-active' : ''}`}
          onClick={() => setTab('sent')}
          disabled={tab === 'sent'}
        >
          Sent
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'received'}
          className={`interest-tab-button${tab === 'received' ? ' interest-tab-button-active' : ''}`}
          onClick={() => setTab('received')}
          disabled={tab === 'received'}
        >
          Received
        </button>
      </div>

      {feedback && <p className="success-text">{feedback}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={activeState.loading}
        error={activeState.error}
        isEmpty={!activeState.loading && !activeState.error && items.length === 0}
        emptyMessage={`No ${formatEnumLabel(tab)} interests found.`}
      >
        <div className="interest-table-shell">
          <table className="table interest-table">
            <thead>
              <tr>
                <th>{tab === 'sent' ? 'To Profile' : 'From Profile'}</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((interest) => {
                const fromRef = interest.fromReferenceId?.trim() || ''
                const toRef = interest.toReferenceId?.trim() || ''
                const counterpartReferenceId = tab === 'sent' ? toRef : fromRef
                const counterpartFullName = tab === 'sent'
                  ? interest.toProfileFullName?.trim()
                  : interest.fromProfileFullName?.trim()
                const thumbnailSrc = resolveThumbnailSrc(
                  tab === 'sent'
                    ? interest.toProfileImageThumbnailDataUrl ?? interest.toProfileImageThumbnailBlob
                    : interest.fromProfileImageThumbnailDataUrl ?? interest.fromProfileImageThumbnailBlob,
                )

                return (
                  <tr key={interest.id}>
                    <td>
                      <div className="interest-profile-cell">
                        {thumbnailSrc ? (
                          <img
                            className="interest-profile-thumbnail"
                            src={thumbnailSrc}
                            alt={counterpartFullName || counterpartReferenceId || 'Profile'}
                          />
                        ) : (
                          <div className="interest-profile-thumbnail interest-profile-thumbnail-placeholder" aria-hidden="true" />
                        )}

                        <div className="interest-profile-meta">
                          <div className="interest-profile-name">{counterpartFullName || '-'}</div>
                          {counterpartReferenceId ? (
                            <Link className="interest-reference-link" to={`/profiles/${counterpartReferenceId}`}>
                              {counterpartReferenceId}
                            </Link>
                          ) : (
                            <span className="info-text">-</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={resolveInterestStatusClass(interest.status)}>{formatEnumLabel(interest.status)}</span>
                    </td>
                    <td>{new Date(interest.createdAt).toLocaleString()}</td>
                    <td>
                      {tab === 'received' ? (
                        <div className="interest-actions-inline">
                          <button
                            type="button"
                            className="interest-action-accept"
                            onClick={() => void onUpdateStatus(interest.id, 'ACCEPTED')}
                            disabled={interest.status !== 'SENT'}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="interest-action-decline"
                            onClick={() => void onUpdateStatus(interest.id, 'DECLINED')}
                            disabled={interest.status !== 'SENT'}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div className="interest-actions-inline">
                          {interest.status === 'WITHDRAWN' ? (
                            <button
                              type="button"
                              className="interest-action-resend"
                              onClick={() => void onResendInterest(interest.toProfileId)}
                            >
                              Resend Interest
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="interest-action-cancel"
                              onClick={() => void onUpdateStatus(interest.id, 'WITHDRAWN')}
                              disabled={interest.status !== 'SENT'}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AsyncState>

      <PaginationControls
        currentPage={currentPage}
        totalPages={activeState.data?.totalPages ?? 1}
        onChange={(nextPage) => {
          if (tab === 'sent') {
            setSentPage(nextPage)
            return
          }
          setReceivedPage(nextPage)
        }}
      />
    </section>
  )
}
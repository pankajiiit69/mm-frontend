import { useState } from 'react'
import { matrimonyApi } from '../api/matrimonyApi'
import { AsyncState } from '../components/AsyncState'
import { PaginationControls } from '../components/PaginationControls'
import { useAsyncData } from '../hooks/useAsyncData'
import type { InterestStatus } from '../types/matrimony'
import { formatEnumLabel } from '../utils/format'
import { useToast } from '../context/ToastContext'
import { extractApiError } from '../utils/apiError'

type Tab = 'sent' | 'received'

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
      await receivedState.reload()
    } catch (err) {
      setActionError('Unable to update interest status.')
      showToast(extractApiError(err, 'Unable to update interest status.'), 'error')
    }
  }

  const activeState = tab === 'sent' ? sentState : receivedState
  const items = activeState.data?.items ?? []
  const currentPage = tab === 'sent' ? sentPage : receivedPage

  return (
    <section className="stack-wide">
      <h1>Interests</h1>

      <div className="inline-actions">
        <button type="button" onClick={() => setTab('sent')} disabled={tab === 'sent'}>
          Sent
        </button>
        <button type="button" onClick={() => setTab('received')} disabled={tab === 'received'}>
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
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>From Profile</th>
              <th>To Profile</th>
              <th>Status</th>
              <th>Created</th>
              {tab === 'received' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((interest) => (
              <tr key={interest.id}>
                <td>{interest.id}</td>
                <td>{interest.fromProfileId}</td>
                <td>{interest.toProfileId}</td>
                <td>{formatEnumLabel(interest.status)}</td>
                <td>{new Date(interest.createdAt).toLocaleString()}</td>
                {tab === 'received' && (
                  <td>
                    <div className="inline-actions">
                      <button
                        type="button"
                        onClick={() => void onUpdateStatus(interest.id, 'ACCEPTED')}
                        disabled={interest.status !== 'SENT'}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => void onUpdateStatus(interest.id, 'DECLINED')}
                        disabled={interest.status !== 'SENT'}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
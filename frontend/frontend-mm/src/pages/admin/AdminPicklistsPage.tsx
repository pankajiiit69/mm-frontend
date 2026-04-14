import { useState, type FormEvent } from 'react'
import { matrimonyApi } from '../../api/matrimonyApi'
import { AsyncState } from '../../components/AsyncState'
import { PaginationControls } from '../../components/PaginationControls'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { PicklistEntry, UpsertPicklistEntryRequest } from '../../types/matrimony'
import { useToast } from '../../context/ToastContext'
import { extractApiError } from '../../utils/apiError'

const DEFAULT_FORM: UpsertPicklistEntryRequest = {
  picklistName: '',
  name: '',
  value: '',
  lang: 'en',
  sortOrder: 1,
  active: true,
}

export function AdminPicklistsPage() {
  const [page, setPage] = useState(1)
  const [picklistNameFilter, setPicklistNameFilter] = useState('')
  const [langFilter, setLangFilter] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [createForm, setCreateForm] = useState<UpsertPicklistEntryRequest>(DEFAULT_FORM)
  const [editForm, setEditForm] = useState<UpsertPicklistEntryRequest>(DEFAULT_FORM)

  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const { showToast } = useToast()

  const pageSize = 20

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const response = await matrimonyApi.adminListPicklistEntries({
        page,
        size: pageSize,
        picklistName: picklistNameFilter,
        lang: langFilter,
      })
      return response.data
    },
    [page, picklistNameFilter, langFilter],
  )

  const items = data?.items ?? []
  const activeItems = items.filter((entry) => entry.active).length
  const totalPages = data?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)

  const resetCreateForm = () => {
    setCreateForm(DEFAULT_FORM)
  }

  const cancelInlineEdit = () => {
    setEditingId(null)
    setEditForm(DEFAULT_FORM)
  }

  const startEdit = (entry: PicklistEntry) => {
    setEditingId(entry.id)
    setEditForm({
      picklistName: entry.picklistName,
      name: entry.name,
      value: entry.value,
      lang: entry.lang,
      sortOrder: entry.sortOrder,
      active: entry.active,
    })
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setActionError('')

    try {
      const payload: UpsertPicklistEntryRequest = {
        picklistName: createForm.picklistName.trim(),
        name: createForm.name.trim(),
        value: createForm.value.trim(),
        lang: (createForm.lang || 'en').trim(),
        sortOrder: Number(createForm.sortOrder ?? 1),
        active: Boolean(createForm.active),
      }

      if (!payload.picklistName || !payload.name || !payload.value) {
        setActionError('Picklist name, key name, and value are required.')
        return
      }

      const response = await matrimonyApi.adminCreatePicklistEntry(payload)

      setMessage(response.message || 'Entry created.')
      showToast(response.message || 'Entry created.', 'success')
      resetCreateForm()
      await reload()
    } catch (err) {
      setActionError('Unable to create entry.')
      showToast(extractApiError(err, 'Unable to create entry.'), 'error')
    }
  }

  const saveInlineEdit = async (id: number) => {
    setMessage('')
    setActionError('')

    try {
      const payload: UpsertPicklistEntryRequest = {
        picklistName: editForm.picklistName.trim(),
        name: editForm.name.trim(),
        value: editForm.value.trim(),
        lang: (editForm.lang || 'en').trim(),
        sortOrder: Number(editForm.sortOrder ?? 1),
        active: Boolean(editForm.active),
      }

      if (!payload.picklistName || !payload.name || !payload.value) {
        setActionError('Picklist name, key name, and value are required.')
        return
      }

      const response = await matrimonyApi.adminUpdatePicklistEntry(id, payload)
      setMessage(response.message || 'Entry updated.')
      showToast(response.message || 'Entry updated.', 'success')
      cancelInlineEdit()
      await reload()
    } catch (err) {
      setActionError('Unable to update entry.')
      showToast(extractApiError(err, 'Unable to update entry.'), 'error')
    }
  }

  const setEntryActive = async (id: number, nextActive: boolean) => {
    const shouldProceed = window.confirm(
      nextActive
        ? 'Do you want to activate this picklist entry?'
        : 'Do you want to deactivate this picklist entry?',
    )
    if (!shouldProceed) {
      return
    }

    setMessage('')
    setActionError('')
    try {
      const response = nextActive
        ? await matrimonyApi.adminActivatePicklistEntry(id)
        : await matrimonyApi.adminDeactivatePicklistEntry(id)
      setMessage(response.message || 'Entry status updated.')
      showToast(response.message || 'Entry status updated.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to update entry status.')
      showToast(extractApiError(err, 'Unable to update entry status.'), 'error')
    }
  }

  const deleteEntry = async (id: number) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this picklist entry?')
    if (!shouldDelete) {
      return
    }

    setMessage('')
    setActionError('')
    try {
      const response = await matrimonyApi.adminDeletePicklistEntry(id)
      setMessage(response.message || 'Entry deleted.')
      showToast(response.message || 'Entry deleted.', 'success')
      await reload()
    } catch (err) {
      setActionError('Unable to delete entry.')
      showToast(extractApiError(err, 'Unable to delete entry.'), 'error')
    }
  }

  return (
    <section className="stack-wide">
      <h1>Picklists</h1>
      <p className="info-text">Manage enum values that drive forms and filters across the platform.</p>

      <div className="admin-kpi-strip">
        <article className="admin-kpi-tile">
          <span className="admin-kpi-label">Visible In Current Page</span>
          <strong className="admin-kpi-value">{items.length}</strong>
        </article>
        <article className="admin-kpi-tile">
          <span className="admin-kpi-label">Active Entries</span>
          <strong className="admin-kpi-value">{activeItems}</strong>
        </article>
        <article className="admin-kpi-tile">
          <span className="admin-kpi-label">Current Page</span>
          <strong className="admin-kpi-value">
            {currentPage} / {totalPages}
          </strong>
        </article>
      </div>

      <form className="card stack-wide" onSubmit={onSubmit}>
        <h3>Create Picklist Entry</h3>

        <div className="toolbar-grid">
          <label>
            Picklist Name
            <input
              value={createForm.picklistName}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, picklistName: event.target.value }))}
            />
          </label>
          <label>
            Name (key)
            <input
              value={createForm.name}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, name: event.target.value }))}
            />
          </label>
          <label>
            Value (label)
            <input
              value={createForm.value}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, value: event.target.value }))}
            />
          </label>
          <label>
            Lang
            <input
              value={createForm.lang ?? 'en'}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, lang: event.target.value }))}
            />
          </label>
          <label>
            Sort Order
            <input
              type="number"
              min={0}
              value={String(createForm.sortOrder ?? 1)}
              onChange={(event) =>
                setCreateForm((previous) => ({ ...previous, sortOrder: Number(event.target.value) }))
              }
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={Boolean(createForm.active)}
              onChange={(event) => setCreateForm((previous) => ({ ...previous, active: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="inline-actions">
          <button type="submit">Create Entry</button>
        </div>
      </form>

      <div className="toolbar-grid">
        <label>
          Filter Picklist Name
          <input
            value={picklistNameFilter}
            onChange={(event) => {
              setPage(1)
              setPicklistNameFilter(event.target.value)
            }}
          />
        </label>

        <label>
          Filter Lang
          <input
            value={langFilter}
            onChange={(event) => {
              setPage(1)
              setLangFilter(event.target.value)
            }}
          />
        </label>

        <div className="inline-actions toolbar-grid-full-span">
          <button
            type="button"
            onClick={() => {
              setPage(1)
              setPicklistNameFilter('')
              setLangFilter('')
            }}
          >
            Reset Filters
          </button>
          <span className="info-text">{data?.total ?? 0} total entries</span>
        </div>
      </div>

      {message && <p className="success-text">{message}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && items.length === 0}
        emptyMessage="No picklist entries found."
      >
        <table className="table admin-picklist-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Picklist</th>
              <th>Name</th>
              <th>Value</th>
              <th>Lang</th>
              <th>Sort</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>
                  {editingId === entry.id ? (
                    <input
                      value={editForm.picklistName}
                      onChange={(event) =>
                        setEditForm((previous) => ({ ...previous, picklistName: event.target.value }))
                      }
                    />
                  ) : (
                    entry.picklistName
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input
                      value={editForm.name}
                      onChange={(event) => setEditForm((previous) => ({ ...previous, name: event.target.value }))}
                    />
                  ) : (
                    entry.name
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input
                      value={editForm.value}
                      onChange={(event) => setEditForm((previous) => ({ ...previous, value: event.target.value }))}
                    />
                  ) : (
                    entry.value
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input
                      value={editForm.lang ?? 'en'}
                      onChange={(event) => setEditForm((previous) => ({ ...previous, lang: event.target.value }))}
                    />
                  ) : (
                    entry.lang
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <input
                      type="number"
                      min={0}
                      value={String(editForm.sortOrder ?? 1)}
                      onChange={(event) =>
                        setEditForm((previous) => ({ ...previous, sortOrder: Number(event.target.value) }))
                      }
                    />
                  ) : (
                    entry.sortOrder
                  )}
                </td>
                <td>
                  {editingId === entry.id ? (
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(editForm.active)}
                        onChange={(event) =>
                          setEditForm((previous) => ({ ...previous, active: event.target.checked }))
                        }
                      />
                      Active
                    </label>
                  ) : (
                    <span className={`admin-status-chip ${entry.active ? 'admin-status-chip-success' : 'admin-status-chip-muted'}`}>
                      {entry.active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="table-cell-actions">
                  <div className="inline-actions table-actions-inline">
                    {editingId === entry.id ? (
                      <>
                        <button
                          type="button"
                          className="biodata-icon-button"
                          aria-label="Save entry"
                          title="Save"
                          onClick={() => void saveInlineEdit(entry.id)}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="biodata-icon-button"
                          aria-label="Cancel edit"
                          title="Cancel"
                          onClick={cancelInlineEdit}
                        >
                          ↶
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="biodata-icon-button"
                          aria-label="Edit entry"
                          title="Edit"
                          onClick={() => startEdit(entry)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="biodata-icon-button"
                          aria-label={entry.active ? 'Deactivate entry' : 'Activate entry'}
                          title={entry.active ? 'Deactivate' : 'Activate'}
                          onClick={() => void setEntryActive(entry.id, !entry.active)}
                        >
                          {entry.active ? '⊖' : '✓'}
                        </button>
                        <button
                          type="button"
                          className="biodata-icon-button"
                          aria-label="Delete entry"
                          title="Delete"
                          onClick={() => void deleteEntry(entry.id)}
                        >
                          ✕
                        </button>
                      </>
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

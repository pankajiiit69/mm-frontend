import type { ReactNode } from 'react'

export function AsyncState({
  loading,
  error,
  isEmpty,
  emptyMessage,
  children,
}: {
  loading: boolean
  error: string | null
  isEmpty?: boolean
  emptyMessage?: string
  children?: ReactNode
}) {
  if (loading) {
    return <p className="info-text">Loading data...</p>
  }

  if (error) {
    return <p className="error-text">{error}</p>
  }

  if (isEmpty) {
    return <p className="info-text">{emptyMessage ?? 'No records found.'}</p>
  }

  return <>{children}</>
}

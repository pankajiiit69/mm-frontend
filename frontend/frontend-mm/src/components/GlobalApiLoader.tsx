import { useEffect, useState } from 'react'
import { isApiLoading, subscribeApiLoading } from '../api/requestActivity'

export function GlobalApiLoader() {
  const [loading, setLoading] = useState(isApiLoading())

  useEffect(() => {
    return subscribeApiLoading(setLoading)
  }, [])

  if (!loading) {
    return null
  }

  return (
    <div className="global-api-loader" role="status" aria-live="polite" aria-label="Loading data">
      <div className="global-api-loader-spinner" />
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
  enabled = true,
) {
  const loaderRef = useRef(loader)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loaderRef.current = loader
  }, [loader])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const next = await loaderRef.current()
      setData(next)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const depsKey = JSON.stringify(deps)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    void reload()
  }, [enabled, reload, depsKey])

  return {
    data,
    loading,
    error,
    reload,
    setData,
  }
}

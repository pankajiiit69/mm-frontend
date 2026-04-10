import { useEffect, useMemo, useState } from 'react'
import { matrimonyApi } from '../api/matrimonyApi'

const photoContentCache = new Map<string, string>()

interface UsePhotoContentResult {
  src: string
  loading: boolean
  error: boolean
}

export function usePhotoContent(photoIdentifier?: string, fallbackSrc?: string): UsePhotoContentResult {
  const normalizedIdentifier = useMemo(() => photoIdentifier?.trim() ?? '', [photoIdentifier])
  const [src, setSrc] = useState<string>(() => {
    if (normalizedIdentifier && photoContentCache.has(normalizedIdentifier)) {
      return photoContentCache.get(normalizedIdentifier) ?? ''
    }
    return fallbackSrc?.trim() ?? ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!normalizedIdentifier) {
      setSrc(fallbackSrc?.trim() ?? '')
      setLoading(false)
      setError(false)
      return
    }

    const cached = photoContentCache.get(normalizedIdentifier)
    if (cached) {
      setSrc(cached)
      setLoading(false)
      setError(false)
      return
    }

    setLoading(true)
    setError(false)

    void matrimonyApi.getPhotoContentByIdentifier(normalizedIdentifier)
      .then((response) => {
        if (cancelled) {
          return
        }

        const resolvedSrc = response.data.imageDataUrl?.trim() || fallbackSrc?.trim() || ''
        if (!resolvedSrc) {
          setError(true)
          setSrc('')
          return
        }

        photoContentCache.set(normalizedIdentifier, resolvedSrc)
        setSrc(resolvedSrc)
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        setError(true)
        setSrc(fallbackSrc?.trim() ?? '')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [normalizedIdentifier, fallbackSrc])

  return {
    src,
    loading,
    error,
  }
}

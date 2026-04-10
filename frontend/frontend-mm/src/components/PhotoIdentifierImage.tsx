import type { ImgHTMLAttributes, ReactNode } from 'react'
import { usePhotoContent } from '../hooks/usePhotoContent'

interface PhotoIdentifierImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  photoIdentifier?: string
  fallbackSrc?: string
  fallback?: ReactNode
}

export function PhotoIdentifierImage({
  photoIdentifier,
  fallbackSrc,
  fallback,
  alt,
  ...imgProps
}: PhotoIdentifierImageProps) {
  const { src } = usePhotoContent(photoIdentifier, fallbackSrc)

  if (!src) {
    return <>{fallback ?? null}</>
  }

  return <img {...imgProps} src={src} alt={alt} />
}

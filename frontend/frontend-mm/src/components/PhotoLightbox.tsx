import { useEffect } from 'react'
import { PhotoIdentifierImage } from './PhotoIdentifierImage'

interface PhotoLightboxItem {
  imageUrl?: string
  photoIdentifier?: string
  alt: string
}

interface PhotoLightboxProps {
  images: PhotoLightboxItem[]
  currentIndex: number
  onNavigate: (nextIndex: number) => void
  onClose: () => void
}

export function PhotoLightbox({ images, currentIndex, onNavigate, onClose }: PhotoLightboxProps) {
  const activeImage = images[currentIndex]
  const hasMultiple = images.length > 1

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }

      if (!hasMultiple) {
        return
      }

      if (event.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + images.length) % images.length)
      }

      if (event.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % images.length)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [currentIndex, hasMultiple, images.length, onClose, onNavigate])

  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Image gallery preview" onClick={onClose}>
      <button type="button" className="photo-lightbox-close" aria-label="Close image preview" onClick={onClose}>
        ✕
      </button>

      {hasMultiple && (
        <button
          type="button"
          className="photo-lightbox-nav photo-lightbox-nav-prev"
          aria-label="Previous image"
          onClick={(event) => {
            event.stopPropagation()
            onNavigate((currentIndex - 1 + images.length) % images.length)
          }}
        >
          ‹
        </button>
      )}

      {hasMultiple && (
        <button
          type="button"
          className="photo-lightbox-nav photo-lightbox-nav-next"
          aria-label="Next image"
          onClick={(event) => {
            event.stopPropagation()
            onNavigate((currentIndex + 1) % images.length)
          }}
        >
          ›
        </button>
      )}

      <div className="photo-lightbox-content" onClick={(event) => event.stopPropagation()}>
        <PhotoIdentifierImage
          className="photo-lightbox-image"
          photoIdentifier={activeImage.photoIdentifier}
          fallbackSrc={activeImage.imageUrl}
          alt={activeImage.alt}
          fallback={<div className="photo-lightbox-image" aria-label="Image unavailable" />}
        />
        {hasMultiple && <div className="photo-lightbox-counter">{currentIndex + 1} / {images.length}</div>}
      </div>
    </div>
  )
}
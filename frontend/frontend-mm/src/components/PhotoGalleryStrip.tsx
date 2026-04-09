import type { ReactNode } from 'react'
import type { Photo } from '../types/matrimony'

interface PhotoGalleryStripProps {
  photos: Photo[]
  emptyText: string
  onOpenPhoto: (index: number) => void
  getImageAlt?: (index: number, photo: Photo) => string
  getOpenAriaLabel?: (index: number, photo: Photo) => string
  leadingContent?: ReactNode
  renderPhotoAction?: (photo: Photo, index: number) => ReactNode
}

export function PhotoGalleryStrip({
  photos,
  emptyText,
  onOpenPhoto,
  getImageAlt,
  getOpenAriaLabel,
  leadingContent,
  renderPhotoAction,
}: PhotoGalleryStripProps) {
  const hasGalleryCards = photos.length > 0 || Boolean(leadingContent)

  return (
    <>
      {hasGalleryCards ? (
        <div className="photo-gallery-scroll">
          <div className="photo-gallery-strip">
            {leadingContent}
            {photos.map((photo, index) => {
              const imageAlt = getImageAlt?.(index, photo) ?? `Gallery photo ${index + 1}`
              const openAriaLabel = getOpenAriaLabel?.(index, photo) ?? imageAlt

              return (
                <article key={photo.id ?? photo.photoUrl} className="photo-gallery-card">
                  <button
                    type="button"
                    className="photo-gallery-open-button"
                    aria-label={openAriaLabel}
                    onClick={() => onOpenPhoto(index)}
                  >
                    <img src={photo.photoUrl} alt={imageAlt} className="photo-gallery-image" />
                  </button>
                  {renderPhotoAction?.(photo, index)}
                </article>
              )
            })}
          </div>
        </div>
      ) : null}

      {photos.length === 0 && <p className="info-text">{emptyText}</p>}
    </>
  )
}
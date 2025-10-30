interface ImageLightboxProps {
  imageUrl?: string
  images?: string[]
  videos?: string[]
  title?: string
  initialIndex?: number
  onClose: () => void
}

import { useEffect, useRef, useState, useMemo } from 'react'

export default function ImageLightbox({ imageUrl, images, videos, title, initialIndex, onClose }: ImageLightboxProps) {
  const gallery = useMemo(() => {
    const imgs = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
    const vids = videos && videos.length > 0 ? videos : []
    return [...imgs, ...vids]
  }, [images, imageUrl, videos])
  const [index, setIndex] = useState(0)
  const startXRef = useRef<number | null>(null)

  useEffect(() => {
    const start = typeof initialIndex === 'number' && initialIndex >= 0 ? initialIndex : 0
    setIndex(Math.min(start, Math.max(0, (gallery.length || 1) - 1)))
  }, [title, gallery, initialIndex])

  const goPrev = () => setIndex((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0))
  const goNext = () => setIndex((i) => (gallery.length ? (i + 1) % gallery.length : 0))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '82vw',
          maxHeight: '82vh',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)'
        }}
      >
        {gallery.length > 0 && (
          (/(\.mp4|\.webm)(\?|$)/i.test(gallery[index]) ? (
            <video
              src={gallery[index]}
              controls
              style={{
                display: 'block',
                maxWidth: '82vw',
                maxHeight: '82vh',
                objectFit: 'contain',
                background: 'black'
              }}
            />
          ) : (
            <img
              src={gallery[index]}
              alt={title || 'image'}
              style={{
                display: 'block',
                maxWidth: '82vw',
                maxHeight: '82vh',
                objectFit: 'contain',
                background: 'rgba(0,0,0,0.6)'
              }}
              onTouchStart={(e) => {
                startXRef.current = e.touches[0].clientX
              }}
              onTouchEnd={(e) => {
                const startX = startXRef.current
                startXRef.current = null
                if (startX == null) return
                const endX = e.changedTouches[0].clientX
                const dx = endX - startX
                if (Math.abs(dx) > 40) {
                  if (dx < 0) {
                    goNext()
                  } else {
                    goPrev()
                  }
                }
              }}
            />
          ))
        )}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.45)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'center',
            lineHeight: '36px',
            padding: 0,
          }}
        >
          ✕
        </button>
        {gallery.length > 1 && (
          <>
            <button
              onClick={goPrev}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ‹
            </button>
            <button
              onClick={goNext}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 40,
                height: 40,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              ›
            </button>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: 10,
                transform: 'translateX(-50%)',
                color: '#fff',
                fontSize: 12,
                opacity: 0.85
              }}
            >
              {index + 1} / {gallery.length}
            </div>
          </>
        )}
        {title && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 10,
              color: '#fff',
              fontSize: 14,
              textShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  )
}



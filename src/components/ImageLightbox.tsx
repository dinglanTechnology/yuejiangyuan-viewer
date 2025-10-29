interface ImageLightboxProps {
  imageUrl: string
  title?: string
  onClose: () => void
}

export default function ImageLightbox({ imageUrl, title, onClose }: ImageLightboxProps) {
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
        <img
          src={imageUrl}
          alt={title || 'image'}
          style={{
            display: 'block',
            maxWidth: '82vw',
            maxHeight: '82vh',
            objectFit: 'contain',
            background: 'rgba(0,0,0,0.6)'
          }}
        />
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



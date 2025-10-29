import navImgUrl from '../assets/nav.png?url'

interface Hotspot {
  id: string
  title: string
  imageUrl: string
  leftPct: number
  topPct: number
}

interface NavPanelProps {
  hotspots: Hotspot[]
  currentId?: string
  onSelect: (id: string) => void
}

export default function NavPanel({ hotspots, currentId, onSelect }: NavPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        bottom: 20,
        width: 320,
        zIndex: 200,
        borderRadius: 16,
        overflow: 'hidden',
        background: 'rgba(20,20,20,0.5)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)'
      }}
    >
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: '#6ee7b7',
            boxShadow: '0 0 8px #6ee7b7'
          }}
        />
        <div style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>导航</div>
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <img
          src={navImgUrl}
          alt="nav"
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0 }}>
          {hotspots.map((hs) => (
            <button
              key={hs.id}
              onClick={() => onSelect(hs.id)}
              title={hs.title}
              style={{
                position: 'absolute',
                left: `${hs.leftPct}%`,
                top: `${hs.topPct}%`,
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: 999,
                border: currentId === hs.id ? '2px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.6)',
                background: currentId === hs.id ? 'rgba(110,231,183,0.9)' : 'rgba(110,231,183,0.7)',
                boxShadow: '0 0 10px rgba(110,231,183,0.9), 0 0 24px rgba(110,231,183,0.5)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}



import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PanoramaScene from './components/PanoramaScene'
import MapModel from './components/MapModel'
import TopDownControls from './components/TopDownControls'
import CameraLock from './components/CameraLock'
import NavPanel from './components/NavPanel'
import panoAUrl from './assets/yuejiangyuan.jpg?url'
import ImageLightbox from './components/ImageLightbox'
import demo1 from './assets/demo1.jpg?url'
import demo2 from './assets/demo2.jpg?url'
import demo3 from './assets/demo3.jpg?url'

function App() {
  const [viewMode, setViewMode] = useState<'map' | 'panorama'>('map')
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const [lightbox, setLightbox] = useState<{ url: string; title?: string } | null>(null)

  const hotspots = [
    { id: 'photo-1', title: '户型图1', imageUrl: demo1, leftPct: 25, topPct: 30 },
    { id: 'photo-2', title: '户型图2', imageUrl: demo2, leftPct: 60, topPct: 45 },
    { id: 'photo-3', title: '楼栋渲染图', imageUrl: demo3, leftPct: 70, topPct: 75 }
  ]

  const handlePointClick = () => {
    setIsTransitioning(true)
    
    // 延迟更长时间以展示相机拉近动画
    setTimeout(() => {
      setViewMode('panorama')
      setIsTransitioning(false)
    }, 1500)
  }

  const handleBackToMap = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setViewMode('map')
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      {viewMode === 'map' ? (
        <Canvas camera={{ fov: 50, position: [0, 50, 0] }}>
          <CameraLock />
          <MapModel onPointClick={handlePointClick} isTransitioning={isTransitioning} />
          {!isTransitioning && (
            <TopDownControls 
              enableZoom={true}
            />
          )}
        </Canvas>
      ) : (
        <>
          <button
            onClick={handleBackToMap}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 100,
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            返回地图
          </button>
          <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
            <PanoramaScene imageUrl={panoAUrl} />
            <OrbitControls enableZoom={false} />
          </Canvas>
          <NavPanel
            hotspots={hotspots}
            onSelect={(id) => {
              const hs = hotspots.find(h => h.id === id)
              if (hs) {
                setLightbox({ url: hs.imageUrl, title: hs.title })
              }
            }}
          />
          {lightbox && (
            <ImageLightbox
              imageUrl={lightbox.url}
              title={lightbox.title}
              onClose={() => setLightbox(null)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
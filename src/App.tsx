import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PanoramaScene from './components/PanoramaScene'
import MapModel from './components/MapModel'
import TopDownControls from './components/TopDownControls'
import CameraLock from './components/CameraLock'

function App() {
  const [viewMode, setViewMode] = useState<'map' | 'panorama'>('map')
  const [isTransitioning, setIsTransitioning] = useState(false)

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
            <PanoramaScene />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </>
      )}
    </div>
  )
}

export default App
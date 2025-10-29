import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PanoramaScene from './components/PanoramaScene'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <PanoramaScene />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}

export default App
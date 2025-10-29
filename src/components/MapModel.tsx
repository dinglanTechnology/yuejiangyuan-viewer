import { useRef, useState } from 'react'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Mesh } from 'three'
import * as THREE from 'three'

interface MapModelProps {
  onPointClick: () => void
  isTransitioning: boolean
}

export default function MapModel({ onPointClick, isTransitioning }: MapModelProps) {
  const gltf = useLoader(GLTFLoader, 'https://cloud-city.oss-cn-chengdu.aliyuncs.com/maps/yuejiangyuan.glb')
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  useFrame((_, delta) => {
    if (meshRef.current && isTransitioning) {
      // 在过渡时拉近相机
      const targetPosition = new THREE.Vector3(0, 2, 5)
      camera.position.lerp(targetPosition, delta * 3)
    }
  })

  const handleClick = () => {
    if (!isTransitioning) {
      onPointClick()
    }
  }

  return (
    <>
      {/* 主模型 - 不可点击 */}
      <primitive 
        object={gltf.scene} 
        ref={meshRef}
        scale={[0.01, 0.01, 0.01]}
        position={[0, 0, 0]}
        rotation={[-Math.PI/3, Math.PI, 0]}
      />
      
      {/* 可点击热点 - 只有这个可以点击 */}
      <mesh 
        position={[0, 5, 10]} 
        onClick={handleClick}
        onPointerOver={() => !isTransitioning && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ff6b6b' : '#4ecdc4'}
          emissive={hovered ? '#ff6b6b' : '#4ecdc4'}
          emissiveIntensity={hovered ? 0.5 : 0.3}
        />
      </mesh>
      
      {/* 环境光 */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  )
}


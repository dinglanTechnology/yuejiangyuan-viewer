import { useFrame } from '@react-three/fiber'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function CameraLock() {
  const { camera } = useThree()

  useFrame(() => {
    // 始终让相机向下看
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.lookAt(camera.position.x, 0, camera.position.z)
      camera.up.set(0, 1, 0)
    }
  })

  return null
}


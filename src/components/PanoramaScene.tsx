import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'

interface PanoramaSceneProps {
  imageUrl: string
}

export default function PanoramaScene({ imageUrl }: PanoramaSceneProps) {
  const texture = useLoader(THREE.TextureLoader, imageUrl)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

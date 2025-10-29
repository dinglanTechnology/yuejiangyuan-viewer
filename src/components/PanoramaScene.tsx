import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
// import hdrImg from '../assets/yuejiangyuan.hdr'

export default function PanoramaScene() {
  const texture = useLoader(RGBELoader, '../assets/yuejiangyuan.hdr')
  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

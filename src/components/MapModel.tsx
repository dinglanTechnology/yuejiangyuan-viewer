import { useRef, useState } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";
import * as THREE from "three";

interface MapModelProps {
  onPointClick: () => void;
  isTransitioning: boolean;
}

export default function MapModel({
  onPointClick,
  isTransitioning,
}: MapModelProps) {
  const gltf = useLoader(
    GLTFLoader,
    "https://cloud-city.oss-cn-chengdu.aliyuncs.com/maps/yuejiangyuan.glb"
  );
  const meshRef = useRef<Mesh>(null);
  const hotspotRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (meshRef.current && isTransitioning) {
      // 在过渡时拉近相机
      const targetPosition = new THREE.Vector3(0, 2, 5);
      camera.position.lerp(targetPosition, delta * 3);
    }

    // 让热点始终位于当前相机视野中心的地面上（y=0 上方一点）
    if (hotspotRef.current) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const planeY = 0; // 地面高度
      const denom = forward.y;

      let target = new THREE.Vector3();
      if (Math.abs(denom) > 1e-6) {
        const t = (planeY - camera.position.y) / denom;
        const tClamped = Math.max(t, 0.1);
        target.set(
          camera.position.x + forward.x * tClamped,
          planeY + 2,
          camera.position.z + forward.z * tClamped
        );
      } else {
        // 如果相机几乎水平，看不到地面，则将热点置于相机正下方
        target.set(camera.position.x, planeY + 2, camera.position.z);
      }

      hotspotRef.current.position.lerp(target, delta * 6);
    }
  });

  const handleClick = () => {
    console.log("热点被点击了！isTransitioning:", isTransitioning);
    if (!isTransitioning) {
      console.log("调用 onPointClick");
      onPointClick();
    } else {
      console.log("正在过渡中，忽略点击");
    }
  };

  return (
    <>
      {/* 主模型 - 不可点击 */}
      <primitive
        object={gltf.scene}
        ref={meshRef}
        scale={[0.01, 0.01, 0.01]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 3, Math.PI, 0]}
      />

      {/* 可点击热点 - 只有这个可以点击 */}
      <mesh
        ref={hotspotRef}
        onClick={handleClick}
        onPointerOver={() => !isTransitioning && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial
          color={hovered ? "#ff6b6b" : "#4ecdc4"}
          emissive={hovered ? "#ff6b6b" : "#4ecdc4"}
          emissiveIntensity={hovered ? 0.8 : 0.6}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* 环境光 */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

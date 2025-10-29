import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface HotspotProps {
  position?: [number, number, number] | THREE.Vector3;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  followCamera?: boolean; // 是否跟随相机视野中心
  size?: number; // 热点大小
  defaultColor?: string; // 默认颜色
  hoverColor?: string; // 悬停颜色
  disabled?: boolean; // 是否禁用交互
}

export default function Hotspot({
  position,
  onClick,
  onPointerOver,
  onPointerOut,
  followCamera = false,
  size = 0.1,
  defaultColor = "#4ecdc4",
  hoverColor = "#ff6b6b",
  disabled = false,
}: HotspotProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useFrame((_, delta) => {
    // 只有当 followCamera 为 true 且没有传入 position 时才跟随相机
    if (followCamera && !position && meshRef.current) {
      // 让热点始终位于当前相机视野中心的地面上（y=0 上方一点）
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      const planeY = 0; // 地面高度
      const denom = forward.y;

      const target = new THREE.Vector3();
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

      meshRef.current.position.lerp(target, delta * 6);
    }
  });

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handlePointerOver = () => {
    if (!disabled) {
      setHovered(true);
      onPointerOver?.();
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    onPointerOut?.();
  };

  // 处理位置参数
  // 如果传入了 position，优先使用固定位置；否则如果 followCamera 为 true，位置由 useFrame 动态设置
  const meshPosition: [number, number, number] | undefined = position
    ? position instanceof THREE.Vector3
      ? [position.x, position.y, position.z]
      : position
    : followCamera
    ? undefined // 跟随相机时，位置由 useFrame 动态设置
    : [0, 0, 0];

  return (
    <mesh
      ref={meshRef}
      position={meshPosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? hoverColor : defaultColor}
        emissive={hovered ? hoverColor : defaultColor}
        emissiveIntensity={hovered ? 0.8 : 0.6}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
}

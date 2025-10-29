import { useRef, useState } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
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
  imageUrl?: string; // 图片URL，用于在圆环内部显示
}

export default function Hotspot({
  position,
  onClick,
  onPointerOver,
  onPointerOut,
  followCamera = false,
  size = 0.1,
  defaultColor = "#ffffff",
  hoverColor = "#64B5F6", // 浅蓝色，与白色搭配
  disabled = false,
  imageUrl,
}: HotspotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // 加载图片纹理（如果没有提供图片URL，使用一个空白占位符）
  const texture = useLoader(
    TextureLoader,
    imageUrl ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  );

  useFrame((_, delta) => {
    // 只有当 followCamera 为 true 且没有传入 position 时才跟随相机
    if (followCamera && !position && groupRef.current) {
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

      groupRef.current.position.lerp(target, delta * 6);
    }

    // 让圆环和图片始终面向相机
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
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
    <group
      ref={groupRef}
      position={meshPosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 圆环 */}
      <mesh>
        <torusGeometry args={[size, size * 0.1, 16, 32]} />
        <meshStandardMaterial
          color={hovered ? hoverColor : defaultColor}
          emissive={hovered ? hoverColor : defaultColor}
          emissiveIntensity={hovered ? 0.8 : 0.6}
          transparent={true}
          opacity={0.9}
        />
      </mesh>

      {/* 内部图片 - 使用圆形mesh显示图片纹理 */}
      {imageUrl && (
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[size * 0.8, 32]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            opacity={0.95}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

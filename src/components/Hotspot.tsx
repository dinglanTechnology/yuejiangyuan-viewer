import { useRef, useState, useEffect } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Text } from "@react-three/drei";

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
  label?: string; // 文字标识
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
  label,
}: HotspotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const borderMeshRef = useRef<THREE.Mesh>(null);
  const imageMeshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  // 加载图片纹理（如果没有提供图片URL，使用一个空白占位符）
  const texture = useLoader(
    TextureLoader,
    imageUrl ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  );

  // 设置纹理属性，确保图片正确显示
  useEffect(() => {
    if (texture && imageUrl) {
      texture.flipY = false;
      texture.needsUpdate = true;
    }
  }, [texture, imageUrl]);

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

    // 保持固定方向，不跟随相机旋转
    if (groupRef.current) {
      groupRef.current.rotation.set(0, 0, 0);

      // 悬浮时放大效果
      const targetScale = hovered ? 1.2 : 1.0;
      const currentScale = groupRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * delta * 8;
      groupRef.current.scale.set(newScale, newScale, newScale);
    }

    // 让图片和边框垂直于 x/z 平面（固定方向，不跟随相机）
    if (borderMeshRef.current && imageMeshRef.current && imageUrl) {
      // 设置旋转使其垂直于 x/z 平面（绕 x 轴旋转 -90 度）
      // 这样图片的法向量将沿着 y 轴方向
      borderMeshRef.current.rotation.set(-Math.PI / 2, 0, 0);
      imageMeshRef.current.rotation.set(Math.PI / 2, 0, 0);
    }

    // 让文字也垂直于 x/z 平面（固定方向，不跟随相机）
    if (textRef.current) {
      // 设置旋转使其垂直于 x/z 平面（绕 x 轴旋转 -90 度）
      // 这样文字的法向量将沿着 y 轴方向，与图片保持一致
      textRef.current.rotation.set(-Math.PI / 2, 0, 0);
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
      {/* 图片带白色边框 */}
      {imageUrl && texture && (
        <>
          {/* 白色边框 - 外圈 */}
          <mesh ref={borderMeshRef} position={[0, -0.1, 0]}>
            <circleGeometry args={[size, 32]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 图片 - 内圈，缩小以增加边框宽度 */}
          <mesh ref={imageMeshRef} position={[0, 0, 0.001]}>
            <circleGeometry args={[size * 0.82, 32]} />
            <meshStandardMaterial
              map={texture}
              transparent={false}
              opacity={1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* 文字标识 - 位置动态计算，固定在图片上方（相对于相机视角） */}
      {label && (
        <Text
          ref={textRef}
          position={[0, size * 1.2, 0]}
          fontSize={size * 0.3}
          color={hovered ? hoverColor : defaultColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={size * 0.1}
          outlineColor="#000000"
          outlineOpacity={0.8}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

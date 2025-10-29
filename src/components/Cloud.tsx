import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import * as THREE from "three";

interface CloudProps {
  position: Vector3;
  scale: number;
  speed: number;
  rotationSpeed: number;
}

export default function Cloud({
  position,
  scale,
  speed,
  rotationSpeed,
}: CloudProps) {
  const meshRef = useRef<Mesh>(null);

  // 创建云朵纹理
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load("/assets/cloud_fluff_double800_64_blue.png");
  }, []);

  // 创建云朵材质
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      opacity: Math.random() * 0.3 + 0.7, // 随机透明度 0.7-1.0 (更不透明，适配鸟瞰视角)
      side: THREE.DoubleSide, // 双面渲染
      depthWrite: false, // 禁用深度写入，避免云朵相互遮挡
    });
  }, [texture]);

  // 创建云朵几何体 - 使用更小的几何体，适配鸟瞰视角
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(0.5, 0.5);
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // 云朵移动动画
      meshRef.current.position.x += speed * delta;

      // 云朵旋转动画 - 绕Z轴旋转（因为云朵现在是水平放置的）
      meshRef.current.rotation.z += rotationSpeed * delta;

      // 添加轻微的上下浮动效果
      meshRef.current.position.y +=
        Math.sin(Date.now() * 0.001 + position.x * 0.01) * 0.01 * delta;

      // 如果云朵移出屏幕，重新定位到左侧
      if (meshRef.current.position.x > -2) {
        meshRef.current.position.x = -6;
        // 随机调整Y位置
        meshRef.current.position.y = position.y + (Math.random() - 0.5) * 20;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      rotation={[-Math.PI / 2, 0, 0]} // 绕X轴旋转90度，使云朵水平放置
      material={material}
      geometry={geometry}
    />
  );
}

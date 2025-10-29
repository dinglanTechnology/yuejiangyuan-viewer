import { useRef } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";
import * as THREE from "three";
import CloudManager from "./CloudManager";
import Hotspot from "./Hotspot";
import gateImg from "/assets/gate.jpg";

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
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (meshRef.current && isTransitioning) {
      // 在过渡时拉近相机
      const targetPosition = new THREE.Vector3(0, 2, 5);
      camera.position.lerp(targetPosition, delta * 3);
    }
  });

  const handleHotspotClick = () => {
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

      {/* 云朵管理器 */}
      <CloudManager cloudCount={12} />

      {/* 可点击热点 - 只有这个可以点击 */}
      <Hotspot
        followCamera={true}
        onClick={handleHotspotClick}
        disabled={isTransitioning}
        size={0.1}
        defaultColor="#ffffff"
        hoverColor="#64B5F6"
        position={
          new THREE.Vector3(
            -4.692880421128081,
            -2.56334382171481,
            -2.0632845034885405
          )
        }
        imageUrl={gateImg}
      />

      {/* 环境光 */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

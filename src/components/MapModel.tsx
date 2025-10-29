import { useRef } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";
import * as THREE from "three";
import CloudManager from "./CloudManager";
import Hotspot from "./Hotspot";
import gateImg from "/assets/gate.jpg";
import floorPlanImg from "/assets/room-layout.jpg";
import balconyImg from "/assets/balcony.jpg";
import buildingRenderImg from "/assets/unit.jpg";

interface MapModelProps {
  onPointClick: () => void;
  isTransitioning: boolean;
}

const hotPoints = [
  {
    name: "gate",
    label: "大门",
    position: new THREE.Vector3(
      -4.692880421128081,
      -2.56334382171481,
      -2.0632845034885405
    ),
    imageUrl: gateImg,
  },
  {
    name: "balcony",
    label: "阳台",
    position: new THREE.Vector3(
      -4.153933571882685,
      -3.8599739586467585, // 增加1单位，靠近镜头
      -3.2378727115163053
    ),
    imageUrl: balconyImg,
  },
  {
    name: "floorPlan",
    label: "户型图",
    position: new THREE.Vector3(
      -5.211856888533854,
      -2.8969940546159343, // 增加1单位，靠近镜头
      -3.1475840724163877
    ),
    imageUrl: floorPlanImg,
  },
  {
    name: "buildingRender",
    label: "楼栋渲染图",
    position: new THREE.Vector3(
      -3.7654038675276844,
      -3.634304843029845, // 增加1单位，靠近镜头
      -3.5314873515463785
    ),
    imageUrl: buildingRenderImg,
  },
];

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
      {hotPoints.map((hotPoint) => (
        <Hotspot
          key={hotPoint.name}
          followCamera={true}
          onClick={handleHotspotClick}
          disabled={isTransitioning}
          size={0.1}
          defaultColor="#ffffff"
          hoverColor="#64B5F6"
          position={hotPoint.position}
          imageUrl={hotPoint.imageUrl}
          label={hotPoint.label}
        />
      ))}

      {/* 环境光 */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

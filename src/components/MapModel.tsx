import { useRef, useMemo, useEffect, useState } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Mesh } from "three";
import * as THREE from "three";
import CloudManager from "./CloudManager";
import Hotspot from "./Hotspot";
import { getCachedModel, preloadModel } from "../utils/modelPreloader";
import gateImg from "/assets/gate.jpg";
import floorPlanImg from "/assets/room-layout.jpg";
import balconyImg from "/assets/balcony.jpg";
import buildingRenderImg from "/assets/unit.jpg";

interface MapModelProps {
  onPointClick: (label: string) => void;
  isTransitioning: boolean;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
}

const hotPoints = [
  {
    name: "gate",
    label: "大门前场",
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
    label: "楼栋渲染",
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
  onLoadProgress,
  onLoadComplete,
}: MapModelProps) {
  const [modelScene, setModelScene] = useState<THREE.Group | null>(null);
  const [useCachedModel, setUseCachedModel] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();

  // 优先使用缓存的模型
  useEffect(() => {
    const cached = getCachedModel();
    if (cached) {
      // 如果有缓存，立即使用
      setModelScene(cached);
      setUseCachedModel(true);
      onLoadProgress?.(100);
      setTimeout(() => {
        onLoadComplete?.();
      }, 100);
      return;
    }

    // 如果没有缓存，尝试继续预加载
    preloadModel()
      .then((model) => {
        // 如果预加载完成，使用预加载的模型
        setModelScene(model);
        setUseCachedModel(true);
        onLoadProgress?.(100);
        setTimeout(() => {
          onLoadComplete?.();
        }, 100);
      })
      .catch(() => {
        // 如果预加载失败，依赖 useLoader 作为后备方案
        setUseCachedModel(false);
      });
  }, [onLoadProgress, onLoadComplete]);

  // 使用 useMemo 创建 LoadingManager，确保在 useLoader 之前创建
  const loadingManager = useMemo(() => {
    const manager = new THREE.LoadingManager();

    manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      // 确保 itemsTotal 大于 0，避免除零错误
      if (itemsTotal > 0) {
        // 使用 Math.min 确保进度不超过 100%
        const progress = Math.min((itemsLoaded / itemsTotal) * 100, 100);
        onLoadProgress?.(progress);
      }
    };

    manager.onLoad = () => {
      // 确保加载完成时进度是100%（强制设置，修复进度显示问题）
      onLoadProgress?.(100);
      // 稍微延迟一下，让用户看到100%
      setTimeout(() => {
        onLoadComplete?.();
      }, 300);
    };

    manager.onError = (url) => {
      console.error("模型加载失败:", url);
      // 即使出错也设置进度为100%，然后完成
      onLoadProgress?.(100);
      setTimeout(() => {
        onLoadComplete?.();
      }, 300);
    };

    return manager;
  }, [onLoadProgress, onLoadComplete]);

  // 始终调用 useLoader，但只在没有缓存时使用
  const gltf = useLoader(
    GLTFLoader,
    "https://cloud-city.oss-cn-chengdu.aliyuncs.com/maps/yuejiangyuan.glb",
    (loader) => {
      // 将 LoadingManager 设置到 loader
      loader.manager = loadingManager;
    }
  );

  // 如果 useLoader 返回了模型，且没有使用缓存的模型，则使用 useLoader 的结果
  useEffect(() => {
    if (gltf && !useCachedModel && !modelScene) {
      setModelScene(gltf.scene);
    }
  }, [gltf, modelScene, useCachedModel]);

  // 最终使用的模型场景：优先使用缓存的模型，否则使用 useLoader 的结果
  const finalModelScene = modelScene || (gltf ? gltf.scene : null);

  useFrame((_, delta) => {
    if (meshRef.current && isTransitioning) {
      // 在过渡时拉近相机
      const targetPosition = new THREE.Vector3(0, 2, 5);
      camera.position.lerp(targetPosition, delta * 3);
    }
  });

  const handleHotspotClick = (label: string) => {
    if (!isTransitioning) {
      onPointClick(label);
    }
  };

  return (
    <>
      {/* 主模型 - 不可点击 */}
      {finalModelScene && (
        <primitive
          object={finalModelScene}
          ref={meshRef}
          scale={[0.01, 0.01, 0.01]}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 3, Math.PI, 0]}
        />
      )}

      {/* 云朵管理器 */}
      <CloudManager cloudCount={12} />

      {/* 可点击热点 - 只有这个可以点击 */}
      {hotPoints.map((hotPoint) => (
        <Hotspot
          key={hotPoint.name}
          followCamera={true}
          onClick={() => handleHotspotClick(hotPoint.label)}
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

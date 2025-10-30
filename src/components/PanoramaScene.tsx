import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useMemo } from "react";

interface PanoImageHotspot {
  id: string;
  title?: string;
  imageUrl: string;
  yaw: number; // 水平角（弧度，0 指向 -Z，顺时针为正，即 three.js y 轴旋转方向）
  pitch: number; // 俯仰角（弧度，向上为正）
}

interface PanoramaSceneProps {
  imageUrl: string;
  imageHotspots?: PanoImageHotspot[];
  onHotspotClick?: (payload: {
    id: string;
    imageUrl: string;
    title?: string;
  }) => void;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: () => void;
}

function sphericalToCartesian(yaw: number, pitch: number, radius: number) {
  // three.js 约定：正面看向 -Z 方向；yaw 围绕 Y 轴旋转，pitch 围绕 X 轴旋转
  const x = radius * Math.sin(yaw) * Math.cos(pitch);
  const y = radius * Math.sin(pitch);
  const z = radius * -Math.cos(yaw) * Math.cos(pitch);
  return new THREE.Vector3(x, y, z);
}

function HotspotDom({
  position,
  title,
  imageUrl,
  onClick,
}: {
  position: THREE.Vector3;
  title?: string;
  imageUrl: string;
  onClick?: () => void;
}) {
  const { camera } = useThree();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useFrame(() => {
    if (!rootRef.current) return;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.normalize();

    const toHotspot = position.clone().normalize();
    const dot = THREE.MathUtils.clamp(forward.dot(toHotspot), -1, 1);
    const angle = Math.acos(dot); // 0..PI

    // 视角越对准越小（0.8），越背对越大（1.2）
    const scale = THREE.MathUtils.lerp(0.8, 1.2, angle / Math.PI);
    rootRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });

  return (
    <Html position={position} sprite center zIndexRange={[150, 250]}>
      <div
        ref={rootRef}
        onClick={onClick}
        title={title}
        style={{
          width: 90,
          height: 90,
          borderRadius: 999,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.35), 0 0 0 8px rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.3)",
          overflow: "hidden",
          cursor: "pointer",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          position: "relative",
          transform: "translate(-50%, -50%)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 12px 36px rgba(0,0,0,0.45), 0 0 0 10px rgba(110,231,183,0.25)";
          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 10px 30px rgba(0,0,0,0.35), 0 0 0 8px rgba(255,255,255,0.08)";
          e.currentTarget.style.border = "1px solid rgba(255,255,255,0.3)";
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -28,
            height: 36,
            borderRadius: 999,
            background:
              "radial-gradient(ellipse at center, rgba(110,231,183,0.45), rgba(110,231,183,0) 60%)",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />
      </div>
    </Html>
  );
}

export default function PanoramaScene({
  imageUrl,
  imageHotspots,
  onHotspotClick,
  onLoadProgress,
  onLoadComplete,
}: PanoramaSceneProps) {
  // 使用 useMemo 创建 LoadingManager，追踪纹理加载进度
  // 当 imageUrl 变化时，重新创建 LoadingManager 以追踪新的加载
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
      // 确保加载完成时进度是100%
      onLoadProgress?.(100);
      // 稍微延迟一下，让用户看到100%
      setTimeout(() => {
        onLoadComplete?.();
      }, 300);
    };

    manager.onError = (url) => {
      console.error("全景图加载失败:", url);
      // 即使出错也设置进度为100%，然后完成
      onLoadProgress?.(100);
      setTimeout(() => {
        onLoadComplete?.();
      }, 300);
    };

    return manager;
  }, [imageUrl, onLoadProgress, onLoadComplete]);

  const texture = useLoader(THREE.TextureLoader, imageUrl, (loader) => {
    // 将 LoadingManager 设置到 loader
    loader.manager = loadingManager;
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
      {imageHotspots?.map((hs) => {
        const pos = sphericalToCartesian(hs.yaw, hs.pitch, 480);
        return (
          <HotspotDom
            key={hs.id}
            position={pos}
            title={hs.title}
            imageUrl={hs.imageUrl}
            onClick={() =>
              onHotspotClick?.({
                id: hs.id,
                imageUrl: hs.imageUrl,
                title: hs.title,
              })
            }
          />
        );
      })}
    </mesh>
  );
}

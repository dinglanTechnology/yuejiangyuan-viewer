import { useMemo, useState, Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import TopDownControls from "../components/TopDownControls";
import CameraLock from "../components/CameraLock";
import ImageLightbox from "../components/ImageLightbox";
import ModelLoadingProgress from "../components/ModelLoadingProgress";
import ImgMap from "../components/ImgMap";
import { indexManifest } from "../utils/assetManifest";

type LabelPosition =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

// 懒加载大型组件，进行代码分割
const MapModel = lazy(() => import("../components/MapModel"));

// 位置映射：仅对 manifest 中存在的 title 生效
const titleToPos: Record<
  string,
  {
    leftPct: number;
    topPct: number;
    bgColor?: string;
    labelPosition?: LabelPosition;
  }
> = {
  归家车马院: {
    leftPct: 60.89,
    topPct: 38.67,
    labelPosition: "top-right",
    bgColor: "#FFE452",
  },
  售楼部视野: {
    leftPct: 59,
    topPct: 44.4,
    labelPosition: "right",
    bgColor: "#90CFFF",
  },
  叠水水景: {
    leftPct: 57.5,
    topPct: 47,
    labelPosition: "bottom-right",
    bgColor: "#70CEAC",
  },
  桥特写: {
    leftPct: 56,
    topPct: 52.34,
    labelPosition: "left",
    bgColor: "#A777F4",
  },
  下沉中庭: {
    leftPct: 53.32,
    topPct: 47,
    labelPosition: "top-left",
    bgColor: "#FFA352",
  },
  立面: {
    leftPct: 55.5,
    topPct: 63,
    labelPosition: "right",
    bgColor: "#FFE452",
  },
  廊桥: {
    leftPct: 49.23,
    topPct: 64.08,
    labelPosition: "left",
    bgColor: "#FFA352",
  },
  儿童娱乐区: {
    leftPct: 48.04,
    topPct: 72.21,
    labelPosition: "bottom",
    bgColor: "#FFA352",
  },
  单元入户门: {
    leftPct: 41,
    topPct: 60.11,
    labelPosition: "top-left",
    bgColor: "#FFE452",
  },
  户型图: {
    leftPct: 52.14,
    topPct: 27,
    labelPosition: "bottom-left",
    bgColor: "#FFE452",
  },
  天际阳台: {
    leftPct: 49.23,
    topPct: 24.86,
    labelPosition: "top-left",
    bgColor: "#A777F4",
  },
};

export default function MapPage() {
  const navigate = useNavigate();
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(
    undefined
  );
  // 当前选中热点（可按需用于高亮 NavPanel 等）

  // 渲染模式：默认使用静态鸟瞰地图
  const renderMode: "image" | "3d" = "image";

  // 从 manifest 获取资源
  const { byTitlePanos, byTitleImages, titles } = useMemo(
    () => indexManifest(),
    []
  );
  const hotspots = useMemo(
    () =>
      titles
        .filter((t) => !!titleToPos[t])
        .map((t) => ({
          id: t,
          title: t,
          leftPct: titleToPos[t].leftPct,
          topPct: titleToPos[t].topPct,
          bgColor: titleToPos[t].bgColor,
          labelPosition: titleToPos[t].labelPosition,
        })),
    [titles]
  );
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const handlePointClick = async (label: string) => {
    const folderName = label;
    const panos = byTitlePanos[folderName] || [];
    const images = byTitleImages[folderName] || [];
    if (panos.length) {
      navigate(`/panorama?folder=${encodeURIComponent(folderName)}`);
    } else if (images.length) {
      setLightboxImages(images);
      setLightboxTitle(folderName);
    }
  };

  const handleModelLoadProgress = (progress: number) => {
    setModelLoadProgress(progress);
  };

  const handleModelLoadComplete = () => {
    // 加载完成后，延迟一点时间再隐藏进度条（让用户看到100%）
    setTimeout(() => {
      setIsModelLoading(false);
      setModelLoadProgress(0);
    }, 500);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      {/* 顶部控制按钮 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 100,
          display: "flex",
          gap: "10px",
        }}
      >
        {/* 渲染模式切换按钮 - 暂时隐藏 */}
        {/* <button
          onClick={handleToggleRenderMode}
          style={{
            padding: "10px 20px",
            background:
              renderMode === "3d"
                ? "rgba(124, 179, 66, 0.8)"
                : "rgba(255, 255, 255, 0.2)",
            border:
              renderMode === "3d"
                ? "1px solid rgba(124, 179, 66, 0.5)"
                : "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
        >
          {renderMode === "image" ? "切换到3D模型" : "切换到鸟瞰图"}
        </button> */}
      </div>

      {/* 模型加载进度 */}
      <ModelLoadingProgress
        progress={modelLoadProgress}
        isVisible={isModelLoading}
        title="模型加载中..."
      />

      {/* 根据渲染模式显示不同内容 */}
      {renderMode === "image" ? (
        // 静态鸟瞰地图模式
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <ImgMap
            hotspots={hotspots}
            onHotspotClick={(hotspot) => handlePointClick(hotspot.title)}
          />
        </div>
      ) : (
        // 3D 模型模式
        <Canvas camera={{ fov: 2, position: [-4, 86, -2.5] }}>
          <CameraLock />
          <Suspense fallback={null}>
            <MapModel
              onPointClick={handlePointClick}
              isTransitioning={false}
              onLoadProgress={handleModelLoadProgress}
              onLoadComplete={handleModelLoadComplete}
            />
          </Suspense>
          <TopDownControls
            enableZoom={true}
            maxDistance={15}
            minFov={1}
            maxFov={8}
          />
        </Canvas>
      )}

      {/* 图片弹窗 */}
      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          title={lightboxTitle}
          onClose={() => {
            setLightboxImages(null);
            setLightboxTitle(undefined);
          }}
        />
      )}
    </div>
  );
}

import { useMemo, useState, Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import TopDownControls from "../components/TopDownControls";
import CameraLock from "../components/CameraLock";
import ImageLightbox from "../components/ImageLightbox";
import ModelLoadingProgress from "../components/ModelLoadingProgress";
import ImgMap from "../components/ImgMap";

// 懒加载大型组件，进行代码分割
const MapModel = lazy(() => import("../components/MapModel"));

const hotspots = [
  {
    id: "hl-1",
    title: "归家车马院",
    leftPct: 60.89,
    topPct: 38.67,
  },
  {
    id: "hl-2",
    title: "售楼部视野",
    leftPct: 59,
    topPct: 44.4,
  },
  {
    id: "hl-3",
    title: "叠水水景",
    leftPct: 57.5,
    topPct: 49.11,
  },
  {
    id: "hl-4",
    title: "桥特写",
    leftPct: 56,
    topPct: 52.34,
  },
  {
    id: "hl-5",
    title: "下沉中庭",
    leftPct: 53.32,
    topPct: 44.37,
  },
  {
    id: "hl-6",
    title: "立面",
    leftPct: 55.5,
    topPct: 61.44,
  },
  {
    id: "hl-7",
    title: "廊桥",
    leftPct: 49.23,
    topPct: 64.08,
  },
  {
    id: "hl-8",
    title: "儿童娱乐区",
    leftPct: 48.04,
    topPct: 72.21,
  },
  {
    id: "hl-9",
    title: "单元入户门",
    leftPct: 42.68,
    topPct: 60.11,
  },
  {
    id: "hl-10",
    title: "户型图",
    leftPct: 52.14,
    topPct: 28.83,
  },
  {
    id: "hl-11",
    title: "天际阳台",
    leftPct: 49.23,
    topPct: 24.86,
  },
];

export default function MapPage() {
  const navigate = useNavigate();
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(
    undefined
  );

  // 渲染模式：默认使用静态鸟瞰地图
  const renderMode: "image" | "3d" = "image";

  // 索引 assets 目录下的 panoramic.jpg 以及同级 png 图片
  // 使用 lazy loading，只在需要时加载资源
  const { folderToPano, folderToPngs } = useMemo(() => {
    // 改为 lazy loading，避免初始化时加载所有资源
    const panoEntries = import.meta.glob("../assets/*/panoramic.jpg", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;
    const pngEntries = import.meta.glob("../assets/*/*.png", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;

    const folderToPanoLocal: Record<string, () => Promise<string>> = {};
    Object.entries(panoEntries).forEach(([path, loader]) => {
      const match = path.match(/\.\.\/assets\/([^/]+)\/panoramic\.jpg$/);
      if (match) {
        const folder = match[1];
        folderToPanoLocal[folder] = loader;
      }
    });

    const folderToPngsLocal: Record<string, (() => Promise<string>)[]> = {};
    Object.entries(pngEntries).forEach(([path, loader]) => {
      const match = path.match(/\.\.\/assets\/([^/]+)\/[^/]+\.png$/);
      if (match) {
        const folder = match[1];
        if (!folderToPngsLocal[folder]) folderToPngsLocal[folder] = [];
        folderToPngsLocal[folder].push(loader);
      }
    });

    // 保持 png 顺序稳定（按路径字典序）
    Object.keys(folderToPngsLocal).forEach((k) => folderToPngsLocal[k].sort());

    return { folderToPano: folderToPanoLocal, folderToPngs: folderToPngsLocal };
  }, []);

  const [loadedPanoUrls, setLoadedPanoUrls] = useState<Record<string, string>>(
    {}
  );
  const [loadedPngUrls, setLoadedPngUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const handlePointClick = async (label: string) => {
    const folderName = label;
    const panoLoader = folderToPano[folderName];
    const pngLoaders = folderToPngs[folderName];

    if (panoLoader) {
      // 如果有全景图，跳转到全景图页面
      setIsLoadingResource(true);
      try {
        const url = loadedPanoUrls[folderName] || (await panoLoader());
        if (!loadedPanoUrls[folderName]) {
          setLoadedPanoUrls((prev) => ({ ...prev, [folderName]: url }));
        }

        // 加载 PNG 图片（如果有）
        if (pngLoaders?.length) {
          const pngUrls =
            loadedPngUrls[folderName] ||
            (await Promise.all(pngLoaders.map((loader) => loader())));
          if (!loadedPngUrls[folderName]) {
            setLoadedPngUrls((prev) => ({ ...prev, [folderName]: pngUrls }));
          }
        }

        // 跳转到全景图页面，传递参数
        navigate(`/panorama?folder=${encodeURIComponent(folderName)}`);
        setIsLoadingResource(false);
      } catch (error) {
        console.error("加载资源失败:", error);
        setIsLoadingResource(false);
      }
    } else if (pngLoaders?.length) {
      // 如果只有 PNG 图片，先加载再弹出弹窗
      setIsLoadingResource(true);
      try {
        const pngUrls =
          loadedPngUrls[folderName] ||
          (await Promise.all(pngLoaders.map((loader) => loader())));
        if (!loadedPngUrls[folderName]) {
          setLoadedPngUrls((prev) => ({ ...prev, [folderName]: pngUrls }));
        }
        setLightboxImages(pngUrls);
        setLightboxTitle(folderName);
        setIsLoadingResource(false);
      } catch (error) {
        console.error("加载 PNG 图片失败:", error);
        setIsLoadingResource(false);
      }
    }
  };

  const handleBackToHome = () => {
    navigate("/");
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
        {/* 返回首页按钮 */}
        <button
          onClick={handleBackToHome}
          style={{
            padding: "10px 20px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px",
            backdropFilter: "blur(10px)",
          }}
        >
          返回首页
        </button>

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

      {/* 资源加载指示器 */}
      {isLoadingResource && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            color: "white",
            fontSize: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(255, 255, 255, 0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div>加载中...</div>
        </div>
      )}

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

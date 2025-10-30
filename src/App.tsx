import { useMemo, useState, Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TopDownControls from "./components/TopDownControls";
import CameraLock from "./components/CameraLock";
import NavPanel from "./components/NavPanel";
import ImageLightbox from "./components/ImageLightbox";
import WelcomeScreen from "./components/WelcomeScreen";
import ModelLoadingProgress from "./components/ModelLoadingProgress";
// import ClickablePointMarkers from "./components/ClickablePointMarkers";

// 懒加载大型组件，进行代码分割
const PanoramaScene = lazy(() => import("./components/PanoramaScene"));
const MapModel = lazy(() => import("./components/MapModel"));

// 修正公共资源路径：使用 Vite public 目录下的绝对路径
const panoAUrl = "/assets/yuejiangyuan.jpg";
const demo2 = "/assets/demo2.jpg";
const demo3 = "/assets/demo3.jpg";

function App() {
  const [viewMode, setViewMode] = useState<"map" | "panorama">("map");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(
    undefined
  );

  // 索引 assets 目录下的 panoramic.jpg 以及同级 png 图片、视频
  // 使用 lazy loading，只在需要时加载资源
  const { folderToPano, folderToPngs, folderToVideos } = useMemo(() => {
    // 改为 lazy loading，避免初始化时加载所有资源
    const panoEntries = import.meta.glob("./assets/*/panoramic.jpg", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;
    const pngEntries = import.meta.glob("./assets/*/*.png", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;
    const mp4Entries = import.meta.glob("./assets/*/*.mp4", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;
    const webmEntries = import.meta.glob("./assets/*/*.webm", {
      query: "?url",
      import: "default",
      eager: false,
    }) as Record<string, () => Promise<string>>;

    const folderToPanoLocal: Record<string, () => Promise<string>> = {};
    Object.entries(panoEntries).forEach(([path, loader]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/panoramic\.jpg$/);
      if (match) {
        const folder = match[1];
        folderToPanoLocal[folder] = loader;
      }
    });

    const folderToPngsLocal: Record<string, (() => Promise<string>)[]> = {};
    const folderToVideosLocal: Record<string, (() => Promise<string>)[]> = {};
    Object.entries(pngEntries).forEach(([path, loader]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/[^/]+\.png$/);
      if (match) {
        const folder = match[1];
        if (!folderToPngsLocal[folder]) folderToPngsLocal[folder] = [];
        folderToPngsLocal[folder].push(loader);
      }
    });
    Object.entries(mp4Entries).forEach(([path, loader]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/[^/]+\.mp4$/);
      if (match) {
        const folder = match[1];
        if (!folderToVideosLocal[folder]) folderToVideosLocal[folder] = [];
        folderToVideosLocal[folder].push(loader);
      }
    });
    Object.entries(webmEntries).forEach(([path, loader]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/[^/]+\.webm$/);
      if (match) {
        const folder = match[1];
        if (!folderToVideosLocal[folder]) folderToVideosLocal[folder] = [];
        folderToVideosLocal[folder].push(loader);
      }
    });

    // 保持资源顺序稳定（按路径字典序）
    Object.keys(folderToPngsLocal).forEach((k) => folderToPngsLocal[k].sort());
    Object.keys(folderToVideosLocal).forEach((k) => folderToVideosLocal[k].sort());

    return { folderToPano: folderToPanoLocal, folderToPngs: folderToPngsLocal, folderToVideos: folderToVideosLocal };
  }, []);

  const [currentPanoUrl, setCurrentPanoUrl] = useState<string>(panoAUrl);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loadedPanoUrls, setLoadedPanoUrls] = useState<Record<string, string>>(
    {}
  );
  const [loadedPngUrls, setLoadedPngUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [loadedVideoUrls, setLoadedVideoUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [shouldShowMap, setShouldShowMap] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  const hotspots = [
    // { id: 'hl-1', title: '廊桥', imageUrl: demo1, leftPct: 22, topPct: 28 },
    { id: "hl-2", title: "楼栋渲染", imageUrl: demo3, leftPct: 58, topPct: 34 },
    { id: "hl-3", title: "户型图", imageUrl: demo2, leftPct: 72, topPct: 48 },
    // { id: 'hl-4', title: '叠水', imageUrl: demo1, leftPct: 40, topPct: 62 },
    {
      id: "hl-5",
      title: "单元入户门",
      imageUrl: demo2,
      leftPct: 66,
      topPct: 70,
    },
    { id: "hl-6", title: "阳台", imageUrl: demo3, leftPct: 30, topPct: 78 },
    // 大门前场
    { id: "hl-7", title: "大门前场", imageUrl: demo3, leftPct: 55, topPct: 95 },
  ];

  // 取消全景内的圆形图片热点

  const handlePointClick = async (label: string) => {
    const folderName = label;
    const panoLoader = folderToPano[folderName];
    const pngLoaders = folderToPngs[folderName];
    const videoLoaders = folderToVideos[folderName];

    if (panoLoader) {
      // 如果有全景图，先加载资源
      setIsTransitioning(true);
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
        // 加载视频（如果有）
        if (videoLoaders?.length) {
          const vids =
            loadedVideoUrls[folderName] ||
            (await Promise.all(videoLoaders.map((loader) => loader())));
          if (!loadedVideoUrls[folderName]) {
            setLoadedVideoUrls((prev) => ({ ...prev, [folderName]: vids }));
          }
        }

        // 设置全景图URL，触发加载
        setCurrentPanoUrl(url);
        setCurrentFolder(folderName);
        setViewMode("panorama");
        setIsTransitioning(false);
        setIsLoadingResource(false);
      } catch (error) {
        console.error("加载资源失败:", error);
        setIsTransitioning(false);
        setIsLoadingResource(false);
      }
    } else if (pngLoaders?.length) {
      // 如果只有 PNG 图片，先加载再弹出弹窗
      // 注意：不改变 currentFolder，避免影响全景图中的热点图片
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
        // 注意：不更新 currentFolder，避免影响全景图中的热点图片
        setIsLoadingResource(false);
      } catch (error) {
        console.error("加载 PNG 图片失败:", error);
        setIsLoadingResource(false);
      }
    }
  };

  const handleGoToMap = () => {
    // 显示加载进度并切换到地图视图
    setShowWelcomeScreen(false);
    setIsModelLoading(true);
    setModelLoadProgress(0);
    setShouldShowMap(true);
    setViewMode("map");
  };

  const handleGoTo360 = async () => {
    // 随机选择一个全景图并打开
    setShowWelcomeScreen(false);
    const availableFolders = Object.keys(folderToPano);
    if (availableFolders.length === 0) {
      console.error("没有可用的全景图");
      return;
    }

    // 随机选择一个文件夹
    const randomFolder =
      availableFolders[Math.floor(Math.random() * availableFolders.length)];
    const panoLoader = folderToPano[randomFolder];
    const pngLoaders = folderToPngs[randomFolder];
    const videoLoaders = folderToVideos[randomFolder];

    setIsTransitioning(true);
    setIsLoadingResource(true);

    try {
      const url = loadedPanoUrls[randomFolder] || (await panoLoader());
      if (!loadedPanoUrls[randomFolder]) {
        setLoadedPanoUrls((prev) => ({ ...prev, [randomFolder]: url }));
      }

      // 加载 PNG 图片（如果有）
      if (pngLoaders?.length) {
        const pngUrls = await Promise.all(pngLoaders.map((loader) => loader()));
        setLoadedPngUrls((prev) => ({ ...prev, [randomFolder]: pngUrls }));
      }
      // 加载视频（如果有）
      if (videoLoaders?.length) {
        const vids = await Promise.all(videoLoaders.map((loader) => loader()));
        setLoadedVideoUrls((prev) => ({ ...prev, [randomFolder]: vids }));
      }

      setCurrentPanoUrl(url);
      setCurrentFolder(randomFolder);
      setViewMode("panorama");
      setIsTransitioning(false);
      setIsLoadingResource(false);
    } catch (error) {
      console.error("加载全景图失败:", error);
      setIsTransitioning(false);
      setIsLoadingResource(false);
    }
  };

  const handleBackToHome = () => {
    // 返回首页（重新显示 WelcomeScreen）
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode("map");
      setShowWelcomeScreen(true);
      setIsTransitioning(false);
    }, 300);
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
      {showWelcomeScreen && (
        <WelcomeScreen onGoToMap={handleGoToMap} onGoTo360={handleGoTo360} />
      )}
      <ModelLoadingProgress
        progress={modelLoadProgress}
        isVisible={isModelLoading}
        title="模型加载中..."
      />
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
      {!showWelcomeScreen && viewMode === "map" && shouldShowMap ? (
        <Canvas camera={{ fov: 2, position: [-4, 86, -2.5] }}>
          <CameraLock />
          {/* <ClickablePointMarkers /> */}
          <Suspense fallback={null}>
            <MapModel
              onPointClick={handlePointClick}
              isTransitioning={isTransitioning}
              onLoadProgress={handleModelLoadProgress}
              onLoadComplete={handleModelLoadComplete}
            />
          </Suspense>
          {!isTransitioning && (
            <TopDownControls
              enableZoom={true}
              maxDistance={15}
              minFov={1}
              maxFov={8}
            />
          )}
        </Canvas>
      ) : !showWelcomeScreen && viewMode === "panorama" ? (
        <>
          <button
            onClick={handleBackToHome}
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              zIndex: 100,
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
          <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
            <Suspense fallback={null}>
              <PanoramaScene
                imageUrl={currentPanoUrl}
                imageHotspots={[]}
              />
            </Suspense>
            <OrbitControls enableZoom={false} />
          </Canvas>
          <NavPanel
            hotspots={hotspots}
            images={currentFolder ? loadedPngUrls[currentFolder] : undefined}
            videos={currentFolder ? loadedVideoUrls[currentFolder] : undefined}
            sampleTitle={currentFolder || undefined}
            onOpenLightbox={(imgs, title) => {
              setLightboxImages(imgs);
              setLightboxTitle(title);
            }}
            onSelect={async (id) => {
              const hs = hotspots.find((h) => h.id === id);
              if (!hs) return;
              const folderName = hs.title;
              const panoLoader = folderToPano[folderName];
              const pngLoaders = folderToPngs[folderName];
              const videoLoaders = folderToVideos[folderName];
              if (panoLoader) {
                try {
                  const url =
                    loadedPanoUrls[folderName] || (await panoLoader());
                  if (!loadedPanoUrls[folderName]) {
                    setLoadedPanoUrls((prev) => ({
                      ...prev,
                      [folderName]: url,
                    }));
                  }

                  // 加载 PNG 图片（如果有）
                  if (pngLoaders?.length) {
                    const pngUrls =
                      loadedPngUrls[folderName] ||
                      (await Promise.all(pngLoaders.map((loader) => loader())));
                    if (!loadedPngUrls[folderName]) {
                      setLoadedPngUrls((prev) => ({
                        ...prev,
                        [folderName]: pngUrls,
                      }));
                    }
                  }
                  // 加载视频（如果有）
                  if (videoLoaders?.length) {
                    const vids =
                      loadedVideoUrls[folderName] ||
                      (await Promise.all(videoLoaders.map((loader) => loader())));
                    if (!loadedVideoUrls[folderName]) {
                      setLoadedVideoUrls((prev) => ({
                        ...prev,
                        [folderName]: vids,
                      }));
                    }
                  }

                  setCurrentPanoUrl(url);
                  setCurrentFolder(folderName);
                } catch (error) {
                  console.error("加载全景图失败:", error);
                }
              } else if (pngLoaders?.length) {
                // 如果只有 PNG 图片，直接弹出弹窗，不改变 currentFolder
                // 避免影响全景图中的热点图片
                try {
                  const pngUrls =
                    loadedPngUrls[folderName] ||
                    (await Promise.all(pngLoaders.map((loader) => loader())));
                  if (!loadedPngUrls[folderName]) {
                    setLoadedPngUrls((prev) => ({
                      ...prev,
                      [folderName]: pngUrls,
                    }));
                  }
                  setLightboxImages(pngUrls);
                  setLightboxTitle(folderName);
                  // 注意：不更新 currentFolder，保持当前全景图的热点图片不变
                } catch (error) {
                  console.error("加载 PNG 图片失败:", error);
                }
              } else {
                // 无资源则不处理
              }
            }}
          />
        </>
      ) : null}
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

export default App;

import { useMemo, useState, Suspense, lazy, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavPanel from "../components/NavPanel";
import ImageLightbox from "../components/ImageLightbox";

// 懒加载大型组件，进行代码分割
const PanoramaScene = lazy(() => import("../components/PanoramaScene"));

// 修正公共资源路径：使用 Vite public 目录下的绝对路径
const panoAUrl = "/assets/yuejiangyuan.jpg";
const demo2 = "/assets/demo2.jpg";
const demo3 = "/assets/demo3.jpg";

export default function PanoramaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(
    undefined
  );

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

  const [currentPanoUrl, setCurrentPanoUrl] = useState<string>(panoAUrl);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loadedPanoUrls, setLoadedPanoUrls] = useState<Record<string, string>>(
    {}
  );
  const [loadedPngUrls, setLoadedPngUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [isLoadingResource, setIsLoadingResource] = useState(false);

  const hotspots = [
    { id: "hl-2", title: "楼栋渲染", imageUrl: demo3, leftPct: 58, topPct: 34 },
    { id: "hl-3", title: "户型图", imageUrl: demo2, leftPct: 72, topPct: 48 },
    {
      id: "hl-5",
      title: "单元入户门",
      imageUrl: demo2,
      leftPct: 66,
      topPct: 70,
    },
    { id: "hl-6", title: "阳台", imageUrl: demo3, leftPct: 30, topPct: 78 },
    { id: "hl-7", title: "大门前场", imageUrl: demo3, leftPct: 55, topPct: 95 },
  ];

  // 全景内图片热点（方位以弧度计，yaw=0 指向画面正前方，pitch=0 水平）
  // 从当前文件夹的 PNG 图片中随机选择一张作为热点图片
  const panoImageHotspots = useMemo(() => {
    if (!currentFolder || !loadedPngUrls[currentFolder]?.length) {
      return [];
    }
    const images = loadedPngUrls[currentFolder];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return [
      {
        id: "pano-photo-1",
        title: "查看图片",
        imageUrl: randomImage,
        yaw: 0,
        pitch: 0,
      },
    ];
  }, [currentFolder, loadedPngUrls]);

  // 根据URL参数加载对应的全景图
  useEffect(() => {
    const folderParam = searchParams.get("folder");
    if (folderParam) {
      loadPanorama(folderParam);
    } else {
      // 如果没有指定文件夹，随机选择一个
      loadRandomPanorama();
    }
  }, [searchParams]);

  const loadPanorama = async (folderName: string) => {
    const panoLoader = folderToPano[folderName];
    const pngLoaders = folderToPngs[folderName];

    if (panoLoader) {
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

        setCurrentPanoUrl(url);
        setCurrentFolder(folderName);
        setIsLoadingResource(false);
      } catch (error) {
        console.error("加载全景图失败:", error);
        setIsLoadingResource(false);
      }
    }
  };

  const loadRandomPanorama = async () => {
    const availableFolders = Object.keys(folderToPano);
    if (availableFolders.length === 0) {
      console.error("没有可用的全景图");
      return;
    }

    // 随机选择一个文件夹
    const randomFolder =
      availableFolders[Math.floor(Math.random() * availableFolders.length)];
    await loadPanorama(randomFolder);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleBackToMap = () => {
    navigate("/map");
  };

  const handleNavSelect = async (id: string) => {
    const hs = hotspots.find((h) => h.id === id);
    if (!hs) return;
    const folderName = hs.title;
    const panoLoader = folderToPano[folderName];
    const pngLoaders = folderToPngs[folderName];
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
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      {/* 导航按钮 */}
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
        <button
          onClick={handleBackToMap}
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
          返回地图
        </button>
      </div>

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

      {/* 全景图画布 */}
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <Suspense fallback={null}>
          <PanoramaScene
            imageUrl={currentPanoUrl}
            imageHotspots={panoImageHotspots}
            onHotspotClick={() => {
              if (currentFolder && loadedPngUrls[currentFolder]?.length) {
                setLightboxImages(loadedPngUrls[currentFolder]);
                setLightboxTitle(currentFolder);
              }
            }}
          />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* 导航面板 */}
      <NavPanel
        hotspots={hotspots}
        onSelect={handleNavSelect}
      />

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

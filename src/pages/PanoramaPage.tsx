import { useMemo, useState, Suspense, lazy, useEffect, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavPanel from "../components/NavPanel";
import ImageLightbox from "../components/ImageLightbox";
import { indexManifest, getFilenameStem } from "../utils/assetManifest";

// 懒加载大型组件，进行代码分割
const PanoramaScene = lazy(() => import("../components/PanoramaScene"));

// 默认占位图
const panoAUrl = "/assets/yuejiangyuan.jpg";

export default function PanoramaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(
    undefined
  );
  const [lightboxVideos, setLightboxVideos] = useState<string[] | null>(null);
  const [lightboxStartIndex, setLightboxStartIndex] = useState<number>(0);

  // 读取 manifest 索引
  const { byTitlePanos, byTitleImages, byTitleVideos, titles } = useMemo(() => indexManifest(), []);

  // 与地图页保持一致的坐标映射（仅为已配置坐标的 title 生成热点）
  const titleToPos = useMemo<Record<string, { leftPct: number; topPct: number; bgColor: string }>>(
    () => ({
      "归家车马院": { leftPct: 84, topPct: 38, bgColor: "#FFE452" },
      "售楼部视野": { leftPct: 78, topPct: 44.4, bgColor: "#90CFFF" },
      "叠水水景": { leftPct: 73, topPct: 50, bgColor: "#70CEAC" },
      "桥特写": { leftPct: 47, topPct: 54, bgColor: "#A777F4" },
      "下沉中庭": { leftPct: 35, topPct: 45, bgColor: "#FFA352" },
      "立面": { leftPct: 63, topPct: 92, bgColor: "#FFE452" },
      "廊桥": { leftPct: 58, topPct: 78, bgColor: "#FFA352" },
      "儿童娱乐区": { leftPct: 55, topPct: 85, bgColor: "#FFA352" },
      "单元入户门": { leftPct: 18, topPct: 90, bgColor: "#FFE452" },
      "户型图": { leftPct: 53, topPct: 36, bgColor: "#FFE452" },
      "天际阳台": { leftPct: 28, topPct: 31, bgColor: "#A777F4" },
    }),
    []
  );

  const [currentPanoUrl, setCurrentPanoUrl] = useState<string>(panoAUrl);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loadedPanoUrls, setLoadedPanoUrls] = useState<Record<string, string[]>>({});
  const [currentPanoIndex, setCurrentPanoIndex] = useState<number>(0);
  const [loadedPngUrls, setLoadedPngUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [loadedVideoUrls, setLoadedVideoUrls] = useState<Record<string, string[]>>(
    {}
  );
  const [isLoadingResource, setIsLoadingResource] = useState(false);
  const loadTokenRef = useRef(0);
  // 使用 ref 保存最新的缓存，避免回调依赖这些对象导致身份变化
  const loadedPanoUrlsRef = useRef(loadedPanoUrls);
  const loadedPngUrlsRef = useRef(loadedPngUrls);
  const loadedVideoUrlsRef = useRef(loadedVideoUrls);
  useEffect(() => { loadedPanoUrlsRef.current = loadedPanoUrls; }, [loadedPanoUrls]);
  useEffect(() => { loadedPngUrlsRef.current = loadedPngUrls; }, [loadedPngUrls]);
  useEffect(() => { loadedVideoUrlsRef.current = loadedVideoUrls; }, [loadedVideoUrls]);

  const hotspots = useMemo(() =>
    titles
      .filter((t) => !!titleToPos[t])
      .map((t) => ({
        id: t,
        title: t,
        imageUrl: "",
        leftPct: titleToPos[t].leftPct,
        topPct: titleToPos[t].topPct,
        bgColor: titleToPos[t].bgColor,
      })),
    [titles, titleToPos]
  );

  // 取消全景内的图片热点，改为在导航面板下展示图集/视频集

  

  const loadPanorama = useCallback(async (folderName: string) => {
    const token = ++loadTokenRef.current;
    const panos = byTitlePanos[folderName] || [];
    const imgs = byTitleImages[folderName] || [];
    const vids = byTitleVideos[folderName] || [];
    if (!panos.length && !imgs.length && !vids.length) return;
    setIsLoadingResource(true);
    try {
      if (token !== loadTokenRef.current) return;
      if (panos.length) {
        setLoadedPanoUrls((prev) => ({ ...prev, [folderName]: panos }));
        setCurrentPanoIndex(0);
        setCurrentPanoUrl(panos[0]);
      }
      if (imgs.length) setLoadedPngUrls((prev) => ({ ...prev, [folderName]: imgs }));
      if (vids.length) setLoadedVideoUrls((prev) => ({ ...prev, [folderName]: vids }));
      setCurrentFolder(folderName);
    } finally {
      setIsLoadingResource(false);
    }
  }, [byTitlePanos, byTitleImages, byTitleVideos]);

  const loadRandomPanorama = useCallback(async () => {
    const availableFolders = titles;
    if (availableFolders.length === 0) {
      console.error("没有可用的全景图");
      return;
    }

    // 随机选择一个文件夹
    const randomFolder =
      availableFolders[Math.floor(Math.random() * availableFolders.length)];
    await loadPanorama(randomFolder);
  }, [titles, loadPanorama]);

  // 根据URL参数加载对应的全景图
  useEffect(() => {
    const folderParam = searchParams.get("folder");
    if (folderParam) {
      loadPanorama(folderParam);
    } else {
      // 如果没有指定文件夹，随机选择一个
      loadRandomPanorama();
    }
  }, [searchParams, loadPanorama, loadRandomPanorama]);

  // const handleBackToHome = () => {
  //   navigate("/");
  // };

  const handleBackToMap = () => {
    navigate("/map");
  };

  const handleNavSelect = async (id: string) => {
    const hs = hotspots.find((h) => h.id === id);
    if (!hs) return;
    const folderName = hs.title;
    const panos = byTitlePanos[folderName] || [];
    const imgs = byTitleImages[folderName] || [];
    const vids = byTitleVideos[folderName] || [];
    if (panos.length) {
      setLoadedPanoUrls((prev) => ({ ...prev, [folderName]: panos }));
      setCurrentPanoIndex(0);
      setCurrentPanoUrl(panos[0]);
      setCurrentFolder(folderName);
      if (imgs.length) setLoadedPngUrls((prev) => ({ ...prev, [folderName]: imgs }));
      if (vids.length) setLoadedVideoUrls((prev) => ({ ...prev, [folderName]: vids }));
    } else if (imgs.length || vids.length) {
      setLightboxImages(imgs.length ? imgs : []);
      setLightboxVideos(vids.length ? vids : []);
      setLightboxTitle(folderName);
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
        {/* <button
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
        </button> */}
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
            imageHotspots={[]}
          />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* 多全景列表（左下角）：展示所有全景，当前高亮，可点击切换 */}
      {currentFolder && (loadedPanoUrls[currentFolder]?.length || 0) > 0 && (
        <div
          style={{
            position: "absolute",
            left: 20,
            bottom: 20,
            zIndex: 100,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            maxWidth: "40vw",
          }}
        >
          {(loadedPanoUrls[currentFolder] || []).map((url, idx) => {
            const isActive = idx === currentPanoIndex;
            return (
              <button
                key={url}
                onClick={() => {
                  setCurrentPanoIndex(idx);
                  setCurrentPanoUrl(url);
                }}
                style={{
                  padding: "8px 12px",
                  background: isActive
                    ? "rgba(124, 179, 66, 0.8)"
                    : "rgba(255, 255, 255, 0.2)",
                  border: isActive
                    ? "1px solid rgba(124, 179, 66, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: 8,
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  backdropFilter: "blur(10px)",
                  whiteSpace: "nowrap",
                }}
                title={getFilenameStem(url)}
              >
                {getFilenameStem(url)}
              </button>
            );
          })}
        </div>
      )}

      {/* 导航面板 */}
      <NavPanel
        hotspots={hotspots}
        images={currentFolder ? loadedPngUrls[currentFolder] : undefined}
        videos={currentFolder ? loadedVideoUrls[currentFolder] : undefined}
        sampleTitle={currentFolder || undefined}
        onOpenLightbox={(imgs, title, startIndex) => {
          setLightboxImages(imgs);
          setLightboxTitle(title);
          setLightboxStartIndex(startIndex ?? 0);
        }}
        onSelect={handleNavSelect}
      />

      {/* 图片弹窗 */}
      {(lightboxImages || lightboxVideos) && (
        <ImageLightbox
          images={lightboxImages || undefined}
          videos={lightboxVideos || undefined}
          title={lightboxTitle}
          initialIndex={lightboxStartIndex}
          onClose={() => {
            setLightboxImages(null);
            setLightboxVideos(null);
            setLightboxTitle(undefined);
            setLightboxStartIndex(0);
          }}
        />
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import PanoramaScene from "./components/PanoramaScene";
import MapModel from "./components/MapModel";
import TopDownControls from "./components/TopDownControls";
import CameraLock from "./components/CameraLock";
import NavPanel from "./components/NavPanel";
import ImageLightbox from "./components/ImageLightbox";
import WelcomeScreen from "./components/WelcomeScreen";
// import ClickablePointMarkers from "./components/ClickablePointMarkers";

// 修正公共资源路径：使用 Vite public 目录下的绝对路径
const panoAUrl = "/assets/yuejiangyuan.jpg";
const demo1 = "/assets/demo1.jpg";
const demo2 = "/assets/demo2.jpg";
const demo3 = "/assets/demo3.jpg";

function App() {
  const [viewMode, setViewMode] = useState<'map' | 'panorama'>('map')
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null)
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>(undefined)

  // 索引 assets 目录下的 panoramic.jpg 以及同级 png 图片
  const { folderToPano, folderToPngs } = useMemo(() => {
    const panoEntries = import.meta.glob('./assets/*/panoramic.jpg', { as: 'url', eager: true }) as Record<string, string>
    const pngEntries = import.meta.glob('./assets/*/*.png', { as: 'url', eager: true }) as Record<string, string>

    const folderToPanoLocal: Record<string, string> = {}
    Object.entries(panoEntries).forEach(([path, url]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/panoramic\.jpg$/)
      if (match) {
        const folder = match[1]
        folderToPanoLocal[folder] = url
      }
    })

    const folderToPngsLocal: Record<string, string[]> = {}
    Object.entries(pngEntries).forEach(([path, url]) => {
      const match = path.match(/\.\/assets\/([^/]+)\/[^/]+\.png$/)
      if (match) {
        const folder = match[1]
        if (!folderToPngsLocal[folder]) folderToPngsLocal[folder] = []
        folderToPngsLocal[folder].push(url)
      }
    })

    // 保持 png 顺序稳定（按路径字典序）
    Object.keys(folderToPngsLocal).forEach((k) => folderToPngsLocal[k].sort())

    return { folderToPano: folderToPanoLocal, folderToPngs: folderToPngsLocal }
  }, [])

  const [currentPanoUrl, setCurrentPanoUrl] = useState<string>(panoAUrl)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)

  const hotspots = [
    // { id: 'hl-1', title: '廊桥', imageUrl: demo1, leftPct: 22, topPct: 28 },
    { id: 'hl-2', title: '楼栋渲染', imageUrl: demo3, leftPct: 58, topPct: 34 },
    { id: 'hl-3', title: '户型图', imageUrl: demo2, leftPct: 72, topPct: 48 },
    // { id: 'hl-4', title: '叠水', imageUrl: demo1, leftPct: 40, topPct: 62 },
    { id: 'hl-5', title: '单元入户门', imageUrl: demo2, leftPct: 66, topPct: 70 },
    { id: 'hl-6', title: '阳台', imageUrl: demo3, leftPct: 30, topPct: 78 }
  ]

  // 全景内图片热点（方位以弧度计，yaw=0 指向画面正前方，pitch=0 水平）
  // 仅展示一个圆形热点
  const panoImageHotspots = [
    { id: 'pano-photo-1', title: '查看图片', imageUrl: demo1, yaw: 0, pitch: 0 },
  ]

  const handlePointClick = () => {
    setIsTransitioning(true);

    // 延迟更长时间以展示相机拉近动画
    setTimeout(() => {
      setViewMode("panorama");
      setIsTransitioning(false);
    }, 1500);
  };

  const handleBackToMap = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode("map");
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      <WelcomeScreen />
      {viewMode === "map" ? (
        <Canvas camera={{ fov: 2, position: [-4, 86, -2.5] }}>
          <CameraLock />
          {/* <ClickablePointMarkers /> */}
          <MapModel
            onPointClick={handlePointClick}
            isTransitioning={isTransitioning}
          />
          {!isTransitioning && (
            <TopDownControls
              enableZoom={true}
              maxDistance={15}
              minFov={1}
              maxFov={8}
            />
          )}
        </Canvas>
      ) : (
        <>
          <button
            onClick={handleBackToMap}
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
            返回地图
          </button>
          <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
            <PanoramaScene
              imageUrl={currentPanoUrl}
              imageHotspots={panoImageHotspots}
              onHotspotClick={() => {
                if (currentFolder && folderToPngs[currentFolder]?.length) {
                  setLightboxImages(folderToPngs[currentFolder])
                  setLightboxTitle(currentFolder)
                }
              }}
            />
            <OrbitControls enableZoom={false} />
          </Canvas>
          <NavPanel
            hotspots={hotspots}
            onSelect={(id) => {
              const hs = hotspots.find(h => h.id === id)
              if (!hs) return
              const folderName = hs.title
              const panoUrl = folderToPano[folderName]
              const pngs = folderToPngs[folderName]
              if (panoUrl) {
                setCurrentPanoUrl(panoUrl)
                setCurrentFolder(folderName)
              } else if (pngs?.length) {
                setLightboxImages(pngs)
                setLightboxTitle(folderName)
                setCurrentFolder(folderName)
              } else {
                // 无资源则不处理
              }
            }}
          />
          {lightboxImages && (
            <ImageLightbox
              images={lightboxImages}
              title={lightboxTitle}
              onClose={() => { setLightboxImages(null); setLightboxTitle(undefined) }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;

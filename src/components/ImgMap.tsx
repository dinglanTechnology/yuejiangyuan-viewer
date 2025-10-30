/**
 * @name 静态图片鸟瞰图组件
 */

interface Hotspot {
  id: string;
  title: string;
  imageUrl: string;
  leftPct: number;
  topPct: number;
}

interface ImgMapProps {
  hotspots?: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}

export default function ImgMap({ hotspots = [], onHotspotClick }: ImgMapProps) {
  const handleHotspotClick = (hotspot: Hotspot) => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundImage: `url('/assets/map-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* 热点标记 */}
      {hotspots.map((hotspot) => (
        <div
          key={hotspot.id}
          onClick={() => handleHotspotClick(hotspot)}
          style={{
            position: "absolute",
            left: `${hotspot.leftPct}%`,
            top: `${hotspot.topPct}%`,
            transform: "translate(-50%, -50%)",
            width: "24px",
            height: "24px",
            backgroundColor: "#FF6B35", // 醒目的橙红色
            border: "3px solid #FFFFFF", // 白色边框增强对比
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#FFFFFF",
            zIndex: 10,
            transition: "all 0.3s ease",
            boxShadow:
              "0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3)", // 双重阴影效果
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FF8C42"; // 悬停时更亮的橙色
            e.currentTarget.style.transform =
              "translate(-50%, -50%) scale(1.3)"; // 更大的缩放效果
            e.currentTarget.style.boxShadow =
              "0 6px 16px rgba(255, 107, 53, 0.8), 0 0 0 3px rgba(255, 255, 255, 0.5)"; // 增强阴影
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FF6B35"; // 回到原始橙红色
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3)";
          }}
        >
          •
        </div>
      ))}
    </div>
  );
}

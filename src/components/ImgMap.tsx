/**
 * @name 静态图片鸟瞰图组件
 */

import { useState, useEffect, useRef } from "react";
import {
  calculateImageDisplayInfo,
  convertPercentToPixels,
} from "../utils/positionUtils";
import type { ImageDisplayInfo } from "../utils/positionUtils";

interface Hotspot {
  id: string;
  title: string;
  leftPct: number;
  topPct: number;
}

interface ImgMapProps {
  hotspots?: Hotspot[];
  onHotspotClick?: (hotspot: Hotspot) => void;
}

export default function ImgMap({ hotspots = [], onHotspotClick }: ImgMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageDisplayInfo, setImageDisplayInfo] =
    useState<ImageDisplayInfo | null>(null);

  // 图片原始尺寸（需要根据实际图片调整）
  const IMAGE_ORIGINAL_WIDTH = 1920; // 根据实际图片尺寸调整
  const IMAGE_ORIGINAL_HEIGHT = 1080; // 根据实际图片尺寸调整

  // 监听容器尺寸变化
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
        setImageSize({
          width: IMAGE_ORIGINAL_WIDTH,
          height: IMAGE_ORIGINAL_HEIGHT,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 计算图片显示信息
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      const displayInfo = calculateImageDisplayInfo(
        containerSize.width,
        containerSize.height,
        imageSize.width,
        imageSize.height
      );
      setImageDisplayInfo(displayInfo);
    }
  }, [containerSize, imageSize]);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (onHotspotClick) {
      onHotspotClick(hotspot);
    }
  };

  // 计算热点的实际位置
  const getHotspotPosition = (hotspot: Hotspot) => {
    if (!imageDisplayInfo) {
      return { left: `${hotspot.leftPct}%`, top: `${hotspot.topPct}%` };
    }

    const pixelPos = convertPercentToPixels(
      hotspot.leftPct,
      hotspot.topPct,
      imageDisplayInfo
    );

    return {
      left: `${pixelPos.x}px`,
      top: `${pixelPos.y}px`,
    };
  };

  return (
    <div
      ref={containerRef}
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
      {hotspots.map((hotspot) => {
        const position = getHotspotPosition(hotspot);
        return (
          <div
            key={hotspot.id}
            onClick={() => handleHotspotClick(hotspot)}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
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
              e.currentTarget.style.transform =
                "translate(-50%, -50%) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(255, 107, 53, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3)";
            }}
          >
            •
          </div>
        );
      })}
    </div>
  );
}

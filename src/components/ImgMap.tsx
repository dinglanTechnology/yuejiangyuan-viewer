/**
 * @name 静态图片鸟瞰图组件
 */

import { useState, useEffect, useRef } from "react";
import {
  calculateImageDisplayInfo,
  convertPercentToPixels,
} from "../utils/positionUtils";
import type { ImageDisplayInfo } from "../utils/positionUtils";

type LabelPosition =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

interface Hotspot {
  id: string;
  title: string;
  leftPct: number;
  topPct: number;
  labelPosition?: LabelPosition;
  bgColor?: string;
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

  // 计算标签位置
  const getLabelPosition = (hotspot: Hotspot) => {
    const position = hotspot.labelPosition || "bottom";
    const labelOffset = 46; // 标签框距离标记点的距离

    switch (position) {
      case "top":
        return {
          top: `-${labelOffset}px`,
          left: "6px",
          transform: "translateX(-50%)",
          flexDirection: "row" as const,
        };
      case "top-left":
        return {
          top: `-${labelOffset}px`,
          left: "6px",
          transform: "translateX(-100%)",
          flexDirection: "row" as const,
        };
      case "top-right":
        return {
          top: `-${labelOffset}px`,
          left: "6px",
          transform: "translateX(0%)",
          flexDirection: "row" as const,
        };
      case "bottom":
        return {
          top: `${labelOffset}px`,
          left: "6px",
          transform: "translateX(-50%)",
          flexDirection: "row" as const,
        };
      case "bottom-left":
        return {
          top: `${labelOffset}px`,
          left: "6px",
          transform: "translateX(-100%)",
          flexDirection: "row" as const,
        };
      case "bottom-right":
        return {
          top: `${labelOffset}px`,
          left: "6px",
          transform: "translateX(0%)",
          flexDirection: "row" as const,
        };
      case "left":
        return {
          top: "6px",
          left: `-${labelOffset + 150}px`,
          transform: "translateY(-50%)",
          flexDirection: "row" as const,
        };
      case "right":
        return {
          top: "6px",
          left: `${labelOffset}px`,
          transform: "translateY(-50%)",
          flexDirection: "row" as const,
        };
      default:
        return {
          top: `${labelOffset}px`,
          left: "6px",
          transform: "translateX(-50%)",
          flexDirection: "row" as const,
        };
    }
  };

  // 计算连接线样式
  const getConnectionLineStyle = (hotspot: Hotspot) => {
    const position = hotspot.labelPosition || "bottom";
    const labelHeight = 40;

    switch (position) {
      case "top":
      case "top-left":
      case "top-right":
        return {
          top: "-34px",
          left: "6px",
          width: "2px",
          height: `${labelHeight}px`,
          backgroundColor: "#FFFFFF",
          transform: "translateX(-50%)",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
        };
      case "bottom":
      case "bottom-left":
      case "bottom-right":
        return {
          top: "6px",
          left: "6px",
          width: "2px",
          height: `${labelHeight}px`,
          backgroundColor: "#FFFFFF",
          transform: "translateX(-50%)",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
        };
      case "left":
        return {
          top: "6px",
          left: "-54px",
          width: `${labelHeight + 20}px`,
          height: "2px",
          backgroundColor: "#FFFFFF",
          transform: "translateY(-50%)",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
        };
      case "right":
        return {
          top: "6px",
          left: "6px",
          width: `${labelHeight}px`,
          height: "2px",
          backgroundColor: "#FFFFFF",
          transform: "translateY(-50%)",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
        };
      default:
        return {
          top: "6px",
          left: "6px",
          width: "2px",
          height: `${labelHeight}px`,
          backgroundColor: "#FFFFFF",
          transform: "translateX(-50%)",
          boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
        };
    }
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
        const labelPosition = getLabelPosition(hotspot);
        const connectionLineStyle = getConnectionLineStyle(hotspot);

        return (
          <div
            key={hotspot.id}
            onClick={() => handleHotspotClick(hotspot)}
            style={{
              position: "absolute",
              left: position.left,
              top: position.top,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            {/* 白色圆圈标记点 */}
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "50%",
                border: "2px solid rgba(255, 255, 255, 0.8)",
                boxShadow: `
                  0 0 0 2px rgba(255, 255, 255, 0.3),
                  0 0 10px rgba(255, 255, 255, 0.6),
                  0 0 20px rgba(255, 255, 255, 0.4),
                  0 0 30px rgba(255, 255, 255, 0.2),
                  0 2px 8px rgba(0, 0, 0, 0.2)
                `,
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `
                  0 0 0 3px rgba(255, 255, 255, 0.5),
                  0 0 15px rgba(255, 255, 255, 0.8),
                  0 0 25px rgba(255, 255, 255, 0.6),
                  0 0 40px rgba(255, 255, 255, 0.4),
                  0 0 50px rgba(255, 255, 255, 0.2),
                  0 4px 12px rgba(0, 0, 0, 0.3)
                `;
                e.currentTarget.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `
                  0 0 0 2px rgba(255, 255, 255, 0.3),
                  0 0 10px rgba(255, 255, 255, 0.6),
                  0 0 20px rgba(255, 255, 255, 0.4),
                  0 0 30px rgba(255, 255, 255, 0.2),
                  0 2px 8px rgba(0, 0, 0, 0.2)
                `;
                e.currentTarget.style.transform = "scale(1)";
              }}
            />

            {/* 连接线 */}
            <div
              style={{
                position: "absolute",
                ...connectionLineStyle,
              }}
            />

            {/* 标签框 */}
            <div
              style={{
                position: "absolute",
                ...labelPosition,
                background: "rgba(79,79,79,0.62)",
                border: "1px solid #fff",
                borderRadius: "23px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "120px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 2px 3px 1px rgba(0, 0, 0, 0.16)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(80, 80, 80, 0.9)";
                e.currentTarget.style.transform = `${labelPosition.transform} scale(1.05)`;
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(60, 60, 60, 0.85)";
                e.currentTarget.style.transform = labelPosition.transform;
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.3)";
              }}
            >
              {/* 标题文字 */}
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                {hotspot.title}
              </span>

              {/* 图标 */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: hotspot.bgColor || "#4A90E2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/icon.svg"
                  alt="icon"
                  style={{
                    width: "12px",
                    height: "12px",
                    filter: "brightness(0) invert(1)", // 将图标变为白色
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

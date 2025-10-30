/**
 * @name 用于静态图片鸟瞰图的点击位置标记，需要返回点击位置的坐标即针对视窗的xy坐标
 */

import { useState, useEffect, useRef } from "react";

interface ClickPositionMarkerProps {
  onPositionClick?: (x: number, y: number) => void;
  isEnabled?: boolean;
  markerColor?: string;
  markerSize?: number;
}

export default function ClickPositionMarker({
  onPositionClick,
  isEnabled = true,
  markerColor = "#FF6B35",
  markerSize = 20,
}: ClickPositionMarkerProps) {
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 计算相对于容器的坐标
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算相对于视窗的百分比坐标
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // 在控制台打印坐标信息
    console.log("🎯 ClickPositionMarker 坐标信息:");
    console.log(`📍 像素坐标: X=${x.toFixed(1)}px, Y=${y.toFixed(1)}px`);
    console.log(
      `📊 百分比坐标: X=${xPercent.toFixed(2)}%, Y=${yPercent.toFixed(2)}%`
    );
    console.log(xPercent.toFixed(2));
    console.log(yPercent.toFixed(2));
    console.log(
      `📐 容器尺寸: ${rect.width.toFixed(1)}px × ${rect.height.toFixed(1)}px`
    );
    console.log("─".repeat(50));

    setClickPosition({ x: xPercent, y: yPercent });
    setIsVisible(true);

    // 调用回调函数，传递百分比坐标
    if (onPositionClick) {
      onPositionClick(xPercent, yPercent);
    }

    // 3秒后隐藏标记
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsVisible(false);
      setClickPosition(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: isEnabled ? "crosshair" : "default",
        userSelect: "none",
      }}
      tabIndex={0}
    >
      {/* 点击位置标记 */}
      {isVisible && clickPosition && (
        <div
          style={{
            position: "absolute",
            left: `${clickPosition.x}%`,
            top: `${clickPosition.y}%`,
            transform: "translate(-50%, -50%)",
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            backgroundColor: markerColor,
            border: "3px solid #FFFFFF",
            borderRadius: "50%",
            zIndex: 1000,
            pointerEvents: "none",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.3)",
            animation: "pulse 0.6s ease-out",
          }}
        >
          {/* 内部圆点 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "6px",
              height: "6px",
              backgroundColor: "#FFFFFF",
              borderRadius: "50%",
            }}
          />
        </div>
      )}

      {/* 坐标显示 */}
      {isVisible && clickPosition && (
        <div
          style={{
            position: "absolute",
            left: `${clickPosition.x}%`,
            top: `${clickPosition.y}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: 1001,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
          }}
        >
          X: {clickPosition.x.toFixed(1)}%, Y: {clickPosition.y.toFixed(1)}%
        </div>
      )}

      {/* 使用说明提示 */}
      {isEnabled && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 999,
            pointerEvents: "none",
            backdropFilter: "blur(4px)",
          }}
        >
          点击图片获取坐标位置
        </div>
      )}

      {/* 添加脉冲动画样式 */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 0;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

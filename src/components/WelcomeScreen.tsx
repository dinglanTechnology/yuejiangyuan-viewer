import { useState, useEffect } from "react";
import { preloadModel } from "../utils/modelPreloader";
// 使用 Vite public 目录的绝对路径
const welcomeImg = "/assets/welcome.jpg";

interface WelcomeScreenProps {
  onGoToMap?: () => void;
  onGoTo360?: () => void;
}

export default function WelcomeScreen({
  onGoToMap,
  onGoTo360,
}: WelcomeScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);

  // 延迟加载图片，避免阻塞初始渲染
  useEffect(() => {
    if (isVisible) {
      // 使用 requestIdleCallback 在浏览器空闲时加载图片
      const timer = setTimeout(() => {
        setShouldLoadImage(true);
      }, 100);

      // 在欢迎页显示时开始预加载模型（后台加载，不阻塞 UI）
      // 使用 requestIdleCallback 或延迟执行，避免影响欢迎页加载
      const preloadTimer = setTimeout(() => {
        preloadModel().catch((error) => {
          // 静默失败，不影响用户体验
          console.error("模型预加载失败:", error);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(preloadTimer);
      };
    }
  }, [isVisible]);

  const handleClick = () => {
    setIsVisible(false);
    onGoToMap?.();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleGoToMap = () => {
    setIsVisible(false);
    onGoToMap?.();
  };

  const handleGoTo360 = () => {
    setIsVisible(false);
    onGoTo360?.();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 1s ease-in-out",
        pointerEvents: isVisible ? "auto" : "none", // 当不可见时，不阻止事件传递
      }}
      onClick={handleClick}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {shouldLoadImage && (
          <img
            src={welcomeImg}
            alt="Welcome"
            loading="eager"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isLoaded ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
            }}
            onLoad={handleImageLoad}
          />
        )}

        {/* 按钮容器 */}
        {isLoaded && shouldLoadImage && (
          <div
            style={{
              position: "absolute",
              bottom: "25%",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "20px",
              zIndex: 10000,
            }}
          >
            {/* GO TO MAP 按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoToMap();
              }}
              style={{
                padding: "12px 32px",
                backgroundColor: "#7CB342",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#689F38";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#7CB342";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.3)";
              }}
            >
              GO TO MAP
            </button>
            {/* GO TO 360 按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoTo360();
              }}
              style={{
                padding: "12px 32px",
                backgroundColor: "#42A5F5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1E88E5";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(0, 0, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#42A5F5";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 0, 0, 0.3)";
              }}
            >
              GO TO 360
            </button>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            letterSpacing: "1px",
            zIndex: 10000,
          }}
        >
          GO TO MAP建议在电脑端打开
        </div>
      </div>
    </div>
  );
}

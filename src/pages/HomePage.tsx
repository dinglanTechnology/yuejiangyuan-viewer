import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { preloadModel } from "../utils/modelPreloader";

// 使用 Vite public 目录的绝对路径
const welcomeImg = "/assets/welcome.jpg";

export default function HomePage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleGoToMap = () => {
    setIsVisible(false);
    navigate("/map");
  };

  const handleGoTo360 = () => {
    setIsVisible(false);
    navigate("/panorama");
  };

  return (
    <>
      {/* 添加响应式CSS样式 */}
      <style>
        {`
          @media (max-width: 768px) {
            .welcome-screen-button {
              font-size: 14px !important;
              padding: 10px 20px !important;
              min-width: 120px !important;
              min-height: 44px !important;
            }
          }
          @media (max-width: 480px) {
            .welcome-screen-button {
              font-size: 13px !important;
              padding: 8px 16px !important;
              min-width: 100px !important;
              min-height: 40px !important;
            }
          }
          @media (orientation: landscape) and (max-height: 600px) {
            .welcome-screen-button-container {
              bottom: 15% !important;
            }
          }
        `}
      </style>
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
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // 确保容器能够正确处理不同屏幕比例
            minHeight: "100vh",
            minWidth: "100vw",
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
                objectFit: "cover", // 恢复cover属性，确保图片完全覆盖屏幕
                objectPosition: "center",
                opacity: isLoaded ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
                // 确保图片在不同设备上都能正确显示
                minWidth: "100%",
                minHeight: "100%",
              }}
              onLoad={handleImageLoad}
            />
          )}

          {/* 按钮容器 */}
          {isLoaded && shouldLoadImage && (
            <div
              className="welcome-screen-button-container"
              style={{
                position: "absolute",
                bottom: windowSize.width <= 768 ? "20%" : "25%",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap:
                  windowSize.width <= 480
                    ? "10px"
                    : windowSize.width <= 768
                    ? "15px"
                    : "20px",
                zIndex: 10000,
                // 响应式设计
                width: "auto",
                maxWidth: "90vw",
                padding:
                  windowSize.width <= 480
                    ? "0 10px"
                    : windowSize.width <= 768
                    ? "0 15px"
                    : "0 20px",
              }}
            >
              {/* GO TO MAP 按钮 */}
              <button
                className="welcome-screen-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToMap();
                }}
                style={{
                  padding: windowSize.width <= 768 ? "10px 24px" : "12px 32px",
                  backgroundColor: "#7CB342", // 绿色，与地图主题呼应
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: windowSize.width <= 480 ? "14px" : "16px",
                  fontWeight: "700",
                  letterSpacing: "1.2px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(124, 179, 66, 0.3)",
                  minWidth: windowSize.width <= 480 ? "120px" : "140px",
                  minHeight: windowSize.width <= 480 ? "44px" : "48px",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  background: "linear-gradient(135deg, #7CB342 0%, #689F38 100%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #689F38 0%, #558B2F 100%)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(124, 179, 66, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #7CB342 0%, #689F38 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(124, 179, 66, 0.3)";
                }}
              >
                GO TO MAP
              </button>

              {/* GO TO 360 按钮 */}
              <button
                className="welcome-screen-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoTo360();
                }}
                style={{
                  padding: windowSize.width <= 768 ? "10px 24px" : "12px 32px",
                  backgroundColor: "#D4AF37", // 优雅的金色调，与中心圆形图标呼应
                  color: "#fff", // 深色文字，在金色背景上更清晰
                  border: "none",
                  borderRadius: "6px", // 稍微增加圆角，更现代
                  fontSize: windowSize.width <= 480 ? "14px" : "16px",
                  fontWeight: "700", // 增加字重，更突出
                  letterSpacing: "1.2px", // 增加字间距
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 16px rgba(212, 175, 55, 0.3)", // 金色阴影
                  // 响应式按钮尺寸
                  minWidth: windowSize.width <= 480 ? "120px" : "140px",
                  minHeight: windowSize.width <= 480 ? "44px" : "48px",
                  // 触摸设备优化
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  // 添加渐变效果
                  background:
                    "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #B8860B 0%, #8B6914 100%)"; // 更深的金色渐变
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(212, 175, 55, 0.4)"; // 增强的金色阴影
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)"; // 回到原始金色渐变
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(212, 175, 55, 0.3)"; // 回到原始阴影
                }}
              >
                GO TO 360
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

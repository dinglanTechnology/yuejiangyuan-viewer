import { useState, useEffect } from "react";
import { preloadModel } from "../utils/modelPreloader";
// 使用 Vite public 目录的绝对路径
const welcomeImg = "/assets/home-bg.jpg";

interface WelcomeScreenProps {
  onGoToMap?: () => void; // 注释掉 GO TO MAP 功能
  onGoTo360?: () => void;
}

export default function WelcomeScreen({
  // onGoToMap, // 注释掉 GO TO MAP 功能
  onGoTo360,
}: WelcomeScreenProps) {
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

  // const handleClick = () => {
  //   setIsVisible(false);
  //   onGoToMap?.();
  // }; // 注释掉主容器的点击事件

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // const handleGoToMap = () => {
  //   setIsVisible(false);
  //   onGoToMap?.();
  // }; // 注释掉 GO TO MAP 处理函数

  const handleGoTo360 = () => {
    setIsVisible(false);
    onGoTo360?.();
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
      <img
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "center",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
          zIndex: 9999,
        }}
        src="/assets/logo.png"
        alt="logo"
      />
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
        // onClick={handleClick} // 注释掉主容器的点击事件
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
                // objectFit: "cover",
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
              {/* GO TO MAP 按钮 - 已注释 */}
              {/* <button
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
            </button> */}
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

          {/* 底部提示文字 - 已注释 */}
          {/* <div
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
        </div> */}
        </div>
      </div>
    </>
  );
}

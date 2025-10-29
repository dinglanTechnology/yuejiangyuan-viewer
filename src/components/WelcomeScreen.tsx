import { useState } from "react";
// 使用 Vite public 目录的绝对路径
const welcomeImg = "/assets/welcome.jpg";

export default function WelcomeScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = () => {
    setIsVisible(false);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleGoToMap = () => {
    setIsVisible(false);
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
        <img
          src={welcomeImg}
          alt="Welcome"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
          onLoad={handleImageLoad}
        />

        {/* GO TO MAP 按钮 */}
        {isLoaded && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // 阻止事件冒泡到父级div
              handleGoToMap();
            }}
            style={{
              position: "absolute",
              bottom: "25%",
              left: "50%",
              transform: "translateX(-50%)",
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
              zIndex: 10000,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#689F38";
              e.currentTarget.style.transform =
                "translateX(-50%) translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#7CB342";
              e.currentTarget.style.transform =
                "translateX(-50%) translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
          >
            GO TO MAP
          </button>
        )}
      </div>
    </div>
  );
}

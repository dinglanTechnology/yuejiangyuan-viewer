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
      </div>
    </div>
  );
}

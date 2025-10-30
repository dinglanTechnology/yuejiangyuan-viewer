import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleGoToMap = () => {
    navigate("/map");
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <img
        style={{
          position: "fixed",
          top: 60,
          left: 60,
          width: "150px",
          objectFit: "cover",
          objectPosition: "center",
          transition: "opacity 0.5s ease-in-out",
          zIndex: 9999,
        }}
        src="/assets/logo.png"
        alt="logo"
      />
      <img
        src="/assets/home-bg.jpg"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        alt="welcome"
      />
      <div
        className="welcome-screen-button-container"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          width: "auto",
          maxWidth: "90vw",
          padding: "0 20px",
        }}
      >
        <button
          className="welcome-screen-button"
          onClick={handleGoToMap}
          style={{
            padding: "12px 32px",
            backgroundColor: "#7CB342",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 6px 20px rgba(124, 179, 66, 0.4)",
            minWidth: "160px",
            minHeight: "50px",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            background: "linear-gradient(135deg, #7CB342 0%, #689F38 100%)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #689F38 0%, #558B2F 100%)";
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(124, 179, 66, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #7CB342 0%, #689F38 100%)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(124, 179, 66, 0.4)";
          }}
        >
          GO TO MAP
        </button>
      </div>
    </div>
  );
}

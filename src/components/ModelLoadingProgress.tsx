interface ModelLoadingProgressProps {
  progress: number; // 0-100
  isVisible: boolean;
  title?: string; // 自定义标题
}

export default function ModelLoadingProgress({
  progress,
  isVisible,
  title = "模型加载中...",
}: ModelLoadingProgressProps) {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
        }}
      >
        {/* 标题 */}
        <div
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: "600",
            letterSpacing: "1px",
          }}
        >
          {title}
        </div>

        {/* 进度条容器 */}
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* 进度条 */}
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #7CB342 0%, #689F38 100%)",
              borderRadius: "4px",
              transition: "width 0.3s ease-out",
              boxShadow: "0 0 10px rgba(124, 179, 66, 0.5)",
            }}
          />
        </div>

        {/* 进度百分比 */}
        <div
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          {Math.round(progress)}%
        </div>

        {/* 加载动画 */}
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderTop: "3px solid #7CB342",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

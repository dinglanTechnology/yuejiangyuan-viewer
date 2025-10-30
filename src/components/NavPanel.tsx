// 使用 Vite public 目录的绝对路径
const navImgUrl = "/assets/nav.png";

interface Hotspot {
  id: string;
  title: string;
  imageUrl: string;
  leftPct: number;
  topPct: number;
}

interface NavPanelProps {
	hotspots: Hotspot[];
	currentId?: string;
	onSelect: (id: string) => void;
	images?: string[]; // 当前场景图集
	videos?: string[]; // 当前场景视频集
	sampleTitle?: string; // 样板间标题
	onOpenLightbox?: (images: string[], title?: string, startIndex?: number) => void; // 打开外部图片预览
}

import { useState } from "react";

export default function NavPanel({
  hotspots,
  currentId,
  onSelect,
  images,
  videos,
  sampleTitle,
  onOpenLightbox,
}: NavPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const hasImages = (images?.length || 0) > 0;
  const hasVideos = (videos?.length || 0) > 0;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="展开面板"
        style={{
          position: "absolute",
          top: "50%",
          right: 16,
          transform: "translateY(-50%)",
          zIndex: 200,
          width: 20,
          height: 120,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "rgba(20,20,20,0.55)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#fff",
          cursor: "pointer",
          padding: 0,
          textAlign: "center",
        }}
      >
        ≡
      </button>
    );
  }

  return (
    <div
      className="navpanel-root"
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        bottom: 20,
        width: 360,
        zIndex: 200,
        borderRadius: 16,
        overflow: "hidden",
        background: "rgba(20,20,20,0.5)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(12px) saturate(120%)",
        WebkitBackdropFilter: "blur(12px) saturate(120%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 自定义滚动条样式（WebKit + Firefox） */}
      <style>
        {`
				.navpanel-root .navpanel-scroll {
					scrollbar-width: thin; /* Firefox */
					scrollbar-color: rgba(110,231,183,0.7) rgba(255,255,255,0.08); /* Firefox */
				}

				.navpanel-root .navpanel-scroll::-webkit-scrollbar {
					width: 10px;
				}
				.navpanel-root .navpanel-scroll::-webkit-scrollbar-track {
					background: rgba(255,255,255,0.08);
					border-left: 1px solid rgba(255,255,255,0.06);
				}
				.navpanel-root .navpanel-scroll::-webkit-scrollbar-thumb {
					background: linear-gradient(180deg, rgba(110,231,183,0.9), rgba(110,231,183,0.55));
					border: 2px solid rgba(255,255,255,0.08);
					border-radius: 12px;
					box-shadow: 0 0 10px rgba(110,231,183,0.35);
				}
				.navpanel-root .navpanel-scroll::-webkit-scrollbar-thumb:hover {
					background: linear-gradient(180deg, rgba(110,231,183,1), rgba(110,231,183,0.7));
				}
				`}
      </style>
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* <div
					style={{
						width: 10,
						height: 10,
						borderRadius: 999,
						background: "#6ee7b7",
						boxShadow: "0 0 8px #6ee7b7",
					}}
				/> */}
        {/* <div style={{ color: "#fff", fontSize: 14, opacity: 0.9 }}>功能面板</div> */}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setCollapsed(true)}
          title="收起"
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          ⇤
        </button>
      </div>

      <div
        className="navpanel-scroll"
        style={{
          position: "relative",
          flex: 1,
          overflow: "auto",
          paddingBottom: 10,
        }}
      >
        {/* 导航 */}
        <div style={{ padding: "10px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 2,
                background:
                  "linear-gradient(180deg, rgba(110,231,183,0.95), rgba(110,231,183,0.35))",
                boxShadow: "0 0 10px rgba(110,231,183,0.5)",
              }}
            />
            <div
              style={{
                color: "#E6FFF3",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              导航
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <img
              src={navImgUrl}
              alt="nav"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                userSelect: "none",
              }}
            />
            <div style={{ position: "absolute", inset: 0 }}>
              {hotspots.map((hs) => {
                const labelOnLeft =
                  hs.title === "天际阳台" ||
                  hs.title === "下沉中庭" ||
                  hs.title === "单元入户门";
                return (
                  <div
                    key={hs.id}
                    style={{
                      position: "absolute",
                      left: `${hs.leftPct}%`,
                      top: `${hs.topPct}%`,
                      transform: "translate(-50%, -50%)",
                      display: "flex",
                      flexDirection: labelOnLeft ? "row-reverse" : "row",
                      alignItems: "center",
                      gap: 8,
                      pointerEvents: "auto",
                    }}
                  >
                    <button
                      onClick={() => onSelect(hs.id)}
                      title={hs.title}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        padding: 0,
                        border:
                          currentId === hs.id
                            ? "2px solid rgba(255,255,255,0.95)"
                            : "2px solid rgba(255,255,255,0.7)",
                        background:
                          currentId === hs.id
                            ? "rgba(110,231,183,0.95)"
                            : "rgba(110,231,183,0.8)",
                        boxShadow:
                          "0 0 10px rgba(110,231,183,0.95), 0 0 24px rgba(110,231,183,0.5)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    />
                    <div
                      onClick={() => onSelect(hs.id)}
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        lineHeight: "14px",
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        whiteSpace: "nowrap",
                        textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {hs.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 图集/视频分组：若无内容则整体不展示 */}
        {(hasImages || hasVideos) && (
          <>
            {/* 导航与媒体分割线 */}
            <div
              style={{
                height: 1,
                margin: "6px 12px",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              }}
            />

					{/* 图集（仅当有图片时显示） */}
					{hasImages && (
						<div style={{ padding: '10px 12px' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
								<div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, rgba(147,197,253,0.95), rgba(147,197,253,0.35))', boxShadow: '0 0 10px rgba(147,197,253,0.45)' }} />
								<div style={{ color: '#F0F7FF', fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>图集</div>
							</div>
							<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
							{images!.map((url, idx) => (
									<button
										key={idx}
									onClick={() => onOpenLightbox?.(images!, sampleTitle, idx)}
										title="查看图片"
										style={{
											border: '1px solid rgba(255,255,255,0.2)',
											borderRadius: 10,
											padding: 0,
											overflow: 'hidden',
											background: 'transparent',
											cursor: 'pointer'
										}}
									>
										<img src={url} alt={`img-${idx}`} style={{ width: '100%', height: 76, objectFit: 'cover', display: 'block' }} />
									</button>
								))}
							</div>
						</div>
					)}

            {/* 图集与视频之间的分割线（两者都存在时） */}
            {hasImages && hasVideos && (
              <div
                style={{
                  height: 1,
                  margin: "6px 12px",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
                }}
              />
            )}

            {/* 视频集（仅当有视频时显示） */}
            {hasVideos && (
              <div style={{ padding: "10px 12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 18,
                      borderRadius: 2,
                      background:
                        "linear-gradient(180deg, rgba(251,191,36,0.95), rgba(251,191,36,0.35))",
                      boxShadow: "0 0 10px rgba(251,191,36,0.4)",
                    }}
                  />
                  <div
                    style={{
                      color: "#FFF8E6",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    视频集
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 10,
                  }}
                >
                  {videos!.map((v, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <video
                        src={v}
                        controls
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          background: "black",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 媒体与样板间标题之间的分割线 */}
            <div
              style={{
                height: 1,
                margin: "6px 12px",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06))",
              }}
            />
          </>
        )}

        {/* 样板间标题 */}
        <div
          style={{
            padding: "10px 12px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}> */}
          {/* <div style={{ width: 4, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, rgba(248,113,113,0.95), rgba(248,113,113,0.35))', boxShadow: '0 0 10px rgba(248,113,113,0.4)' }} /> */}
          {/* <div style={{ color: '#FFEFEF', fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>样板间标题</div> */}
          {/* </div> */}
          {/* <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>样板间</div> */}
          <button
            style={{
              background: "rgba(50, 243, 166, 0.8)",
              border: "none",
              color: "#fff",
              fontSize: 16,
              marginBottom: 6,
            }}
            onClick={() =>
              window.open(
                "https://riverfrontmansion.zhilingtech.com/D5VirtualTour",
                "_blank"
              )
            }
          >
            前往样板间
          </button>
          {/* <div style={{ fontSize: 14, opacity: 0.9 }}>{sampleTitle || '未命名'}</div> */}
        </div>
      </div>
    </div>
  );
}

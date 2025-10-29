import { useMemo } from "react";
import { Vector3 } from "three";
import Cloud from "./Cloud";

interface CloudManagerProps {
  cloudCount?: number;
}

export default function CloudManager({ cloudCount = 15 }: CloudManagerProps) {
  // 生成随机云朵配置
  const clouds = useMemo(() => {
    return Array.from({ length: cloudCount }, (_, index) => {
      return {
        id: index,
        position: new Vector3(
          Math.random() * 4 - 6, // X: -6 到 -2 (相机X位置-4附近)
          Math.random() * 60 + 20, // Y: 20 到 80 (相机下方，地面模型上方)
          Math.random() * 5 - 5 // Z: -5 到 0 (相机Z位置-2.5附近)
        ),
        scale: Math.random() * 0.3 + 0.2, // 0.2 到 0.5 (更小的尺寸变化范围)
        speed: Math.random() * 0.1 + 0.05, // 0.05 到 0.25 (较慢的移动速度)
        rotationSpeed: (Math.random() - 0.5) * 0.1, // -0.05 到 0.05 (更慢的旋转)
      };
    });
  }, [cloudCount]);

  return (
    <group>
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.id}
          position={cloud.position}
          scale={cloud.scale}
          speed={cloud.speed}
          rotationSpeed={cloud.rotationSpeed}
        />
      ))}
    </group>
  );
}

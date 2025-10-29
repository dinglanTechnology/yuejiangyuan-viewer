import { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function ClickablePointMarkers() {
  const { camera, scene, gl } = useThree();
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const raycaster = useRef(new THREE.Raycaster()).current;
  const pointer = new THREE.Vector2();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();

      // 鼠标坐标转换为标准化设备坐标 (NDC)
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // 求与场景模型的交点
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const point = intersects[0].point.clone();
        console.log("命中模型的空间坐标:", point);

        // 保存点击点
        setPoints((prev) => [...prev, point]);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, scene, gl]);

  return (
    <>
      {/* 在点击位置渲染红色小球 */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </>
  );
}

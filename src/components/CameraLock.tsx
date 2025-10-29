import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraLock() {
  const { camera } = useThree();

  useFrame(() => {
    // 始终让相机向下看
    // 使用 lookAt 更新朝向，但不改变相机位置，这样不会干扰拖动
    if (camera instanceof THREE.PerspectiveCamera) {
      // 直接设置朝向，确保相机始终向下看
      camera.lookAt(camera.position.x, 0, camera.position.z);
      camera.up.set(0, 1, 0);
    }
  });

  return null;
}

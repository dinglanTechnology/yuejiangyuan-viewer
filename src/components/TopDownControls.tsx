import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

interface TopDownControlsProps {
  enableZoom?: boolean;
  // 添加限制参数
  maxDistance?: number; // 从默认位置的最大移动距离
  minFov?: number; // 最小视场角（最大缩放）
  maxFov?: number; // 最大视场角（最小缩放）
}

export default function TopDownControls({
  enableZoom = true,
  maxDistance = 20, // 默认最大移动距离20单位
  minFov = 1, // 最大缩放
  maxFov = 10, // 最小缩放
}: TopDownControlsProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef({
    isDown: false,
    mouseX: 0,
    mouseY: 0,
    panSpeed: 0.01,
    // 记录默认相机位置
    defaultPosition: new THREE.Vector3(-4, 86, -2.5),
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // 排除右键和中间键
      if (event.button !== 0) return;
      controlsRef.current.isDown = true;
      controlsRef.current.mouseX = event.clientX;
      controlsRef.current.mouseY = event.clientY;
      gl.domElement.style.cursor = "grabbing";
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!controlsRef.current.isDown) return;

      const dx = event.clientX - controlsRef.current.mouseX;
      const dy = event.clientY - controlsRef.current.mouseY;

      // 计算新的相机位置
      const newX = camera.position.x - dx * controlsRef.current.panSpeed;
      const newZ = camera.position.z - dy * controlsRef.current.panSpeed;

      // 检查是否超出限制范围
      const defaultPos = controlsRef.current.defaultPosition;
      const distanceFromDefault = Math.sqrt(
        Math.pow(newX - defaultPos.x, 2) + Math.pow(newZ - defaultPos.z, 2)
      );

      // 如果在允许范围内，则更新相机位置
      if (distanceFromDefault <= maxDistance) {
        camera.position.x = newX;
        camera.position.z = newZ;
      } else {
        // 如果超出范围，将位置限制在边界上
        const direction = new THREE.Vector2(
          newX - defaultPos.x,
          newZ - defaultPos.z
        ).normalize();
        camera.position.x = defaultPos.x + direction.x * maxDistance;
        camera.position.z = defaultPos.z + direction.y * maxDistance;
      }

      controlsRef.current.mouseX = event.clientX;
      controlsRef.current.mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      controlsRef.current.isDown = false;
      gl.domElement.style.cursor = "grab";
    };

    const handleWheel = (event: WheelEvent) => {
      if (!enableZoom) return;

      event.preventDefault();
      // 减小缩放速度，使缩放更平滑
      const zoomSpeed = 0.02; // 从 0.1 减小到 0.02
      const deltaY = event.deltaY;

      // 缩放视场角来模拟缩放
      const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50;
      const newFov = fov + deltaY * zoomSpeed;

      if (camera instanceof THREE.PerspectiveCamera) {
        // 应用FOV限制
        camera.fov = Math.max(minFov, Math.min(maxFov, newFov));
        camera.updateProjectionMatrix();
      }
    };

    // 设置初始光标样式
    gl.domElement.style.cursor = "grab";

    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("mouseup", handleMouseUp);
    gl.domElement.addEventListener("mouseleave", handleMouseUp);
    gl.domElement.addEventListener("wheel", handleWheel, { passive: false });

    // 确保 pointer-events 启用
    gl.domElement.style.pointerEvents = "auto";

    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("mouseup", handleMouseUp);
      gl.domElement.removeEventListener("mouseleave", handleMouseUp);
      gl.domElement.removeEventListener("wheel", handleWheel);
      gl.domElement.style.cursor = "";
    };
  }, [camera, gl, enableZoom, maxDistance, minFov, maxFov]);

  return null;
}

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface TopDownControlsProps {
  enableZoom?: boolean
}

export default function TopDownControls({ enableZoom = true }: TopDownControlsProps) {
  const { camera, gl } = useThree()
  const controlsRef = useRef({
    isDown: false,
    mouseX: 0,
    mouseY: 0,
    panSpeed: 0.01
  })

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      controlsRef.current.isDown = true
      controlsRef.current.mouseX = event.clientX
      controlsRef.current.mouseY = event.clientY
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!controlsRef.current.isDown) return

      const dx = event.clientX - controlsRef.current.mouseX
      const dy = event.clientY - controlsRef.current.mouseY

      // 从上往下看，所以移动相机的 x 和 z 位置
      camera.position.x -= dx * controlsRef.current.panSpeed
      camera.position.z -= dy * controlsRef.current.panSpeed

      controlsRef.current.mouseX = event.clientX
      controlsRef.current.mouseY = event.clientY
    }

    const handleMouseUp = () => {
      controlsRef.current.isDown = false
    }

    const handleWheel = (event: WheelEvent) => {
      if (!enableZoom) return
      
      event.preventDefault()
      const zoomSpeed = 0.1
      const deltaY = event.deltaY

      // 缩放视场角来模拟缩放
      const fov = camera instanceof THREE.PerspectiveCamera ? camera.fov : 50
      const newFov = fov + deltaY * zoomSpeed
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = Math.max(10, Math.min(100, newFov))
        camera.updateProjectionMatrix()
      }
    }

    gl.domElement.addEventListener('mousedown', handleMouseDown)
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('mouseup', handleMouseUp)
    gl.domElement.addEventListener('mouseleave', handleMouseUp)
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown)
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('mouseup', handleMouseUp)
      gl.domElement.removeEventListener('mouseleave', handleMouseUp)
      gl.domElement.removeEventListener('wheel', handleWheel)
    }
  }, [camera, gl, enableZoom])

  return null
}


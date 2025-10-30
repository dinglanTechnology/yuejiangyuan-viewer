import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 启用代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React Three Fiber 相关库分离
          "react-three": ["@react-three/fiber", "@react-three/drei"],
          // 将 Three.js 分离
          three: ["three"],
        },
      },
    },
    // 启用压缩（使用 esbuild，更快且无需额外依赖）
    minify: "esbuild",
    // 如果需要 terser，取消注释并安装: npm install -D terser
    // minify: "terser",
    // terserOptions: {
    //   compress: {
    //     drop_console: true, // 移除 console
    //     drop_debugger: true, // 移除 debugger
    //   },
    // },
    // 优化 chunk 大小
    chunkSizeWarningLimit: 1000,
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@react-three/fiber",
      "@react-three/drei",
      "three",
    ],
  },
});

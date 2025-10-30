// 模型预加载工具
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

const MODEL_URL =
  "https://cloud-city.oss-cn-chengdu.aliyuncs.com/maps/yuejiangyuan.glb";

// 全局缓存，避免重复加载
let cachedModel: THREE.Group | null = null;
let loadingPromise: Promise<THREE.Group> | null = null;

/**
 * 预加载模型
 * 返回一个 Promise，模型加载完成后 resolve
 */
export function preloadModel(): Promise<THREE.Group> {
  // 如果已经加载过，直接返回缓存的模型
  if (cachedModel) {
    return Promise.resolve(cachedModel.clone());
  }

  // 如果正在加载，返回相同的 Promise
  if (loadingPromise) {
    return loadingPromise.then((model) => model.clone());
  }

  // 开始加载
  loadingPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      MODEL_URL,
      (gltf) => {
        cachedModel = gltf.scene;
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        loadingPromise = null;
        reject(error);
      }
    );
  });

  return loadingPromise.then((model) => model.clone());
}

/**
 * 获取缓存的模型（如果已加载）
 */
export function getCachedModel(): THREE.Group | null {
  return cachedModel ? cachedModel.clone() : null;
}

/**
 * 清除缓存（如果需要重新加载）
 */
export function clearModelCache(): void {
  cachedModel = null;
  loadingPromise = null;
}

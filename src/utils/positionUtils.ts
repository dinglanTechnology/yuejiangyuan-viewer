/**
 * 位置计算工具函数
 * 用于处理不同屏幕尺寸下热点定位的偏移问题
 */

export interface ImageDisplayInfo {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
  scaleX: number;
  scaleY: number;
  actualImageWidth: number;
  actualImageHeight: number;
  offsetX: number;
  offsetY: number;
}

/**
 * 计算图片在容器中的实际显示区域
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param imageWidth 图片原始宽度
 * @param imageHeight 图片原始高度
 * @returns 图片显示信息
 */
export function calculateImageDisplayInfo(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): ImageDisplayInfo {
  // 计算缩放比例
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  
  // 使用较大的缩放比例（object-fit: cover 的行为）
  const scale = Math.max(scaleX, scaleY);
  
  // 计算图片在容器中的实际尺寸
  const actualImageWidth = imageWidth * scale;
  const actualImageHeight = imageHeight * scale;
  
  // 计算图片在容器中的偏移量（居中显示）
  const offsetX = (containerWidth - actualImageWidth) / 2;
  const offsetY = (containerHeight - actualImageHeight) / 2;
  
  return {
    containerWidth,
    containerHeight,
    imageWidth,
    imageHeight,
    scaleX,
    scaleY,
    actualImageWidth,
    actualImageHeight,
    offsetX,
    offsetY,
  };
}

/**
 * 将百分比坐标转换为实际像素坐标
 * @param percentX 百分比X坐标 (0-100)
 * @param percentY 百分比Y坐标 (0-100)
 * @param imageDisplayInfo 图片显示信息
 * @returns 实际像素坐标
 */
export function convertPercentToPixels(
  percentX: number,
  percentY: number,
  imageDisplayInfo: ImageDisplayInfo
): { x: number; y: number } {
  // 将百分比转换为0-1范围
  const normalizedX = percentX / 100;
  const normalizedY = percentY / 100;
  
  // 计算在图片上的实际像素位置
  const imageX = normalizedX * imageDisplayInfo.actualImageWidth;
  const imageY = normalizedY * imageDisplayInfo.actualImageHeight;
  
  // 加上偏移量得到在容器中的实际位置
  const containerX = imageX + imageDisplayInfo.offsetX;
  const containerY = imageY + imageDisplayInfo.offsetY;
  
  return {
    x: containerX,
    y: containerY,
  };
}

/**
 * 将实际像素坐标转换为百分比坐标
 * @param pixelX 像素X坐标
 * @param pixelY 像素Y坐标
 * @param imageDisplayInfo 图片显示信息
 * @returns 百分比坐标
 */
export function convertPixelsToPercent(
  pixelX: number,
  pixelY: number,
  imageDisplayInfo: ImageDisplayInfo
): { x: number; y: number } {
  // 减去偏移量得到在图片上的位置
  const imageX = pixelX - imageDisplayInfo.offsetX;
  const imageY = pixelY - imageDisplayInfo.offsetY;
  
  // 转换为百分比
  const percentX = (imageX / imageDisplayInfo.actualImageWidth) * 100;
  const percentY = (imageY / imageDisplayInfo.actualImageHeight) * 100;
  
  return {
    x: Math.max(0, Math.min(100, percentX)), // 限制在0-100范围内
    y: Math.max(0, Math.min(100, percentY)),
  };
}

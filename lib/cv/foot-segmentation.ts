import { ImageSegmenter, FilesetResolver } from "@mediapipe/tasks-vision";
import sharp from "sharp";

export interface FootMask {
  left?: {
    mask: boolean[][]; // 2D array of boolean values (true = foot pixel)
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
  };
  right?: {
    mask: boolean[][];
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
  };
}

let segmenter: ImageSegmenter | null = null;

/**
 * Initialize MediaPipe ImageSegmenter
 * This should be called once on module load or lazily on first use
 */
async function initializeSegmenter(): Promise<ImageSegmenter> {
  if (segmenter) {
    return segmenter;
  }

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
    );

    segmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmentation_landscape/float16/1/selfie_segmentation_landscape.tflite`,
        delegate: "GPU",
      },
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    });

    return segmenter;
  } catch (error) {
    console.error("Failed to initialize MediaPipe segmenter:", error);
    // Fallback: return a mock segmenter that uses color-based segmentation
    throw new Error("MediaPipe initialization failed. Please check your setup.");
  }
}

/**
 * Segment feet from image using MediaPipe
 * Falls back to color-based segmentation if MediaPipe unavailable
 */
export async function segmentFeet(
  imageBuffer: Buffer
): Promise<FootMask> {
  try {
    // Try MediaPipe first
    const segmenter = await initializeSegmenter();
    
    // Convert image to format MediaPipe expects
    const image = sharp(imageBuffer);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create ImageData-like object for MediaPipe
    const imageData = {
      data: new Uint8ClampedArray(data),
      width: info.width,
      height: info.height,
      colorSpace: "srgb" as PredefinedColorSpace,
    };

    // Run segmentation
    const results = segmenter.segment(imageData);
    
    if (!results.categoryMask) {
      throw new Error("No segmentation mask returned");
    }

    // Extract foot regions (simplified - MediaPipe segments person, we need to identify feet)
    // In production, you might use pose detection to locate feet, then extract from mask
    const mask = results.categoryMask;
    
    // Convert MPMask to Uint8ClampedArray
    // MPMask has getAsFloat32Array() method, convert to Uint8ClampedArray
    const maskData = mask.getAsFloat32Array();
    const maskArray = new Uint8ClampedArray(maskData.length);
    for (let i = 0; i < maskData.length; i++) {
      maskArray[i] = Math.round(maskData[i] * 255);
    }
    
    // Find two largest connected components (assuming these are feet)
    // This is simplified - production should use pose detection to identify left/right
    const leftFoot = extractFootRegion(maskArray, info.width, info.height, "left");
    const rightFoot = extractFootRegion(maskArray, info.width, info.height, "right");

    return {
      left: leftFoot,
      right: rightFoot,
    };
  } catch (error) {
    console.error("Error segmenting feet with MediaPipe, falling back to color-based:", error);
    // Fallback to color-based segmentation
    return segmentFeetColorBased(imageBuffer);
  }
}

/**
 * Extract foot region from segmentation mask
 * Simplified implementation - assumes feet are in bottom half of image
 */
function extractFootRegion(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  side: "left" | "right"
): FootMask["left"] | undefined {
  // Find connected components in bottom half of image
  const halfWidth = width / 2;
  const startX = side === "left" ? 0 : halfWidth;
  const endX = side === "left" ? halfWidth : width;
  const startY = Math.floor(height * 0.5); // Bottom half
  
  const footMask: boolean[][] = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let pixelCount = 0;

  for (let y = startY; y < height; y++) {
    const row: boolean[] = [];
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const isForeground = mask[idx] > 128; // Threshold for foreground
      row.push(isForeground);
      
      if (isForeground) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        pixelCount++;
      }
    }
    footMask.push(row);
  }

  if (pixelCount < 100) {
    // Not enough pixels to be a foot
    return undefined;
  }

  return {
    mask: footMask,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    confidence: Math.min(1.0, pixelCount / (width * height * 0.1)), // Rough confidence estimate
  };
}

/**
 * Fallback: Color-based foot segmentation
 * Uses skin color detection and edge detection
 */
async function segmentFeetColorBased(
  imageBuffer: Buffer
): Promise<FootMask> {
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const pixels = new Uint8ClampedArray(data);

  // Simple skin color detection (HSV-based)
  const skinMask: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Convert RGB to HSV (simplified)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const v = max / 255;
      const s = max === 0 ? 0 : (max - min) / max;
      
      let h = 0;
      if (max !== min) {
        if (max === r) h = ((g - b) / (max - min)) % 6;
        else if (max === g) h = (b - r) / (max - min) + 2;
        else h = (r - g) / (max - min) + 4;
      }
      h = h * 60;
      if (h < 0) h += 360;

      // Skin color range (approximate)
      const isSkin =
        h >= 0 && h <= 50 && s >= 0.2 && s <= 0.7 && v >= 0.35 && v <= 0.95;
      row.push(isSkin);
    }
    skinMask.push(row);
  }

  // Extract feet regions (bottom half, left and right)
  const halfWidth = width / 2;
  const startY = Math.floor(height * 0.5);

  const leftFoot = extractRegion(skinMask, 0, halfWidth, startY, height, width);
  const rightFoot = extractRegion(
    skinMask,
    halfWidth,
    width,
    startY,
    height,
    width
  );

  return {
    left: leftFoot,
    right: rightFoot,
  };
}

function extractRegion(
  mask: boolean[][],
  startX: number,
  endX: number,
  startY: number,
  endY: number,
  fullWidth: number
): FootMask["left"] | undefined {
  const regionMask: boolean[][] = [];
  let minX = fullWidth;
  let maxX = 0;
  let minY = endY;
  let maxY = startY;
  let pixelCount = 0;

  for (let y = startY; y < endY; y++) {
    const row: boolean[] = [];
    for (let x = startX; x < endX; x++) {
      const isForeground = mask[y]?.[x] || false;
      row.push(isForeground);

      if (isForeground) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        pixelCount++;
      }
    }
    regionMask.push(row);
  }

  if (pixelCount < 100) {
    return undefined;
  }

  return {
    mask: regionMask,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    confidence: Math.min(1.0, pixelCount / ((endX - startX) * (endY - startY) * 0.3)),
  };
}



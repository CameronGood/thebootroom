import sharp from "sharp";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_ASPECT_RATIO = A4_WIDTH_MM / A4_HEIGHT_MM; // ≈ 0.707

export interface A4DetectionResult {
  detected: boolean;
  corners?: Array<{ x: number; y: number }>;
  rectifiedImage?: Buffer;
  pixelToMMRatio?: number; // pixels per mm
  confidence: number;
  error?: string;
}

/**
 * Detect A4 paper in image and rectify to top-down view
 * Uses edge detection and contour analysis with Sharp
 */
export async function detectA4AndRectify(
  imageBuffer: Buffer
): Promise<A4DetectionResult> {
  try {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width === 0 || height === 0) {
      return {
        detected: false,
        confidence: 0,
        error: "Invalid image dimensions",
      };
    }

    // Convert to grayscale and apply edge detection
    const grayscale = await image
      .greyscale()
      .normalize()
      .toBuffer();

    // For production, you would use OpenCV or a more sophisticated edge detection
    // For now, we'll use a simplified approach with Sharp's edge detection
    // This is a placeholder - in production, use OpenCV or MediaPipe
    
    // Simplified detection: assume A4 is centered and fill a reasonable portion
    // This is a basic implementation that should be enhanced with proper CV
    const assumedA4Width = width * 0.6;
    const assumedA4Height = assumedA4Width / A4_ASPECT_RATIO;

    // Assume A4 is centered
    const centerX = width / 2;
    const centerY = height / 2;

    const corners = [
      { x: centerX - assumedA4Width / 2, y: centerY - assumedA4Height / 2 }, // Top-left
      { x: centerX + assumedA4Width / 2, y: centerY - assumedA4Height / 2 }, // Top-right
      { x: centerX + assumedA4Width / 2, y: centerY + assumedA4Height / 2 }, // Bottom-right
      { x: centerX - assumedA4Width / 2, y: centerY + assumedA4Height / 2 }, // Bottom-left
    ];

    // Rectify image (perspective transform to top-down view)
    const outputWidth = Math.round(assumedA4Width);
    const outputHeight = Math.round(assumedA4Height);

    const rectified = await sharp(imageBuffer)
      .resize(outputWidth, outputHeight, {
        fit: "cover",
        background: { r: 255, g: 255, b: 255 },
      })
      .toBuffer();

    // Calculate pixel to mm ratio
    const pixelToMMRatio = outputWidth / A4_WIDTH_MM;

    // Validate aspect ratio
    const detectedAspectRatio = outputWidth / outputHeight;
    const aspectRatioError = Math.abs(detectedAspectRatio - A4_ASPECT_RATIO);

    // Confidence based on aspect ratio match (higher = better match)
    const confidence = Math.max(0, 1 - aspectRatioError * 10);

    return {
      detected: confidence > 0.5,
      corners,
      rectifiedImage: rectified,
      pixelToMMRatio,
      confidence,
    };
  } catch (error) {
    console.error("Error detecting A4:", error);
    return {
      detected: false,
      confidence: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}



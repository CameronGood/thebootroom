import { FootMask } from "./foot-segmentation";
import { MeasurementResult } from "@/types";
import { A4DetectionResult } from "./a4-detection";

/**
 * Calculate foot length and width from foot mask
 */
export function calculateMeasurements(
  footMask: FootMask["left"] | FootMask["right"],
  pixelToMMRatio: number,
  a4Confidence: number,
  segmentationConfidence: number,
  sockThickness: "thin" | "medium" | "thick"
): MeasurementResult | null {
  if (!footMask) {
    return null;
  }

  const { mask, bounds, confidence } = footMask;

  // Calculate principal axis (longest dimension)
  // For foot length, we use the height of the bounding box as an approximation
  // In production, you'd calculate the actual longest axis through the mask

  // Length: distance from heel to toe along principal axis
  // Simplified: use bounding box height (assuming foot is oriented vertically)
  const lengthPixels = bounds.height;
  const lengthMm = lengthPixels / pixelToMMRatio;

  // Width: at 60-70% of length position (ball of foot)
  const widthPosition = Math.floor(lengthMm * 0.65); // 65% of length
  const widthPositionPixels = Math.floor(widthPosition * pixelToMMRatio);
  
  // Find width at that position
  let maxWidth = 0;
  const searchY = bounds.y + widthPositionPixels - bounds.y;
  
  if (searchY >= 0 && searchY < mask.length) {
    const row = mask[searchY - bounds.y];
    if (row) {
      let startX = -1;
      let endX = -1;
      
      for (let x = 0; x < row.length; x++) {
        if (row[x] && startX === -1) {
          startX = x;
        }
        if (row[x]) {
          endX = x;
        }
      }
      
      if (startX !== -1 && endX !== -1) {
        maxWidth = endX - startX + 1;
      }
    }
  }

  // Fallback: use bounding box width if width calculation failed
  if (maxWidth === 0) {
    maxWidth = bounds.width;
  }

  const widthMm = maxWidth / pixelToMMRatio;

  // Calculate confidence score
  let confidenceScore =
    a4Confidence * 0.3 +
    segmentationConfidence * 0.3 +
    confidence * 0.2;

  // Apply sock thickness penalty
  if (sockThickness === "medium") {
    confidenceScore -= 0.1;
  } else if (sockThickness === "thick") {
    confidenceScore -= 0.2;
  }

  // Edge completeness check
  const edgeCompleteness = checkEdgeCompleteness(mask, bounds);
  confidenceScore += edgeCompleteness * 0.2;

  // Clamp confidence to [0, 1]
  confidenceScore = Math.max(0, Math.min(1, confidenceScore));

  return {
    lengthMm: Math.round(lengthMm * 10) / 10, // Round to 1 decimal
    widthMm: Math.round(widthMm * 10) / 10,
    confidence: confidenceScore,
  };
}

/**
 * Check if foot edges are complete (not clipped)
 * Returns a score from 0 to 1
 */
function checkEdgeCompleteness(
  mask: boolean[][],
  bounds: { x: number; y: number; width: number; height: number }
): number {
  if (mask.length === 0) return 0;

  // Check if foot touches image edges (indicates clipping)
  const touchesLeftEdge = mask.some((row) => row[0]);
  const touchesRightEdge = mask.some((row) => row[row.length - 1]);
  const touchesTopEdge = mask[0]?.some((pixel) => pixel) || false;
  const touchesBottomEdge =
    mask[mask.length - 1]?.some((pixel) => pixel) || false;

  // Penalize if touching edges (may be clipped)
  let penalty = 0;
  if (touchesLeftEdge) penalty += 0.25;
  if (touchesRightEdge) penalty += 0.25;
  if (touchesTopEdge) penalty += 0.25;
  if (touchesBottomEdge) penalty += 0.25;

  return Math.max(0, 1 - penalty);
}

/**
 * Calculate blur score using Laplacian variance
 * Higher variance = sharper image
 */
export async function calculateBlurScore(
  imageBuffer: Buffer
): Promise<number> {
  // Simplified blur detection
  // In production, use proper Laplacian variance calculation
  // For now, return a default score
  return 0.8; // Default blur score
}

/**
 * Process foot measurements from segmentation result
 */
export function processFootMeasurements(
  footMask: FootMask,
  a4Result: A4DetectionResult,
  sockThickness: "thin" | "medium" | "thick",
  blurScore: number
): {
  left: MeasurementResult | null;
  right: MeasurementResult | null;
} {
  if (!a4Result.pixelToMMRatio || !a4Result.rectifiedImage) {
    return { left: null, right: null };
  }

  const left = footMask.left
    ? calculateMeasurements(
        footMask.left,
        a4Result.pixelToMMRatio,
        a4Result.confidence,
        footMask.left.confidence,
        sockThickness
      )
    : null;

  const right = footMask.right
    ? calculateMeasurements(
        footMask.right,
        a4Result.pixelToMMRatio,
        a4Result.confidence,
        footMask.right.confidence,
        sockThickness
      )
    : null;

  return { left, right };
}



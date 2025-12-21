import { MeasurementResult } from "@/types";
import { MeasurementSession } from "@/types";

/**
 * Combine measurements from two photos with weighted averaging
 * Photo with foot beside long edge gets higher weight for length
 */
export function reconcileMeasurements(
  session: MeasurementSession
): {
  left: MeasurementResult | null;
  right: MeasurementResult | null;
} {
  if (!session.photo1?.processed || !session.photo2?.processed) {
    // Need both photos
    return { left: null, right: null };
  }

  // Photo 1: Left foot beside long edge, Right foot below short edge
  // Photo 2: Right foot beside long edge, Left foot below short edge

  const photo1Left = session.photo1.left; // Long-edge view (higher accuracy for length)
  const photo1Right = session.photo1.right; // Short-edge view (lower accuracy)

  const photo2Left = session.photo2.left; // Short-edge view (lower accuracy)
  const photo2Right = session.photo2.right; // Long-edge view (higher accuracy for length)

  // Weighted average: long-edge view gets 0.7, short-edge gets 0.3
  const leftLength =
    photo1Left && photo2Left
      ? photo1Left.lengthMm * 0.7 + photo2Left.lengthMm * 0.3
      : photo1Left?.lengthMm || photo2Left?.lengthMm || 0;

  const leftWidth =
    photo1Left && photo2Left
      ? (photo1Left.widthMm + photo2Left.widthMm) / 2 // Average width (both views similar)
      : photo1Left?.widthMm || photo2Left?.widthMm || 0;

  const leftConfidence =
    photo1Left && photo2Left
      ? (photo1Left.confidence * 0.7 + photo2Left.confidence * 0.3)
      : photo1Left?.confidence || photo2Left?.confidence || 0;

  const rightLength =
    photo1Right && photo2Right
      ? photo2Right.lengthMm * 0.7 + photo1Right.lengthMm * 0.3
      : photo2Right?.lengthMm || photo1Right?.lengthMm || 0;

  const rightWidth =
    photo1Right && photo2Right
      ? (photo1Right.widthMm + photo2Right.widthMm) / 2
      : photo1Right?.widthMm || photo2Right?.widthMm || 0;

  const rightConfidence =
    photo1Right && photo2Right
      ? (photo2Right.confidence * 0.7 + photo1Right.confidence * 0.3)
      : photo2Right?.confidence || photo1Right?.confidence || 0;

  // Apply sock thickness adjustment to width
  let leftWidthAdjusted = leftWidth;
  let rightWidthAdjusted = rightWidth;

  if (session.sockThickness === "medium") {
    leftWidthAdjusted *= 0.95; // Slightly reduce width (subtract sock thickness estimate)
    rightWidthAdjusted *= 0.95;
  } else if (session.sockThickness === "thick") {
    leftWidthAdjusted *= 0.9;
    rightWidthAdjusted *= 0.9;
  }

  return {
    left:
      leftLength > 0 && leftWidthAdjusted > 0
        ? {
            lengthMm: Math.round(leftLength * 10) / 10,
            widthMm: Math.round(leftWidthAdjusted * 10) / 10,
            confidence: Math.max(0, Math.min(1, leftConfidence)),
          }
        : null,
    right:
      rightLength > 0 && rightWidthAdjusted > 0
        ? {
            lengthMm: Math.round(rightLength * 10) / 10,
            widthMm: Math.round(rightWidthAdjusted * 10) / 10,
            confidence: Math.max(0, Math.min(1, rightConfidence)),
          }
        : null,
  };
}

/**
 * Check for outliers and inconsistencies between photos
 */
export function checkMeasurementConsistency(
  session: MeasurementSession
): {
  consistent: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!session.photo1?.processed || !session.photo2?.processed) {
    return { consistent: false, issues: ["Both photos must be processed"] };
  }

  // Check length difference between photos
  if (session.photo1.left && session.photo2.left) {
    const lengthDiff = Math.abs(
      session.photo1.left.lengthMm - session.photo2.left.lengthMm
    );
    if (lengthDiff > 8) {
      issues.push(
        `Left foot length difference between photos is ${lengthDiff.toFixed(
          1
        )}mm (should be < 8mm)`
      );
    }
  }

  if (session.photo1.right && session.photo2.right) {
    const lengthDiff = Math.abs(
      session.photo1.right.lengthMm - session.photo2.right.lengthMm
    );
    if (lengthDiff > 8) {
      issues.push(
        `Right foot length difference between photos is ${lengthDiff.toFixed(
          1
        )}mm (should be < 8mm)`
      );
    }
  }

  // Check confidence scores
  const minConfidence = 0.6;
  if (session.photo1.left && session.photo1.left.confidence < minConfidence) {
    issues.push("Left foot confidence in photo 1 is below threshold");
  }
  if (session.photo1.right && session.photo1.right.confidence < minConfidence) {
    issues.push("Right foot confidence in photo 1 is below threshold");
  }
  if (session.photo2.left && session.photo2.left.confidence < minConfidence) {
    issues.push("Left foot confidence in photo 2 is below threshold");
  }
  if (session.photo2.right && session.photo2.right.confidence < minConfidence) {
    issues.push("Right foot confidence in photo 2 is below threshold");
  }

  return {
    consistent: issues.length === 0,
    issues,
  };
}



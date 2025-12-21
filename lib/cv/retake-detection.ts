import { MeasurementSession } from "@/types";

export interface RetakeReason {
  required: boolean;
  reason?: string;
}

/**
 * Determine if a retake is required based on measurement session state
 */
export function checkRetakeRequired(
  session: MeasurementSession,
  photoNumber: 1 | 2
): RetakeReason {
  const photo = photoNumber === 1 ? session.photo1 : session.photo2;

  if (!photo || !photo.processed) {
    return { required: false }; // Photo not processed yet
  }

  // Check if A4 was detected
  if (!photo.left && !photo.right) {
    return {
      required: true,
      reason: "A4 paper not detected. Please ensure the A4 paper is fully visible and well-lit.",
    };
  }

  // Check if feet were detected
  const hasLeftFoot = !!photo.left;
  const hasRightFoot = !!photo.right;

  if (!hasLeftFoot && !hasRightFoot) {
    return {
      required: true,
      reason: "No feet detected. Please ensure both feet are fully visible and don't touch the paper.",
    };
  }

  // Check if foot was clipped
  const lowConfidence = 0.5;
  if (photo.left && photo.left.confidence < lowConfidence) {
    return {
      required: true,
      reason: "Left foot may be clipped or unclear. Please ensure the entire foot is visible.",
    };
  }

  if (photo.right && photo.right.confidence < lowConfidence) {
    return {
      required: true,
      reason: "Right foot may be clipped or unclear. Please ensure the entire foot is visible.",
    };
  }

  // Check for reasonable measurements
  if (photo.left) {
    if (photo.left.lengthMm < 150 || photo.left.lengthMm > 350) {
      return {
        required: true,
        reason: "Left foot length seems incorrect. Please retake the photo.",
      };
    }
    if (photo.left.widthMm < 50 || photo.left.widthMm > 150) {
      return {
        required: true,
        reason: "Left foot width seems incorrect. Please retake the photo.",
      };
    }
  }

  if (photo.right) {
    if (photo.right.lengthMm < 150 || photo.right.lengthMm > 350) {
      return {
        required: true,
        reason: "Right foot length seems incorrect. Please retake the photo.",
      };
    }
    if (photo.right.widthMm < 50 || photo.right.widthMm > 150) {
      return {
        required: true,
        reason: "Right foot width seems incorrect. Please retake the photo.",
      };
    }
  }

  return { required: false };
}

/**
 * Check if both photos are consistent after photo 2 is processed
 */
export function checkFinalConsistency(
  session: MeasurementSession
): RetakeReason {
  if (!session.photo1?.processed || !session.photo2?.processed) {
    return { required: false }; // Not ready yet
  }

  // Check length consistency
  if (session.photo1.left && session.photo2.left) {
    const lengthDiff = Math.abs(
      session.photo1.left.lengthMm - session.photo2.left.lengthMm
    );
    if (lengthDiff > 8) {
      return {
        required: true,
        reason: `Left foot measurements differ by ${lengthDiff.toFixed(
          1
        )}mm between photos. Please retake both photos.`,
      };
    }
  }

  if (session.photo1.right && session.photo2.right) {
    const lengthDiff = Math.abs(
      session.photo1.right.lengthMm - session.photo2.right.lengthMm
    );
    if (lengthDiff > 8) {
      return {
        required: true,
        reason: `Right foot measurements differ by ${lengthDiff.toFixed(
          1
        )}mm between photos. Please retake both photos.`,
      };
    }
  }

  // Check if both confidences are too low
  const minConfidence = 0.6;
  const photo1Confidences = [
    session.photo1.left?.confidence,
    session.photo1.right?.confidence,
  ].filter((c): c is number => c !== undefined);

  const photo2Confidences = [
    session.photo2.left?.confidence,
    session.photo2.right?.confidence,
  ].filter((c): c is number => c !== undefined);

  const allConfidences = [...photo1Confidences, ...photo2Confidences];
  const avgConfidence =
    allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;

  if (avgConfidence < minConfidence) {
    return {
      required: true,
      reason: "Overall measurement confidence is too low. Please retake both photos with better lighting and clearer positioning.",
    };
  }

  return { required: false };
}



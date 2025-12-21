import { NextRequest, NextResponse } from "next/server";
import { fetchObject } from "@/lib/r2/client";
import { adminFirestore } from "@/lib/firebase-admin";
import { deleteImageFromR2 } from "@/lib/r2/delete";
import { detectA4AndRectify } from "@/lib/cv/a4-detection";
import { segmentFeet } from "@/lib/cv/foot-segmentation";
import { processFootMeasurements, calculateBlurScore } from "@/lib/cv/measurements";
import { reconcileMeasurements, checkMeasurementConsistency } from "@/lib/cv/reconciliation";
import { checkRetakeRequired, checkFinalConsistency } from "@/lib/cv/retake-detection";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, photoNumber, objectKey } = body;

    if (!sessionId || !photoNumber || !objectKey) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, photoNumber, objectKey" },
        { status: 400 }
      );
    }

    // Get measurement session
    const measurementSessionDoc = await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .get();

    if (!measurementSessionDoc.exists) {
      return NextResponse.json(
        { error: "Measurement session not found" },
        { status: 404 }
      );
    }

    const sessionData = measurementSessionDoc.data();
    const sockThickness = sessionData?.sockThickness || "thin";

    // Download image from R2 using REST API
    let imageBuffer: Buffer;
    try {
      imageBuffer = await fetchObject(objectKey);
    } catch (error) {
      console.error("Error downloading image from R2:", error);
      return NextResponse.json(
        { error: "Failed to download image" },
        { status: 500 }
      );
    }

    // Delete image immediately after downloading
    deleteImageFromR2(objectKey).catch((err) => {
      console.error("Failed to delete image (will be cleaned up by lifecycle rule):", err);
    });

    // Process image: A4 detection → Foot segmentation → Measurements
    const a4Result = await detectA4AndRectify(imageBuffer);
    
    if (!a4Result.detected) {
      await adminFirestore
        .collection("measurementSessions")
        .doc(sessionId)
        .update({
          status: "failed",
          errorMessage: a4Result.error || "A4 paper not detected",
        });

      return NextResponse.json({
        success: false,
        retakeRequired: true,
        retakeReason: a4Result.error || "A4 paper not detected. Please ensure the A4 paper is fully visible.",
      });
    }

    // Segment feet
    const footMask = await segmentFeet(a4Result.rectifiedImage!);
    
    // Calculate blur score
    const blurScore = await calculateBlurScore(imageBuffer);

    // Process measurements
    const measurements = processFootMeasurements(
      footMask,
      a4Result,
      sockThickness,
      blurScore
    );

    // Update session with photo results
    const photoUpdate: any = {
      processed: true,
    };

    if (measurements.left) {
      photoUpdate.left = measurements.left;
    }

    if (measurements.right) {
      photoUpdate.right = measurements.right;
    }

    await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .update({
        [`photo${photoNumber}`]: photoUpdate,
      });

    // Check if retake is required for this photo
    const currentSessionDoc = await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .get();
    
    const currentSession = currentSessionDoc.data() as any;
    const retakeCheck = checkRetakeRequired(
      {
        ...currentSession,
        [`photo${photoNumber}`]: photoUpdate,
      } as any,
      photoNumber as 1 | 2
    );

    if (retakeCheck.required) {
      await adminFirestore
        .collection("measurementSessions")
        .doc(sessionId)
        .update({
          status: "capturing",
        });

      return NextResponse.json({
        success: false,
        retakeRequired: true,
        retakeReason: retakeCheck.reason,
      });
    }

    // If photo 2, reconcile measurements and check final consistency
    if (photoNumber === 2) {
      const finalSessionDoc = await adminFirestore
        .collection("measurementSessions")
        .doc(sessionId)
        .get();
      
      const finalSessionData = finalSessionDoc.data() as any;
      const finalSession = {
        ...finalSessionData,
        [`photo${photoNumber}`]: photoUpdate,
      } as any;

      // Check final consistency
      const finalConsistency = checkFinalConsistency(finalSession);

      if (finalConsistency.required) {
        await adminFirestore
          .collection("measurementSessions")
          .doc(sessionId)
          .update({
            status: "capturing",
          });

        return NextResponse.json({
          success: false,
          retakeRequired: true,
          retakeReason: finalConsistency.reason,
        });
      }

      // Reconcile measurements
      const finalMeasurements = reconcileMeasurements(finalSession);

      // Update session with final measurements
      await adminFirestore
        .collection("measurementSessions")
        .doc(sessionId)
        .update({
          final: finalMeasurements,
          status: "complete",
          completedAt: new Date(),
        });

      return NextResponse.json({
        success: true,
        left: finalMeasurements.left,
        right: finalMeasurements.right,
        retakeRequired: false,
      });
    }

    // Photo 1 complete, waiting for photo 2
    return NextResponse.json({
      success: true,
      left: measurements.left,
      right: measurements.right,
      retakeRequired: false,
    });
  } catch (error) {
    console.error("Error analyzing measurement:", error);
    return NextResponse.json(
      {
        error: "Failed to process measurement",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl } from "@/lib/r2/client";
import { adminFirestore } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get measurement session from Firestore
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

    const measurementSession = measurementSessionDoc.data();
    const quizSessionId = measurementSession?.quizSessionId;

    if (!quizSessionId) {
      return NextResponse.json(
        { error: "Invalid measurement session" },
        { status: 400 }
      );
    }

    // Verify quiz session exists
    const quizSessionDoc = await adminFirestore
      .collection("quizSessions")
      .doc(quizSessionId)
      .get();

    if (!quizSessionDoc.exists) {
      return NextResponse.json(
        { error: "Linked quiz session not found" },
        { status: 404 }
      );
    }

    // Generate unique object key for the image
    const objectKey = `measurements/${sessionId}/${uuidv4()}.jpg`;

    // Generate upload URL (server-side endpoint that proxies to R2)
    const uploadUrl = generateUploadUrl(objectKey);

    return NextResponse.json({
      uploadUrl,
      objectKey,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

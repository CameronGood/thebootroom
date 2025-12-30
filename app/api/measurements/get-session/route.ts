import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Validate sessionId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    // Get measurement session from Firestore using Admin SDK (bypasses security rules)
    const docSnap = await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Measurement session not found" },
        { status: 404 }
      );
    }

    const data = docSnap.data();
    
    if (!data) {
      return NextResponse.json(
        { error: "Session data is empty" },
        { status: 500 }
      );
    }

    // Verify the session has required fields
    if (!data.quizSessionId) {
      return NextResponse.json(
        { error: "Invalid session: missing quiz session link" },
        { status: 400 }
      );
    }

    // Verify linked quiz session exists (security check)
    const quizSessionDoc = await adminFirestore
      .collection("quizSessions")
      .doc(data.quizSessionId)
      .get();

    if (!quizSessionDoc.exists) {
      return NextResponse.json(
        { error: "Linked quiz session not found" },
        { status: 404 }
      );
    }

    // Convert Firestore timestamps to ISO strings for client
    const session = {
      quizSessionId: data.quizSessionId,
      status: data.status || "idle",
      sockThickness: data.sockThickness || "thin",
      photo1: data.photo1 || undefined,
      photo2: data.photo2 || undefined,
      final: data.final || undefined,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt?.toISOString?.() || new Date().toISOString(),
      completedAt: data.completedAt instanceof Timestamp
        ? data.completedAt.toDate().toISOString()
        : data.completedAt?.toISOString?.() || undefined,
      errorMessage: data.errorMessage || undefined,
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching measurement session:", error);
    return NextResponse.json(
      { error: "Failed to fetch measurement session" },
      { status: 500 }
    );
  }
}


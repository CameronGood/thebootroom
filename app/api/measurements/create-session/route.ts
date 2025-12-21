import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizSessionId, sockThickness } = body as {
      quizSessionId?: string;
      sockThickness?: "thin" | "medium" | "thick";
    };

    if (!quizSessionId) {
      return NextResponse.json(
        { error: "quizSessionId is required" },
        { status: 400 }
      );
    }

    // Verify quiz session exists (matches existing app posture: sessions are readable)
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

    const sessionId = uuidv4();

    await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .set({
        quizSessionId,
        status: "idle",
        sockThickness: sockThickness || "thin",
        createdAt: new Date(),
      });

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error creating measurement session:", error);
    return NextResponse.json(
      { error: "Failed to create measurement session" },
      { status: 500 }
    );
  }
}




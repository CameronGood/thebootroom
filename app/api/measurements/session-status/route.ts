import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const docSnap = await adminFirestore
      .collection("measurementSessions")
      .doc(sessionId)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      sessionId,
      ...data,
      // normalize timestamps for the client
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt,
      completedAt: data?.completedAt?.toDate ? data.completedAt.toDate().toISOString() : data?.completedAt,
    });
  } catch (error) {
    console.error("Error reading measurement session:", error);
    return NextResponse.json(
      { error: "Failed to read session" },
      { status: 500 }
    );
  }
}




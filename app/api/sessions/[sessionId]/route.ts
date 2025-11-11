import { NextRequest, NextResponse } from "next/server";
import { getSession, createOrUpdateSession } from "@/lib/firestore/quizSessions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error("Get session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    
    await createOrUpdateSession(sessionId, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


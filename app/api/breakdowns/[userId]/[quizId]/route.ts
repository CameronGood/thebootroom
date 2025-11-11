import { NextRequest, NextResponse } from "next/server";
import { getFittingBreakdown } from "@/lib/firestore/fittingBreakdowns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; quizId: string }> }
) {
  try {
    const { userId, quizId } = await params;
    const breakdown = await getFittingBreakdown(userId, quizId);

    if (!breakdown) {
      return NextResponse.json(
        { error: "Breakdown not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Get breakdown API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

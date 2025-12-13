import { NextRequest, NextResponse } from "next/server";
import { getFittingBreakdownAdmin } from "@/lib/firestore/fittingBreakdowns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; quizId: string }> }
) {
  try {
    const { userId, quizId } = await params;

    // Use Admin SDK to bypass Firestore rules for server-side access
    const breakdown = await getFittingBreakdownAdmin(userId, quizId);

    if (!breakdown) {
      return NextResponse.json(
        { error: "Breakdown not found" },
        { status: 404 }
      );
    }

    // Verify the breakdown belongs to the requested user
    if (breakdown.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(breakdown);
  } catch (error: unknown) {
    console.error("Get breakdown API error:", error);
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);
    // If it's a permission error, return a helpful message
    if (errorCode === "permission-denied" || errorMessage.includes("permission") || errorMessage.includes("Missing or insufficient permissions")) {
      return NextResponse.json(
        { error: "Permission denied. Please ensure you're logged in and have access to this breakdown." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

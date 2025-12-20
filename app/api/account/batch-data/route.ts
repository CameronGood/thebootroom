import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firestore/quizSessions";
import { getFittingBreakdownAdmin } from "@/lib/firestore/fittingBreakdowns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizIds, userId } = body;

    if (!Array.isArray(quizIds) || !userId) {
      return NextResponse.json(
        { error: "quizIds array and userId are required" },
        { status: 400 }
      );
    }

    if (quizIds.length === 0) {
      return NextResponse.json({ sessions: {}, breakdowns: {} });
    }

    // Fetch all sessions in parallel using Firestore batch read
    const sessionPromises = quizIds.map(async (quizId: string) => {
      try {
        const session = await getSession(quizId);
        return { quizId, session };
      } catch (error) {
        console.error(`Error fetching session ${quizId}:`, error);
        return { quizId, session: null };
      }
    });

    // Fetch all breakdowns in parallel
    const breakdownPromises = quizIds.map(async (quizId: string) => {
      try {
        const breakdown = await getFittingBreakdownAdmin(userId, quizId);
        return { quizId, breakdown };
      } catch (error) {
        // Breakdown might not exist, which is fine
        return { quizId, breakdown: null };
      }
    });

    // Wait for all requests to complete
    const [sessionResults, breakdownResults] = await Promise.all([
      Promise.allSettled(sessionPromises),
      Promise.allSettled(breakdownPromises),
    ]);

    // Build response objects
    const sessions: Record<string, any> = {};
    const breakdowns: Record<string, any> = {};

    sessionResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value.session) {
        sessions[result.value.quizId] = result.value.session;
      }
    });

    breakdownResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value.breakdown) {
        breakdowns[result.value.quizId] = result.value.breakdown;
      }
    });

    return NextResponse.json({ sessions, breakdowns });
  } catch (error) {
    console.error("Batch data API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


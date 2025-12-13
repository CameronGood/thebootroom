import { NextRequest, NextResponse } from "next/server";
import { matchRequestSchema } from "@/lib/validators";
import { matchBoots } from "@/lib/matching";
import { createOrUpdateSessionAdmin } from "@/lib/firestore/quizSessionsAdmin";
import { listBootsAdmin } from "@/lib/firestore/bootsAdmin";
import { v4 as uuidv4 } from "uuid";

// Generate session ID if not provided
function getOrCreateSessionId(sessionId?: string): string {
  return sessionId || uuidv4();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = matchRequestSchema.parse(body);
    const sessionId = getOrCreateSessionId(validated.sessionId);

    // Fetch boots via Admin SDK to bypass client security rules
    const boots = await listBootsAdmin();

    // Run matching algorithm with preloaded boots
    const result = await matchBoots(validated.answers, boots);

    // Persist to quizSessions
    await createOrUpdateSessionAdmin(sessionId, {
      answers: validated.answers,
      recommendedBoots: result.boots,
      recommendedMondo: result.recommendedMondo,
      completedAt: new Date(),
    });

    return NextResponse.json({
      sessionId,
      recommendedMondo: result.recommendedMondo,
      boots: result.boots,
    });
  } catch (error: unknown) {
    console.error("Match API error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);

    if (error && typeof error === "object" && "name" in error && error.name === "ZodError" && "errors" in error) {
      console.error(
        "Validation errors:",
        JSON.stringify(error.errors, null, 2)
      );
      const zodErrors = error.errors as Array<{ path: (string | number)[]; message: string }>;
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
          message: zodErrors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}

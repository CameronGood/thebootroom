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

    // Debug: Log the raw body before validation
    console.log("\n=== API MATCH REQUEST DEBUG ===");
    console.log("Raw body received:", JSON.stringify(body, null, 2));
    console.log("body.answers.features:", body.answers?.features);
    console.log("body.answers.features type:", typeof body.answers?.features);
    console.log("body.answers.features is array?", Array.isArray(body.answers?.features));
    console.log("body.answers.features includes 'Rear Entry'?", body.answers?.features?.includes("Rear Entry"));
    console.log("body.answers.footWidth:", body.answers?.footWidth);
    console.log("body.answers.footWidth type:", typeof body.answers?.footWidth);
    if (body.answers?.footWidth) {
      console.log("footWidth keys:", Object.keys(body.answers.footWidth));
      console.log("footWidth.category:", body.answers.footWidth.category);
    }
    console.log("================================\n");

    const validated = matchRequestSchema.parse(body);

    // Debug: Log after validation
    console.log("\n=== AFTER VALIDATION ===");
    console.log("validated.answers.features:", validated.answers.features);
    console.log("validated.answers.features type:", typeof validated.answers.features);
    console.log("validated.answers.features is array?", Array.isArray(validated.answers.features));
    console.log("validated.answers.features includes 'Rear Entry'?", validated.answers.features.includes("Rear Entry"));
    console.log("validated.answers.footWidth:", validated.answers.footWidth);
    console.log("========================\n");

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
  } catch (error: any) {
    console.error("Match API error:", error);
    console.error("Error stack:", error.stack);

    if (error.name === "ZodError") {
      console.error(
        "Validation errors:",
        JSON.stringify(error.errors, null, 2)
      );
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
          message: error.errors
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    // More specific error messages
    const errorMessage = error.message || "Internal server error";
    return NextResponse.json(
      { error: errorMessage, details: error.stack },
      { status: 500 }
    );
  }
}

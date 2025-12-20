import { NextRequest, NextResponse } from "next/server";
import { matchRequestSchema } from "@/lib/validators";
import { matchBoots } from "@/lib/matching";
import { createOrUpdateSessionAdmin } from "@/lib/firestore/quizSessionsAdmin";
import { listBootsAdmin } from "@/lib/firestore/bootsAdmin";
import { v4 as uuidv4 } from "uuid";
import { generateBreakdown } from "@/lib/aiProvider";
import { saveFittingBreakdownAdmin } from "@/lib/firestore/fittingBreakdowns";

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

    // Check if user paid for comparison
    const paidForComparison = validated.answers.paidForComparison === true;
    const userId = paidForComparison ? body.userId : undefined;

    // Persist to quizSessions
    await createOrUpdateSessionAdmin(sessionId, {
      answers: validated.answers,
      recommendedBoots: result.boots,
      recommendedMondo: result.recommendedMondo,
      completedAt: new Date(),
      comparisonStatus: paidForComparison ? 'pending' : undefined,
    });

    // If user paid for comparison, trigger background generation
    if (paidForComparison && userId) {
      // Update status to generating immediately
      await createOrUpdateSessionAdmin(sessionId, {
        comparisonStatus: 'generating',
      });

      // Start comparison generation in background (don't await - fire and forget)
      (async () => {
        try {
          console.log('Starting background breakdown generation for session:', sessionId);
          
          // Generate breakdown using AI
          const sections = await generateBreakdown({
            answers: validated.answers,
            boots: result.boots,
            language: "en-GB",
          });

          if (!sections || sections.length === 0) {
            throw new Error('AI returned no sections');
          }

          // Calculate word count
          const wordCount = sections.reduce(
            (count, section) =>
              count + section.body.split(/\s+/).filter(Boolean).length,
            0
          );

          // Create breakdown object
          const breakdown = {
            language: "en-GB",
            modelProvider: "openai",
            modelName: "gpt-4o",
            wordCount,
            sections,
          };

          // Save breakdown to Firestore
          await saveFittingBreakdownAdmin(userId, sessionId, breakdown);
          
          // Update session with completed status
          await createOrUpdateSessionAdmin(sessionId, {
            comparisonStatus: 'completed',
          });
          
          console.log('Background breakdown generation completed for session:', sessionId);
        } catch (error) {
          console.error('Background breakdown generation failed:', error);
          // Update session with failed status
          await createOrUpdateSessionAdmin(sessionId, {
            comparisonStatus: 'failed',
          });
        }
      })();
    }

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

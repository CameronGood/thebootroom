import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/firestore/quizSessions";
import { generateBreakdown } from "@/lib/aiProvider";
import { saveFittingBreakdownAdmin } from "@/lib/firestore/fittingBreakdowns";
import { getFittingBreakdownAdmin } from "@/lib/firestore/fittingBreakdowns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, quizId, selectedModels } = body;

    if (!userId || !quizId) {
      return NextResponse.json(
        { error: "Missing userId or quizId" },
        { status: 400 }
      );
    }

    // If we already have a stored breakdown for this user/quiz, return it immediately
    try {
      const existing = await getFittingBreakdownAdmin(userId, quizId);
      if (existing?.sections?.length) {
        return NextResponse.json({
          success: true,
          message: "Breakdown already generated",
          breakdown: existing,
        });
      }
    } catch (existingErr) {
      console.warn("Existing breakdown lookup failed, continuing to generate", existingErr);
    }

    // Fetch quiz session
    const session = await getSession(quizId);
    if (!session || !session.answers || !session.recommendedBoots) {
      return NextResponse.json(
        { error: "Session not found or incomplete" },
        { status: 404 }
      );
    }

    // Filter boots to only include selected models if provided
    let bootsToInclude = session.recommendedBoots;
    if (selectedModels && typeof selectedModels === 'object' && Object.keys(selectedModels).length > 0) {
      bootsToInclude = session.recommendedBoots
        .map(boot => {
          const selectedIndices = selectedModels[boot.bootId];
          
          // If boot has models array, check if any are selected
          if (boot.models && boot.models.length > 0) {
            // If no selected indices for this boot, exclude it entirely
            if (!selectedIndices || !Array.isArray(selectedIndices) || selectedIndices.length === 0) {
              return null; // Will be filtered out
            }
            
            // Filter models to only include selected ones
            const filteredModels = boot.models.filter((_, index) => 
              selectedIndices.includes(index)
            );
            
            // If no models remain after filtering, exclude the boot
            if (filteredModels.length === 0) {
              return null; // Will be filtered out
            }
            
            return {
              ...boot,
              models: filteredModels,
            };
          }
          
          // Boot without models array (single model boot) - only include if selected
          // Single-model boots use index 0 to represent the single model
          if (!selectedIndices || !Array.isArray(selectedIndices) || !selectedIndices.includes(0)) {
            return null; // Will be filtered out - boot not selected
          }
          
          // Boot is selected, include it
          return boot;
        })
        .filter((boot): boot is typeof session.recommendedBoots[0] => boot !== null);
    }

    // Generate breakdown using GPT-4o
    let sections;
    try {
      sections = await generateBreakdown({
        answers: session.answers,
        boots: bootsToInclude,
        language: "en-GB",
      });
    } catch (error: unknown) {
      console.error("generateBreakdown error:", error);
      return NextResponse.json(
        { 
          error: "Failed to generate breakdown",
          details: error instanceof Error ? error.message : "Unknown error occurred during breakdown generation"
        },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      console.error("generateBreakdown returned empty sections array");
      return NextResponse.json(
        { 
          error: "Failed to generate breakdown",
          details: "AI returned no sections"
        },
        { status: 500 }
      );
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

    // Save breakdown to Firestore - MUST succeed before returning
    try {
      await saveFittingBreakdownAdmin(userId, quizId, breakdown);
    } catch (saveError: any) {
      console.error("✗ CRITICAL: Failed to save breakdown to Firestore");
      console.error("Save error details:", {
        userId,
        quizId,
        errorMessage: saveError?.message,
        errorCode: saveError?.code,
        errorStack: saveError?.stack,
        errorType: saveError?.constructor?.name,
      });
      // Still return breakdown so user can see it, but log the failure
      // Breakdown will be lost on refresh, but at least user can view it now
      console.warn("⚠ Returning breakdown despite save failure - it will not persist");
    }

    // Return breakdown (save should have succeeded, but return even if it failed)
    return NextResponse.json({ 
      success: true,
      message: "Breakdown generated successfully",
      breakdown,
    });
  } catch (error: unknown) {
    console.error("Error generating breakdown:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

import OpenAI from "openai";
import { QuizAnswers, BootSummary, FittingBreakdownSection } from "@/types";
import { calculateAcceptableFlexRange, getFlexRangeString, getTargetFlex } from "@/lib/flexRange";
import { getUserWidthCategory } from "@/lib/utils/widthCategory";
import { shoeSizeToFootLengthMM } from "@/lib/mondo-conversions";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBreakdown({
  answers,
  boots,
  language = "en-GB",
}: {
  answers: QuizAnswers;
  boots: BootSummary[];
  language?: string;
}): Promise<FittingBreakdownSection[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    throw new Error("OPENAI_API_KEY not configured");
  }

  if (!boots || boots.length === 0) {
    throw new Error("No boots provided for breakdown generation");
  }

  if (!answers) {
    throw new Error("No answers provided for breakdown generation");
  }

  try {
    // Calculate user width category using the SAME logic as matching algorithm
    let userWidthCategory: "Narrow" | "Average" | "Wide" | null = null;
    let userFootLengthMM: number | null = null;
    let userFootWidthMM: number | null = null;

    // Get foot length from mm measurements or convert from shoe size
    if (answers.footLengthMM) {
      userFootLengthMM = Math.min(
        answers.footLengthMM.left,
        answers.footLengthMM.right
      );
    } else if (answers.shoeSize) {
      const estimatedLength = shoeSizeToFootLengthMM(
        answers.shoeSize.system,
        answers.shoeSize.value
      );
      if (estimatedLength !== null) {
        userFootLengthMM = estimatedLength;
      }
    }

    // Get foot width from mm measurements
    // IMPORTANT: This must match the EXACT logic in matching.ts
    if (answers.footWidth && "left" in answers.footWidth) {
      const left = answers.footWidth.left || 0;
      const right = answers.footWidth.right || 0;
      const validWidths = [left, right].filter((v) => v > 0);
      if (validWidths.length > 0) {
        userFootWidthMM = Math.min(...validWidths);
      }
    }

    // Calculate width category - PRIORITIZE manual category if provided
    // Priority 1: Manual category selection (user's explicit choice takes precedence)
    if (answers.footWidth && "category" in answers.footWidth) {
      userWidthCategory = (answers.footWidth as any).category as "Narrow" | "Average" | "Wide";
      console.log(`[Breakdown Width Calculation] Using manual category (PRIORITY): ${userWidthCategory}`);
    }
    // Priority 2: Calculate from measurements (mm or converted from shoe size)
    else if (userFootLengthMM && userFootWidthMM) {
      userWidthCategory = getUserWidthCategory(
        answers.gender,
        userFootLengthMM,
        userFootWidthMM
      );
      console.log(`[Breakdown Width Calculation] Calculated from measurements: ${answers.gender}, ${userFootLengthMM}mm length, ${userFootWidthMM}mm width → ${userWidthCategory}`);
    } else {
      console.warn(`[Breakdown Width Calculation] Could not determine width category from answers:`, answers.footWidth);
    }

    if (!userWidthCategory) {
      console.error("[Breakdown Width Calculation] userWidthCategory is null - this should not happen");
      throw new Error("Unable to determine user width category for breakdown generation");
    }

    console.log(`[Breakdown Width Calculation] FINAL userWidthCategory: ${userWidthCategory}`);
    console.log(`[Breakdown Width Calculation] Raw footWidth from answers:`, JSON.stringify(answers.footWidth));
    
    // At this point, userWidthCategory is guaranteed to be non-null
    const finalWidthCategory: "Narrow" | "Average" | "Wide" = userWidthCategory;

    // Build user profile with the calculated width category
    const userProfile = `
User Profile:
- Gender: ${answers.gender}
- Weight: ${answers.weightKG}kg
- Ability: ${answers.ability}
- Foot Width Category: ${finalWidthCategory} (THIS IS THE EXACT CATEGORY - USE THIS VALUE EXACTLY)
- Instep Height: ${answers.instepHeight}
- Ankle Volume: ${answers.ankleVolume}
- Calf Volume: ${answers.calfVolume}
- Boot Type: ${answers.bootType}
`;

    // Calculate user's foot length if available for range comparisons
    let userFootLengthInfo = "";
    if (answers.footLengthMM) {
      const smallerFoot = Math.min(answers.footLengthMM.left, answers.footLengthMM.right);
      userFootLengthInfo = `\n- Foot Length: ${smallerFoot}mm (recommended mondo size would be around ${Math.round(smallerFoot / 10) * 10})`;
    } else if (answers.shoeSize) {
      userFootLengthInfo = `\n- Shoe Size: ${answers.shoeSize.value} ${answers.shoeSize.system}`;
    }

    // Calculate acceptable flex range using shared utility
    const flexRange = getFlexRangeString(answers);
    const targetFlex = getTargetFlex(answers);

    // Log boot data for debugging
    console.log(`[Breakdown] Generating for ${boots.length} boots. User width category: ${finalWidthCategory}`);
    boots.forEach((boot, idx) => {
      console.log(`[Breakdown Boot ${idx + 1}] ${boot.brand} ${boot.model} - Width: ${boot.bootWidth || "MISSING"}, Score: ${boot.score}`);
    });

    const bootsInfo = boots
      .map(
        (boot, idx) => `
Boot ${idx + 1} (bootId: ${boot.bootId}): ${boot.brand} ${boot.model}
- Match Score: ${boot.score}/100
- Width Category: ${boot.bootWidth || "Not specified"}${boot.lastWidthMM ? ` (Last Width: ${boot.lastWidthMM}mm)` : ""}
- Toe Box Shape: ${boot.toeBoxShape || "Not specified"}
- Instep Height: ${boot.instepHeight?.join(", ") || "Not specified"}
- Ankle Volume: ${boot.ankleVolume?.join(", ") || "Not specified"}
- Calf Volume: ${boot.calfVolume?.join(", ") || "Not specified"}
- Flex: ${boot.flex}
${boot.models && boot.models.length > 0 ? `- Available Models: ${boot.models.map(m => `${m.model} (Flex ${m.flex})`).join(", ")}` : ""}`
      )
      .join("\n");

    const prompt = `You are a warm, experienced ski boot fitter. Write personalised breakdowns for each recommended boot.

USER PROFILE (use these exact values - do NOT calculate or infer anything):
${userProfile}${userFootLengthInfo}

CRITICAL: USER'S FOOT WIDTH CATEGORY IS: ${finalWidthCategory}
YOU MUST ALWAYS REFER TO THE USER AS HAVING "${finalWidthCategory.toLowerCase()}" FEET.
- If the category is "Average", say "average feet" or "average-width feet"
- If the category is "Narrow", say "narrow feet" or "narrow-width feet"  
- If the category is "Wide", say "wide feet" or "wide-width feet"
- NEVER use a different width category than ${finalWidthCategory}

RECOMMENDED FLEX RANGE: ${flexRange} (Target: ${targetFlex})

RECOMMENDED BOOTS:
${bootsInfo}

IMPORTANT: 
- Use ONLY the values provided above. Do NOT calculate, infer, or assume anything.
- Each boot has specific specifications shown above - use those exact values.
- The user's width category is ${finalWidthCategory} - always use this when describing their feet.
- Compare the user's ${finalWidthCategory} width to each boot's width category.

For EACH boot, write 4-6 bullet points (each 1-2 sentences max). Format each point with "- " at the start. Do NOT include headings in the body text.

Include these points:
1. Width compatibility - User has ${finalWidthCategory.toLowerCase()} feet (category: ${finalWidthCategory}). Compare to this boot's width category (shown in the boot specs above). Use natural language.
2. Instep compatibility - User has ${answers.instepHeight} instep. Compare to this boot's instep height support.
3. Ankle volume - User has ${answers.ankleVolume} ankle. Compare to this boot's ankle volume.
4. Calf volume - User has ${answers.calfVolume} calf. Compare to this boot's calf volume.
5. Fit expectations - Out-of-box fit expectations and any adjustments needed.

Rules:
- Use ONLY the values provided above. Do NOT calculate or infer anything.
- Always say "${finalWidthCategory.toLowerCase()} feet" when referring to the user's width.
- Keep each point to 1-2 sentences.
- Use natural, warm language but stay concise.
- Never say "perfect fit" - use "great out-of-box fit", "excellent initial fit", or "strong match" instead.

Use British English spelling. Write in a warm, expert tone. Do NOT mention prices or retailers.

Return ONLY a JSON object with this exact structure:
{
  "sections": [
    {
      "bootId": "boot-id-1",
      "heading": "[Brand] [Model]",
      "body": "[Write 4-6 bullet points (each 1-2 sentences), formatted with '- ' at the start. Use ONLY the values provided above - do NOT calculate or infer anything. User's width category is ${finalWidthCategory} - always say '${finalWidthCategory.toLowerCase()} feet' when referring to their width. Compare: (1) User's ${finalWidthCategory} width vs this boot's width category, (2) User's ${answers.instepHeight} instep vs this boot's instep support, (3) User's ${answers.ankleVolume} ankle vs this boot's ankle volume, (4) User's ${answers.calfVolume} calf vs this boot's calf volume, (5) Fit expectations. Use natural, warm language. Never say 'perfect fit'. Use British English.]"
    },
    {
      "bootId": "boot-id-2",
      "heading": "[Brand] [Model]",
      "body": "[Same structure as above. User's width category is ${finalWidthCategory} - always say '${finalWidthCategory.toLowerCase()} feet'. Use only the values provided above.]"
    },
    {
      "bootId": "boot-id-3",
      "heading": "[Brand] [Model]",
      "body": "[Same structure as above. User's width category is ${finalWidthCategory} - always say '${finalWidthCategory.toLowerCase()} feet'. Use only the values provided above.]"
    }
  ]
}

IMPORTANT: Generate one section per boot. Use the exact bootId provided. Each section should be 4-6 bullet points (1-2 sentences each), formatted with '- ' at the start. Use ONLY the values provided above - do NOT calculate, infer, or assume anything. User's width category is ${finalWidthCategory} - always say '${finalWidthCategory.toLowerCase()} feet'. Use natural, warm language. Vary phrasing between boots. Do NOT mention flex. Never say "perfect fit" - use "great out-of-box fit", "excellent initial fit", or "strong match" instead.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, experienced ski boot fitter who genuinely cares about helping customers find their perfect fit. Write naturally and conversationally, as if explaining to a friend who's sitting across from you. Be specific and accurate, but make it personal and engaging.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1200, // Increased for more detailed match score breakdown (150-200 words per boot)
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      console.error("OpenAI returned empty response", {
        completion: completion.choices[0],
        usage: completion.usage,
      });
      throw new Error("No response from OpenAI - empty content");
    }

    // Parse JSON response - OpenAI with json_object format returns an object
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error("Failed to parse OpenAI JSON response:", parseError);
      console.error("Response text:", responseText);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Handle both { sections: [...] } and direct array formats
    let sections = [];
    if (Array.isArray(parsed)) {
      sections = parsed;
    } else if (parsed.sections && Array.isArray(parsed.sections)) {
      sections = parsed.sections;
    } else {
      // Try to find any array in the response
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          sections = parsed[key];
          break;
        }
      }
    }

    if (!sections || sections.length === 0) {
      console.error("No sections found in parsed response:", parsed);
      throw new Error("AI response did not contain any breakdown sections");
    }

    console.log(`Successfully parsed ${sections.length} sections from AI response`);

    // Ensure bootIds match and process each boot individually
    return boots.map((boot, idx) => {
      // Find matching section by bootId or use index
      const section = sections.find((s: any) => s.bootId === boot.bootId) || sections[idx];
      
      if (!section) {
        return {
          bootId: boot.bootId,
          heading: `${boot.brand} ${boot.model}`,
          body: `This boot is an excellent match based on your profile.`,
        };
      }

      return {
        bootId: section.bootId || boot.bootId || `boot-${idx}`,
        heading: section.heading || `${boot.brand} ${boot.model}`,
      body: section.body || "",
      };
    });
  } catch (error: any) {
    console.error("Error generating breakdown:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data || error?.response,
      status: error?.status,
    });
    throw error; // Re-throw to let the API route handle it with proper error messages
  }
}

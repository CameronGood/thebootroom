import { Boot, QuizAnswers, BootSummary, Gender, Ability, BootType } from "../types";
import { listBoots } from "./firestore/boots";
import {
  calculateRecommendedMondo,
  shoeSizeToMondo,
} from "./mondo-conversions";

// Extended Boot type with bootId
type BootWithId = Boot & { bootId: string };

// Get acceptable flex values based on gender, ability, and weight
// Returns an array of flex values that are acceptable for this user
export function getAcceptableFlexValues(
  gender: Gender,
  ability: Ability,
  weightKG: number
): number[] {
  let baseFlexes: number[];

  if (gender === "Male") {
    switch (ability) {
      case "Beginner":
        baseFlexes = [80, 90]; // Available flex values for beginners
        break;
      case "Intermediate":
        baseFlexes = [100, 110]; // Available flex values for intermediates
        break;
      case "Advanced":
        baseFlexes = [120, 130]; // Available flex values for advanced
        break;
    }
    // Adjust for weight: <60kg → shift range down by 10, >95kg → shift range up by 10
    if (weightKG < 60) {
      // Shift down: [90, 100] → [80, 90], [100, 110] → [90, 100], [120, 130] → [110, 120]
      baseFlexes = baseFlexes.map((flex) => Math.max(70, flex - 10));
    } else if (weightKG > 95) {
      // Shift up: [90, 100] → [100, 110], [100, 110] → [110, 120], [120, 130] → [130, 140]
      baseFlexes = baseFlexes.map((flex) => flex + 10);
    }
  } else {
    // Female
    switch (ability) {
      case "Beginner":
        baseFlexes = [65, 75, 80, 85]; // Available flex values for beginners
        break;
      case "Intermediate":
        baseFlexes = [90, 95, 100]; // Available flex values for intermediates
        break;
      case "Advanced":
        baseFlexes = [105, 110, 115]; // Available flex values for advanced
        break;
    }
    // Adjust for weight: <50kg → shift range down by 10, >80kg → shift range up by 10
    if (weightKG < 50) {
      // Shift down: [85, 95] → [75, 85], [95, 105] → [85, 95], [105, 115] → [95, 105]
      baseFlexes = baseFlexes.map((flex) => Math.max(70, flex - 10));
    } else if (weightKG > 80) {
      // Shift up: [85, 95] → [95, 105], [95, 105] → [105, 115], [105, 115] → [115, 125]
      baseFlexes = baseFlexes.map((flex) => flex + 10);
    }
  }

  // Remove duplicates and sort
  return [...new Set(baseFlexes)].sort((a, b) => a - b);
}

// Calculate target flex (closest acceptable value) - kept for backwards compatibility
// This finds the midpoint of acceptable values for scoring purposes
export function calculateTargetFlex(
  gender: Gender,
  ability: Ability,
  weightKG: number
): number {
  const acceptableFlexes = getAcceptableFlexValues(gender, ability, weightKG);
  // Return the midpoint of acceptable flexes for scoring
  const sum = acceptableFlexes.reduce((a, b) => a + b, 0);
  return sum / acceptableFlexes.length;
}

// Calculate user width in mm from answers
function getUserWidthMM(answers: QuizAnswers): number | null {
  if (!answers.footWidth) {
    return null;
  }

  // Check if it has left/right properties (mm measurement)
  if ("left" in answers.footWidth || "right" in answers.footWidth) {
    const width = answers.footWidth as { left?: number; right?: number };
    const left = width.left || 0;
    const right = width.right || 0;
    // Use minimum width - easier to create space than make boot smaller
    // Only consider non-zero values
    const validWidths = [left, right].filter((w) => w > 0);
    if (validWidths.length === 0) {
      return null;
    }
    const minWidth = Math.min(...validWidths);
    return minWidth;
  }

  // If it has category, return null (no mm measurement)
  return null;
}

// Calculate width score (max 30 points)
// Takes instep height into account: High instep prefers wider boots, Low instep prefers narrower boots
function calculateWidthScore(
  userWidthMM: number | null,
  bootWidthMM: number,
  instepHeight: "Low" | "Medium" | "High",
  widthCategory?: "Narrow" | "Average" | "Wide"
): number {
  let targetWidth: number | null = null;

  // Priority 1: If we have a specific mm measurement, use it directly (ignore category)
  if (userWidthMM !== null) {
    targetWidth = userWidthMM;
  }
  // Priority 2: If no mm measurement but category is selected, use category's default mm
  else if (widthCategory) {
    if (widthCategory === "Narrow") {
      targetWidth = 98; // Narrow category = 98mm (for scoring purposes)
    } else if (widthCategory === "Average") {
      targetWidth = 100; // Average category = 100mm
    } else if (widthCategory === "Wide") {
      targetWidth = 102; // Wide category = 102mm
    }
  }

  // If we have a target width, calculate score based on difference
  if (targetWidth !== null) {
    const isSimplifiedInput = userWidthMM === null && widthCategory !== undefined;
    
    // For Narrow category, give full points for both 96mm and 98mm boots
    if (isSimplifiedInput && widthCategory === "Narrow") {
      if (bootWidthMM === 96 || bootWidthMM === 98) {
        return 30; // Full points for both 96mm and 98mm
      }
      // For other widths, calculate based on distance from 98mm
      const widthDelta = Math.abs(98 - bootWidthMM);
      return Math.max(0, 30 - widthDelta * 6);
    }
    
    const widthDelta = Math.abs(targetWidth - bootWidthMM);
    let widthScore = Math.max(0, 30 - widthDelta * 6); // Max 30 points, -6 per mm difference

    // For simplified inputs (categories), give full score on exact match
    // For mm measurements, apply instep height adjustments for better matching
    if (isSimplifiedInput && widthDelta === 0) {
      // Exact match with simplified input → full points
      return 30;
    }

    // Adjust score based on instep height when boot width is within 2mm of target
    // Only apply these adjustments for mm measurements, not simplified inputs
    // This ensures that when user is between two boot widths, we choose the appropriate one
    // High instep: prefer wider boots (more volume for high instep)
    // Low instep: prefer narrower boots (less volume for low instep)
    if (!isSimplifiedInput && widthDelta <= 2) {
      if (instepHeight === "High") {
        // High instep: prefer wider boots
        // Examples: 98mm user → prefer 100mm over 98mm, 101mm user → prefer 102mm over 100mm
        if (bootWidthMM > targetWidth) {
          // Boot is wider than target - strong bonus for high instep
          // Example: 98mm user, 100mm boot gets bonus
          widthScore += 22; // Strong bonus to prefer wider boot
          widthScore = Math.min(30, widthScore); // Cap at max
        } else if (bootWidthMM === targetWidth) {
          // Boot matches target exactly - small penalty for high instep (we want wider)
          widthScore -= 5; // Small penalty to prefer wider boots when available
          widthScore = Math.max(0, widthScore);
        } else if (bootWidthMM < targetWidth) {
          // Boot is narrower than target - strong penalty for high instep
          widthScore -= 30; // Strong penalty to avoid narrower boot
          widthScore = Math.max(0, widthScore);
        }
      } else if (instepHeight === "Low") {
        // Low instep: prefer narrower boots
        // Examples: 102mm user → prefer 100mm over 102mm, 99mm user → prefer 98mm over 100mm
        if (bootWidthMM < targetWidth) {
          // Boot is narrower than target - strong bonus for low instep
          // Example: 102mm user, 100mm boot gets bonus
          widthScore += 22; // Strong bonus to prefer narrower boot
          widthScore = Math.min(30, widthScore); // Cap at max
        } else if (bootWidthMM === targetWidth) {
          // Boot matches target exactly - small penalty for low instep (we want narrower)
          widthScore -= 5; // Small penalty to prefer narrower boots when available
          widthScore = Math.max(0, widthScore);
        } else if (bootWidthMM > targetWidth) {
          // Boot is wider than target - strong penalty for low instep
          widthScore -= 30; // Strong penalty to avoid wider boot
          widthScore = Math.max(0, widthScore);
        }
      }
      // Medium instep: no adjustment, use base score
    }

    return widthScore;
  }

  // No width data at all
  return 0;
}

// Calculate flex score (max 10 points)
// Scores based on how close the boot's flex is to any acceptable flex value
function calculateFlexScore(
  bootFlex: number,
  acceptableFlexes: number[]
): number {
  // Find the minimum distance to any acceptable flex value
  const minDelta = Math.min(
    ...acceptableFlexes.map((acceptableFlex) =>
      Math.abs(bootFlex - acceptableFlex)
    )
  );

  // Score: full points for exact match, decreasing by 0.67 per flex difference (10 max / 15 flex tolerance ≈ 0.67)
  const flexScore = Math.max(0, 10 - minDelta * 0.67);
  return flexScore;
}

// Helper function to calculate proximity score for volume/height attributes
// Hierarchy: Low (0) < Medium (1) < High (2)
function calculateProximityScore(
  userValue: "Low" | "Medium" | "High",
  bootValue: "Low" | "Medium" | "High",
  maxPoints: number
): number {
  if (userValue === bootValue) {
    return maxPoints; // Exact match: full points
  }

  // Convert to numeric values for distance calculation
  const valueMap: Record<"Low" | "Medium" | "High", number> = {
    Low: 0,
    Medium: 1,
    High: 2,
  };

  const userNum = valueMap[userValue];
  const bootNum = valueMap[bootValue];
  const distance = Math.abs(userNum - bootNum);

  if (distance === 1) {
    // One step away (e.g., High → Medium, Low → Medium): 50% of max points
    return maxPoints * 0.5;
  } else if (distance === 2) {
    // Two steps away (e.g., High → Low, Low → High): 25% of max points
    return maxPoints * 0.25;
  }

  return 0;
}

// Calculate shape/volume scores (max 50 points total: 5, 20, 15, 10)
function calculateShapeScores(
  answers: QuizAnswers,
  boot: Boot
): { toeScore: number; instepScore: number; ankleScore: number; calfScore: number } {
  const toeScore = answers.toeShape === boot.toeBoxShape ? 5 : 0;
  // Instep: prioritize closest match (High → Medium → Low)
  const instepScore = calculateProximityScore(
    answers.instepHeight,
    boot.instepHeight,
    20
  );
  // Ankle: prioritize closest match (High → Medium → Low)
  const ankleScore = calculateProximityScore(
    answers.ankleVolume,
    boot.ankleVolume,
    15
  );
  // Calf: prioritize closest match (High → Medium → Low)
  const calfScore = calculateProximityScore(
    answers.calfVolume,
    boot.calfVolume,
    10
  );
  return { toeScore, instepScore, ankleScore, calfScore };
}

// Calculate feature affinity score (max 10 points)
function calculateFeatureScore(answers: QuizAnswers, boot: Boot): number {
  // If no features are selected, award full points (user doesn't need specific features)
  if (!answers.features || answers.features.length === 0) {
    return 10;
  }
  
  let featureScore = 0;
  if (answers.features.includes("Walk Mode") && boot.walkMode) {
    featureScore += 4;
  }
  if (answers.features.includes("Rear Entry") && boot.rearEntry) {
    featureScore += 4;
  }
  if (answers.features.includes("Calf Adjustment") && boot.calfAdjustment) {
    featureScore += 2; // Last feature gets 2 points to total 10
  }
  return featureScore;
}

// Filter boots based on hard requirements
function filterBoots(
  boots: BootWithId[],
  answers: QuizAnswers,
  userWidthMM: number | null,
  widthCategory: "Narrow" | "Average" | "Wide" | undefined,
  acceptableFlexes: number[]
): BootWithId[] {
  return boots.filter((boot) => {
    // Gender must match
    if (boot.gender !== answers.gender) {
      return false;
    }

    // Filter by flex - boot must have an acceptable flex value for the user's ability
    if (!acceptableFlexes.includes(boot.flex)) {
      return false;
    }

    // Filter by boot type - must match the selected type
    if (answers.bootType) {
      let bootTypeMatches = false;
      if (typeof boot.bootType === "string") {
        bootTypeMatches = boot.bootType === answers.bootType;
      } else if (typeof boot.bootType === "object" && boot.bootType !== null) {
        // Handle legacy object format for backwards compatibility
        const bootTypeObj = boot.bootType as any;
        bootTypeMatches =
          (answers.bootType === "Standard" && bootTypeObj.standard) ||
          (answers.bootType === "Freestyle" && bootTypeObj.freestyle) ||
          (answers.bootType === "Hybrid" && bootTypeObj.hybrid) ||
          (answers.bootType === "Touring" && bootTypeObj.touring);
      }
      if (!bootTypeMatches) {
        return false;
      }
    }

    // All selected features must be present on the boot
    // Ensure features is an array (safety check)
    const features = answers.features || [];
    
    if (features.includes("Walk Mode") && !boot.walkMode) {
      return false;
    }
    if (features.includes("Rear Entry") && !boot.rearEntry) {
      return false;
    }
    if (features.includes("Calf Adjustment") && !boot.calfAdjustment) {
      return false;
    }

    // Filter by width - boot must be >= user's minimum width
    // Since it's easier to create space than make boot smaller, we use minimum width
    // But we prefer closer matches, so filter out boots that are too much larger
    if (userWidthMM !== null) {
      // Boot width must be >= user's minimum width (can't be smaller)
      // But also filter out boots that are more than 2mm larger for better matching
      if (boot.lastWidthMM < userWidthMM) {
        return false; // Boot is too narrow (smaller than user's foot)
      }
      // Only allow boots up to 1mm larger than user's width for tighter matching
      // This means: 98mm user → allows 98mm, 99mm boots (not 100mm+)
      if (boot.lastWidthMM > userWidthMM + 1) {
        return false; // Boot is too much larger (more than 1mm)
      }
    } else if (widthCategory) {
      // If using category, filter based on category ranges
      if (widthCategory === "Narrow") {
        // Narrow feet: prefer boots 96-98mm
        if (boot.lastWidthMM < 96 || boot.lastWidthMM > 98) {
          return false;
        }
      } else if (widthCategory === "Average") {
        // Average feet (100mm): prefer boots 100-102mm
        if (boot.lastWidthMM < 100 || boot.lastWidthMM > 102) {
          return false;
        }
      } else if (widthCategory === "Wide") {
        // Wide feet (102mm): prefer boots 102-104mm
        if (boot.lastWidthMM < 102 || boot.lastWidthMM > 104) {
          return false;
        }
      }
    }

    return true;
  });
}

// Score a single boot
function scoreBoot(
  boot: BootWithId,
  answers: QuizAnswers,
  acceptableFlexes: number[],
  userWidthMM: number | null,
  widthCategory?: "Narrow" | "Average" | "Wide"
): number {
  const widthScore = calculateWidthScore(
    userWidthMM,
    boot.lastWidthMM,
    answers.instepHeight,
    widthCategory
  );
  const flexScore = calculateFlexScore(boot.flex, acceptableFlexes);
  const { toeScore, instepScore, ankleScore, calfScore } = calculateShapeScores(
    answers,
    boot
  );
  const featureScore = calculateFeatureScore(answers, boot);

  return (
    widthScore +
    flexScore +
    toeScore +
    instepScore +
    ankleScore +
    calfScore +
    featureScore
  );
}

// Main matching function
export async function matchBoots(
  answers: QuizAnswers
): Promise<{ boots: BootSummary[]; recommendedMondo: string }> {
  // Get all boots
  const allBoots = await listBoots();

  if (allBoots.length === 0) {
    throw new Error("No boots found in database. Please import boots first.");
  }

  // Get acceptable flex values (discrete values like 100, 110)
  const acceptableFlexes = getAcceptableFlexValues(
    answers.gender,
    answers.ability,
    answers.weightKG
  );

  // Also calculate target flex for display/debugging (midpoint of acceptable values)
  const targetFlex = calculateTargetFlex(
    answers.gender,
    answers.ability,
    answers.weightKG
  );

  // Get user width data
  const userWidthMM = getUserWidthMM(answers);

  // Extract width category - handle both union type structures
  let widthCategory: "Narrow" | "Average" | "Wide" | undefined = undefined;
  if (answers.footWidth) {
    const footWidth = answers.footWidth as any; // Use any to bypass type checking for runtime check
    // Check if it has a category property (not left/right)
    if (footWidth.category && !footWidth.left && !footWidth.right) {
      widthCategory = footWidth.category;
    } else if ("category" in footWidth) {
      widthCategory = footWidth.category;
    }
  }

  // Debug width data - ALWAYS log this
  console.log("\n=== WIDTH DATA DEBUG ===");
  console.log("footWidth from answers:", answers.footWidth);
  console.log("footWidth JSON:", JSON.stringify(answers.footWidth, null, 2));
  console.log("footWidth type:", typeof answers.footWidth);
  console.log(
    "footWidth keys:",
    answers.footWidth ? Object.keys(answers.footWidth) : "null/undefined"
  );
  console.log(
    "has category property?:",
    answers.footWidth && "category" in answers.footWidth
  );
  console.log(
    "category value:",
    answers.footWidth && "category" in answers.footWidth
      ? (answers.footWidth as any).category
      : "N/A"
  );
  console.log("userWidthMM:", userWidthMM);
  console.log("widthCategory extracted:", widthCategory);
  console.log("========================\n");

  // Filter boots (need width data for filtering)
  const filteredBoots = filterBoots(
    allBoots,
    answers,
    userWidthMM,
    widthCategory,
    acceptableFlexes
  );

  if (filteredBoots.length === 0) {
    throw new Error(
      `No boots match your criteria. Found ${allBoots.length} total boots, but none match gender: ${answers.gender}, ability: ${answers.ability} (flex: [${acceptableFlexes.join(", ")}]), bootType: ${answers.bootType}, features: ${answers.features?.join(", ") || "none"}`
    );
  }

  // Score all filtered boots
  const scoredBoots = filteredBoots.map((boot, index) => {
    const widthScore = calculateWidthScore(
      userWidthMM,
      boot.lastWidthMM,
      answers.instepHeight,
      widthCategory
    );
    const flexScore = calculateFlexScore(boot.flex, acceptableFlexes);
    const { toeScore, instepScore, ankleScore, calfScore } = calculateShapeScores(
      answers,
      boot
    );
    const featureScore = calculateFeatureScore(answers, boot);
    const score =
      widthScore +
      flexScore +
      toeScore +
      instepScore +
      ankleScore +
      calfScore +
      featureScore;

    return {
      boot,
      score,
      widthScore,
      flexScore,
      isFiltered: true, // Mark as passing filters
    };
  });

  // If we have fewer than 3 filtered boots, score remaining boots to fill up to 3
  // This includes boots that don't match features (e.g., don't have Walk Mode or Rear Entry)
  // But flex is still a hard requirement - only include boots with acceptable flex values
  if (scoredBoots.length < 3) {
    const filteredBootIds = new Set(filteredBoots.map(b => b.bootId));
    const remainingBoots = allBoots.filter(boot => 
      !filteredBootIds.has(boot.bootId) && 
      acceptableFlexes.includes(boot.flex) &&
      boot.gender === answers.gender
    );
    
    // Check if we're filtering by features
    const features = answers.features || [];
    const hasFeatureFilters = features.length > 0;
    const featureFilterInfo = hasFeatureFilters 
      ? ` (including boots without required features: ${features.join(", ")})`
      : "";
    
    console.log(`\n[MatchBoots] Only ${scoredBoots.length} boots match all filters. Scoring ${remainingBoots.length} remaining boots to fill up to 3 results${featureFilterInfo}.`);
    
    const additionalScoredBoots = remainingBoots.map((boot) => {
      const widthScore = calculateWidthScore(
        userWidthMM,
        boot.lastWidthMM,
        answers.instepHeight,
        widthCategory
      );
      const flexScore = calculateFlexScore(boot.flex, acceptableFlexes);
      const { toeScore, instepScore, ankleScore, calfScore } = calculateShapeScores(
        answers,
        boot
      );
      const featureScore = calculateFeatureScore(answers, boot);
      const score =
        widthScore +
        flexScore +
        toeScore +
        instepScore +
        ankleScore +
        calfScore +
        featureScore;

      return {
        boot,
        score,
        widthScore,
        flexScore,
        isFiltered: false, // Mark as not passing filters (may be missing required features)
      };
    });
    
    // Add additional boots to the scored list
    scoredBoots.push(...additionalScoredBoots);
    
    // Log which boots are being added that don't have required features
    if (hasFeatureFilters) {
      const bootsWithoutFeatures = additionalScoredBoots
        .filter(({ boot }) => {
          if (features.includes("Walk Mode") && !boot.walkMode) return true;
          if (features.includes("Rear Entry") && !boot.rearEntry) return true;
          if (features.includes("Calf Adjustment") && !boot.calfAdjustment) return true;
          return false;
        })
        .slice(0, 3 - scoredBoots.length + additionalScoredBoots.length)
        .map(({ boot, score }) => `${boot.brand} ${boot.model} (score: ${score.toFixed(1)})`);
      
      if (bootsWithoutFeatures.length > 0) {
        console.log(`[MatchBoots] Adding boots without required features to fill results:`, bootsWithoutFeatures);
      }
    }
  }

  // Sort by score (descending), prioritizing filtered boots, then by widthScore, then flexScore, then brand A-Z
  scoredBoots.sort((a, b) => {
    // Prioritize boots that passed filters (isFiltered: true)
    if (a.isFiltered !== b.isFiltered) {
      return a.isFiltered ? -1 : 1; // Filtered boots come first
    }
    // Then sort by score
    if (b.score !== a.score) return b.score - a.score;
    if (b.widthScore !== a.widthScore) return b.widthScore - a.widthScore;
    if (b.flexScore !== a.flexScore) return b.flexScore - a.flexScore;
    return a.boot.brand.localeCompare(b.boot.brand);
  });

  // Debug logging for width matching
  console.log("\n=== WIDTH MATCHING DEBUG ===");
  console.log(
    `User width: ${userWidthMM}mm, Category: ${widthCategory || "none"}`
  );
  console.log(`Total filtered boots: ${filteredBoots.length}`);

  // Show all available widths in filtered boots
  const availableWidths = [
    ...new Set(filteredBoots.map((b) => b.lastWidthMM)),
  ].sort((a, b) => a - b);
  console.log(`Available boot widths: ${availableWidths.join(", ")}mm`);

  // Show top 10 boots with their width scores
  console.log("\n=== TOP 10 BOOTS BY SCORE ===");
  for (let i = 0; i < Math.min(10, scoredBoots.length); i++) {
    const { boot, score, widthScore, flexScore } = scoredBoots[i];
    const { toeScore, instepScore, ankleScore, calfScore } = calculateShapeScores(
      answers,
      boot
    );
    const featureScore = calculateFeatureScore(answers, boot);
    const widthDiff = userWidthMM
      ? Math.abs(userWidthMM - boot.lastWidthMM)
      : "N/A";
    console.log(
      `${i + 1}. ${boot.brand} ${boot.model} | Width: ${boot.lastWidthMM}mm (diff: ${widthDiff}mm, score: ${widthScore}/30) | Total: ${score.toFixed(1)}/100`
    );
  }

  // Debug logging for top 3 boots with full details
  console.log("\n=== TOP 3 BOOTS DETAILED SCORING ===");
  console.log(`Acceptable flex values: [${acceptableFlexes.join(", ")}]`);
  for (let i = 0; i < Math.min(3, scoredBoots.length); i++) {
    const { boot, score, widthScore, flexScore } = scoredBoots[i];
    const { toeScore, instepScore, ankleScore, calfScore } = calculateShapeScores(
      answers,
      boot
    );
    const featureScore = calculateFeatureScore(answers, boot);
    const closestAcceptableFlex = acceptableFlexes.reduce((prev, curr) =>
      Math.abs(curr - boot.flex) < Math.abs(prev - boot.flex) ? curr : prev
    );
    const widthDiff = userWidthMM
      ? Math.abs(userWidthMM - boot.lastWidthMM)
      : "N/A";
    console.log(`\n--- Boot #${i + 1}: ${boot.brand} ${boot.model} ---`);
    console.log(
      `  Width: ${boot.lastWidthMM}mm (user: ${userWidthMM}mm, diff: ${widthDiff}mm, score: ${widthScore}/30)`
    );
    console.log(
      `  Flex: ${boot.flex} (acceptable: [${acceptableFlexes.join(", ")}], closest: ${closestAcceptableFlex}, score: ${flexScore}/10)`
    );
    console.log(
      `  Toe: ${boot.toeBoxShape} (user: ${answers.toeShape}, score: ${toeScore}/5)`
    );
    console.log(
      `  Instep: ${boot.instepHeight} (user: ${answers.instepHeight}, score: ${instepScore}/20)`
    );
    console.log(
      `  Ankle: ${boot.ankleVolume} (user: ${answers.ankleVolume}, score: ${ankleScore}/15)`
    );
    console.log(
      `  Calf: ${boot.calfVolume} (user: ${answers.calfVolume}, score: ${calfScore}/10)`
    );
    console.log(`  Features: ${featureScore}/10`);
    console.log(`  TOTAL: ${score.toFixed(1)}/100`);
  }
  console.log("================================\n");

  // Get top 3 unique models with brand diversity
  // First, determine the score threshold (the 3rd boot's score, or minimum of top 3)
  const scoreThreshold = scoredBoots.length >= 3 
    ? scoredBoots[2].score 
    : scoredBoots.length > 0 
      ? scoredBoots[scoredBoots.length - 1].score 
      : 0;

  // Filter boots that meet the score threshold (all boots in top 3 score range)
  const eligibleBoots = scoredBoots.filter(({ score }) => score >= scoreThreshold);

  // Helper function to convert boot to BootSummary
  const bootToSummary = (boot: BootWithId, score: number): BootSummary => {
    let bootTypeStr: BootType | undefined;
    if (typeof boot.bootType === "string") {
      bootTypeStr = boot.bootType;
    } else if (typeof boot.bootType === "object" && boot.bootType !== null) {
      const bootTypeObj = boot.bootType as any;
      if (bootTypeObj.standard) bootTypeStr = "Standard";
      else if (bootTypeObj.freestyle) bootTypeStr = "Freestyle";
      else if (bootTypeObj.hybrid) bootTypeStr = "Hybrid";
      else if (bootTypeObj.touring) bootTypeStr = "Touring";
    }

    return {
      bootId: boot.bootId,
      brand: boot.brand,
      model: boot.model,
      links: boot.links,
      flex: boot.flex,
      bootType: bootTypeStr,
      lastWidthMM: boot.lastWidthMM,
      imageUrl: boot.imageUrl,
      affiliateUrl: boot.affiliateUrl,
      score: Math.round(score * 100) / 100,
    };
  };

  // Select up to 3 boots prioritizing brand diversity
  const topBoots: BootSummary[] = [];
  const seenModels = new Set<string>();
  const seenBrands = new Set<string>();

  // First pass: select one boot from each brand (prioritizing highest score per brand)
  const bootsByBrand = new Map<string, typeof eligibleBoots>();
  for (const item of eligibleBoots) {
    if (!bootsByBrand.has(item.boot.brand)) {
      bootsByBrand.set(item.boot.brand, []);
    }
    bootsByBrand.get(item.boot.brand)!.push(item);
  }

  // Sort brands by their best boot's score (descending)
  const brandsSorted = Array.from(bootsByBrand.entries()).sort(
    ([, bootsA], [, bootsB]) => bootsB[0].score - bootsA[0].score
  );

  // Select the best boot from each brand (in order of best brand scores)
  for (const [brand, boots] of brandsSorted) {
    if (topBoots.length >= 3) break;
    
    // Get the best boot from this brand (already sorted by score)
    const bestBoot = boots[0];
    const modelKey = `${bestBoot.boot.brand}-${bestBoot.boot.model}`;
    
    if (!seenModels.has(modelKey)) {
      seenModels.add(modelKey);
      seenBrands.add(brand);
      topBoots.push(bootToSummary(bestBoot.boot, bestBoot.score));
    }
  }

  // If we still don't have 3 boots, fill with remaining eligible boots (same brands allowed)
  if (topBoots.length < 3) {
    for (const { boot, score } of eligibleBoots) {
      if (topBoots.length >= 3) break;
      
      const modelKey = `${boot.brand}-${boot.model}`;
      if (seenModels.has(modelKey)) continue;

      seenModels.add(modelKey);
      topBoots.push(bootToSummary(boot, score));
    }
  }

  // Sort final results by score (descending) to maintain consistent ordering
  topBoots.sort((a, b) => b.score - a.score);

  // Calculate recommended mondo
  let recommendedMondo = "N/A";
  if (answers.footLengthMM) {
    // Use minimum foot length - easier to create space than make boot smaller
    const smallerFoot = Math.min(
      answers.footLengthMM.left,
      answers.footLengthMM.right
    );
    recommendedMondo = calculateRecommendedMondo(smallerFoot);
  } else if (answers.shoeSize) {
    recommendedMondo = shoeSizeToMondo(
      answers.shoeSize.system,
      answers.shoeSize.value
    );
  }

  return {
    boots: topBoots,
    recommendedMondo,
  };
}

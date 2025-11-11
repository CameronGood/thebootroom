import { Boot, QuizAnswers, BootSummary, Gender, Ability } from "../types";
import { listBoots } from "./firestore/boots";
import { calculateRecommendedMondo, shoeSizeToMondo } from "./mondo-conversions";

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
        baseFlexes = [90, 100]; // Available flex values for beginners
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
      baseFlexes = baseFlexes.map(flex => Math.max(70, flex - 10));
    } else if (weightKG > 95) {
      // Shift up: [90, 100] → [100, 110], [100, 110] → [110, 120], [120, 130] → [130, 140]
      baseFlexes = baseFlexes.map(flex => flex + 10);
    }
  } else {
    // Female
    switch (ability) {
      case "Beginner":
        baseFlexes = [85, 95]; // Available flex values for beginners
        break;
      case "Intermediate":
        baseFlexes = [95, 105]; // Available flex values for intermediates
        break;
      case "Advanced":
        baseFlexes = [105, 115]; // Available flex values for advanced
        break;
    }
    // Adjust for weight: <50kg → shift range down by 10, >80kg → shift range up by 10
    if (weightKG < 50) {
      // Shift down: [85, 95] → [75, 85], [95, 105] → [85, 95], [105, 115] → [95, 105]
      baseFlexes = baseFlexes.map(flex => Math.max(70, flex - 10));
    } else if (weightKG > 80) {
      // Shift up: [85, 95] → [95, 105], [95, 105] → [105, 115], [105, 115] → [115, 125]
      baseFlexes = baseFlexes.map(flex => flex + 10);
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
    const maxWidth = Math.max(left, right);
    // Only return if we have a valid measurement (> 0)
    return maxWidth > 0 ? maxWidth : null;
  }
  
  // If it has category, return null (no mm measurement)
  return null;
}

// Calculate width score (max 35 points)
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
      targetWidth = 98; // Narrow category = 98mm
    } else if (widthCategory === "Average") {
      targetWidth = 100; // Average category = 100mm
    } else if (widthCategory === "Wide") {
      targetWidth = 102; // Wide category = 102mm
    }
  }

  // If we have a target width, calculate score based on difference
  if (targetWidth !== null) {
    const widthDelta = Math.abs(targetWidth - bootWidthMM);
    let widthScore = Math.max(0, 35 - widthDelta * 7);
    
    // Adjust score based on instep height when boot width is within 2mm of target
    // This ensures that when user is between two boot widths, we choose the appropriate one
    // High instep: prefer wider boots (more volume for high instep)
    // Low instep: prefer narrower boots (less volume for low instep)
    if (widthDelta <= 2) {
      if (instepHeight === "High") {
        // High instep: prefer wider boots
        // Examples: 98mm user → prefer 100mm over 98mm, 101mm user → prefer 102mm over 100mm
        if (bootWidthMM > targetWidth) {
          // Boot is wider than target - strong bonus for high instep
          // Example: 98mm user, 100mm boot gets bonus
          widthScore += 25; // Very strong bonus to significantly prefer wider boot
          widthScore = Math.min(35, widthScore); // Cap at max
        } else if (bootWidthMM === targetWidth) {
          // Boot matches target exactly - small penalty for high instep (we want wider)
          widthScore -= 5; // Small penalty to prefer wider boots when available
          widthScore = Math.max(0, widthScore);
        } else if (bootWidthMM < targetWidth) {
          // Boot is narrower than target - strong penalty for high instep
          widthScore -= 25; // Strong penalty to avoid narrower boot
          widthScore = Math.max(0, widthScore);
        }
      } else if (instepHeight === "Low") {
        // Low instep: prefer narrower boots
        // Examples: 102mm user → prefer 100mm over 102mm, 99mm user → prefer 98mm over 100mm
        if (bootWidthMM < targetWidth) {
          // Boot is narrower than target - strong bonus for low instep
          // Example: 102mm user, 100mm boot gets bonus
          widthScore += 25; // Very strong bonus to significantly prefer narrower boot
          widthScore = Math.min(35, widthScore); // Cap at max
        } else if (bootWidthMM === targetWidth) {
          // Boot matches target exactly - small penalty for low instep (we want narrower)
          widthScore -= 5; // Small penalty to prefer narrower boots when available
          widthScore = Math.max(0, widthScore);
        } else if (bootWidthMM > targetWidth) {
          // Boot is wider than target - strong penalty for low instep
          widthScore -= 25; // Strong penalty to avoid wider boot
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

// Calculate flex score (max 20 points)
// Scores based on how close the boot's flex is to any acceptable flex value
function calculateFlexScore(
  bootFlex: number,
  acceptableFlexes: number[]
): number {
  // Find the minimum distance to any acceptable flex value
  const minDelta = Math.min(
    ...acceptableFlexes.map(acceptableFlex => Math.abs(bootFlex - acceptableFlex))
  );
  
  // Score: full points for exact match, decreasing by 1.33 per flex difference (20 max / 15 flex tolerance ≈ 1.33)
  const flexScore = Math.max(0, 20 - minDelta * 1.33);
  return flexScore;
}

// Calculate shape/volume scores (max 40 points total: 10, 20, 10)
function calculateShapeScores(
  answers: QuizAnswers,
  boot: Boot
): { toeScore: number; instepScore: number; calfScore: number } {
  const toeScore = answers.toeShape === boot.toeBoxShape ? 10 : 0;
  const instepScore = answers.instepHeight === boot.instepHeight ? 20 : 0; // Instep is most important for fit
  const calfScore = answers.calfVolume === boot.calfVolume ? 10 : 0;
  return { toeScore, instepScore, calfScore };
}

// Calculate feature affinity score (max 5 points)
function calculateFeatureScore(answers: QuizAnswers, boot: Boot): number {
  let featureScore = 0;
  if (answers.features.includes("Walk Mode") && boot.walkMode) {
    featureScore += 2;
  }
  if (answers.features.includes("Rear Entry") && boot.rearEntry) {
    featureScore += 2;
  }
  if (answers.features.includes("Calf Adjustment") && boot.calfAdjustment) {
    featureScore += 1; // Last feature gets 1 point to total 5
  }
  return featureScore;
}

// Filter boots based on hard requirements
function filterBoots(
  boots: BootWithId[],
  answers: QuizAnswers,
  userWidthMM: number | null,
  widthCategory?: "Narrow" | "Average" | "Wide"
): BootWithId[] {
  return boots.filter((boot) => {
    // Gender must match
    if (boot.gender !== answers.gender) {
      return false;
    }

    // If touring is required, boot must have bootType of "All-Mountain" or "Touring"
    if (answers.touring === "Yes") {
      const isTouringBoot = boot.bootType === "Touring" || 
                           boot.bootType === "All-Mountain" ||
                           boot.bootType?.toLowerCase().includes("touring");
      if (!isTouringBoot) {
        return false;
      }
    }

    // All selected features must be present on the boot
    if (answers.features.includes("Walk Mode") && !boot.walkMode) {
      return false;
    }
    if (answers.features.includes("Rear Entry") && !boot.rearEntry) {
      return false;
    }
    if (
      answers.features.includes("Calf Adjustment") &&
      !boot.calfAdjustment
    ) {
      return false;
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
  const { toeScore, instepScore, calfScore } = calculateShapeScores(
    answers,
    boot
  );
  const featureScore = calculateFeatureScore(answers, boot);

  return widthScore + flexScore + toeScore + instepScore + calfScore + featureScore;
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
  console.log("footWidth keys:", answers.footWidth ? Object.keys(answers.footWidth) : "null/undefined");
  console.log("has category property?:", answers.footWidth && "category" in answers.footWidth);
  console.log("category value:", answers.footWidth && "category" in answers.footWidth ? (answers.footWidth as any).category : "N/A");
  console.log("userWidthMM:", userWidthMM);
  console.log("widthCategory extracted:", widthCategory);
  console.log("========================\n");

  // Filter boots (need width data for filtering)
  const filteredBoots = filterBoots(allBoots, answers, userWidthMM, widthCategory);
  
  if (filteredBoots.length === 0) {
    throw new Error(`No boots match your criteria. Found ${allBoots.length} total boots, but none match gender: ${answers.gender}, touring: ${answers.touring}, features: ${answers.features.join(", ")}`);
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
    const { toeScore, instepScore, calfScore } = calculateShapeScores(answers, boot);
    const featureScore = calculateFeatureScore(answers, boot);
    const score = widthScore + flexScore + toeScore + instepScore + calfScore + featureScore;
    
    return {
      boot,
      score,
      widthScore,
      flexScore,
    };
  });

  // Sort by score (descending), then by widthScore, then flexScore, then brand A-Z
  scoredBoots.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.widthScore !== a.widthScore) return b.widthScore - a.widthScore;
    if (b.flexScore !== a.flexScore) return b.flexScore - a.flexScore;
    return a.boot.brand.localeCompare(b.boot.brand);
  });

        // Debug logging for width matching
        console.log("\n=== WIDTH MATCHING DEBUG ===");
        console.log(`User width: ${userWidthMM}mm, Category: ${widthCategory || "none"}`);
        console.log(`Total filtered boots: ${filteredBoots.length}`);
        
        // Show all available widths in filtered boots
        const availableWidths = [...new Set(filteredBoots.map(b => b.lastWidthMM))].sort((a, b) => a - b);
        console.log(`Available boot widths: ${availableWidths.join(", ")}mm`);
        
        // Show top 10 boots with their width scores
        console.log("\n=== TOP 10 BOOTS BY SCORE ===");
        for (let i = 0; i < Math.min(10, scoredBoots.length); i++) {
          const { boot, score, widthScore, flexScore } = scoredBoots[i];
          const { toeScore, instepScore, calfScore } = calculateShapeScores(answers, boot);
          const featureScore = calculateFeatureScore(answers, boot);
          const widthDiff = userWidthMM ? Math.abs(userWidthMM - boot.lastWidthMM) : "N/A";
          console.log(`${i + 1}. ${boot.brand} ${boot.model} | Width: ${boot.lastWidthMM}mm (diff: ${widthDiff}mm, score: ${widthScore}/35) | Total: ${score.toFixed(1)}/100`);
        }
        
        // Debug logging for top 3 boots with full details
        console.log("\n=== TOP 3 BOOTS DETAILED SCORING ===");
        console.log(`Acceptable flex values: [${acceptableFlexes.join(", ")}]`);
        for (let i = 0; i < Math.min(3, scoredBoots.length); i++) {
          const { boot, score, widthScore, flexScore } = scoredBoots[i];
          const { toeScore, instepScore, calfScore } = calculateShapeScores(answers, boot);
          const featureScore = calculateFeatureScore(answers, boot);
          const closestAcceptableFlex = acceptableFlexes.reduce((prev, curr) => 
            Math.abs(curr - boot.flex) < Math.abs(prev - boot.flex) ? curr : prev
          );
          const widthDiff = userWidthMM ? Math.abs(userWidthMM - boot.lastWidthMM) : "N/A";
          console.log(`\n--- Boot #${i + 1}: ${boot.brand} ${boot.model} ---`);
          console.log(`  Width: ${boot.lastWidthMM}mm (user: ${userWidthMM}mm, diff: ${widthDiff}mm, score: ${widthScore}/35)`);
          console.log(`  Flex: ${boot.flex} (acceptable: [${acceptableFlexes.join(", ")}], closest: ${closestAcceptableFlex}, score: ${flexScore}/20)`);
          console.log(`  Toe: ${boot.toeBoxShape} (user: ${answers.toeShape}, score: ${toeScore}/10)`);
          console.log(`  Instep: ${boot.instepHeight} (user: ${answers.instepHeight}, score: ${instepScore}/20)`);
          console.log(`  Calf: ${boot.calfVolume} (user: ${answers.calfVolume}, score: ${calfScore}/10)`);
          console.log(`  Features: ${featureScore}/5`);
          console.log(`  TOTAL: ${score.toFixed(1)}/100`);
        }
        console.log("================================\n");

  // Get top 3 unique models
  const topBoots: BootSummary[] = [];
  const seenModels = new Set<string>();

  for (const { boot, score } of scoredBoots) {
    const modelKey = `${boot.brand}-${boot.model}`;
    if (!seenModels.has(modelKey) && topBoots.length < 3) {
      seenModels.add(modelKey);
      topBoots.push({
        bootId: boot.bootId,
        brand: boot.brand,
        model: boot.model,
        links: boot.links, // Include regional affiliate links
        flex: boot.flex,
        bootType: boot.bootType,
        lastWidthMM: boot.lastWidthMM,
        imageUrl: boot.imageUrl,
        affiliateUrl: boot.affiliateUrl,
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
      });
    }
  }

  // Calculate recommended mondo
  let recommendedMondo = "N/A";
  if (answers.footLengthMM) {
    const largerFoot = Math.max(
      answers.footLengthMM.left,
      answers.footLengthMM.right
    );
    recommendedMondo = calculateRecommendedMondo(largerFoot);
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



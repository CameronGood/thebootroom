import { Boot, QuizAnswers, BootSummary, Gender, Ability, BootType } from "../types";
import { listBoots } from "./firestore/boots";
import {
  calculateRecommendedMondo,
  shoeSizeToMondo,
  shoeSizeToFootLengthMM,
} from "./mondo-conversions";
import { getUserWidthCategory } from "./utils/widthCategory";
import { getBootFamily } from "./utils/getBootFamily";

// Extended Boot type with bootId
export type BootWithId = Boot & { bootId: string };

// Get acceptable flex values based on gender, ability, and weight
// Returns an array of flex values that are acceptable for this user
export function getAcceptableFlexValues(
  gender: Gender,
  ability: Ability,
  weightKG: number,
  bootType: BootType
): number[] {
  // Freestyle: unified ranges for both genders, no weight adjustment
  if (bootType === "Freestyle") {
    switch (ability) {
      case "Beginner":
        return [70, 75, 80];
      case "Intermediate":
        return [90, 95, 100];
      case "Advanced":
        return [110, 115, 120];
      default:
        return [90, 95, 100];
    }
  }
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
  weightKG: number,
  bootType: BootType
): number {
  const acceptableFlexes = getAcceptableFlexValues(gender, ability, weightKG, bootType);
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

// Calculate width score (max 30 points) - categorical system
function calculateWidthScore(
  userWidthCategory: "Narrow" | "Average" | "Wide" | null,
  bootWidthCategory: "Narrow" | "Average" | "Wide"
): number {
  if (!userWidthCategory) return 0;

  const order = ["Narrow", "Average", "Wide"];
  const userIndex = order.indexOf(userWidthCategory);
  const bootIndex = order.indexOf(bootWidthCategory);
  const diff = Math.abs(userIndex - bootIndex);

  if (diff === 0) return 30; // perfect match
  if (diff === 1) return 15; // one step away
  return 5; // two steps away
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
// Now supports arrays of boot values (e.g., ["Low", "Average"]) and returns the best match
function calculateProximityScore(
  userValue: "Low" | "Average" | "High",
  bootValues: ("Low" | "Average" | "High")[],
  maxPoints: number
): number {
  if (!bootValues || bootValues.length === 0) return 0;

  // Convert to numeric values for distance calculation
  const valueMap: Record<"Low" | "Average" | "High", number> = {
    Low: 0,
    Average: 1,
    High: 2,
  };

  const userNum = valueMap[userValue];
  let bestScore = 0;

  // Find the best match across all boot values
  for (const bootValue of bootValues) {
    if (userValue === bootValue) {
      // Exact match: full points
      return maxPoints;
    }

    const bootNum = valueMap[bootValue];
    const distance = Math.abs(userNum - bootNum);

    let score = 0;
    if (distance === 1) {
      // One step away (e.g., High → Medium, Low → Medium): 50% of max points
      score = maxPoints * 0.5;
    } else if (distance === 2) {
      // Two steps away (e.g., High → Low, Low → High): 25% of max points
      score = maxPoints * 0.25;
    }

    if (score > bestScore) {
      bestScore = score;
    }
  }

  return bestScore;
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
// Award full points automatically for now (features step removed)
function calculateFeatureScore(answers: QuizAnswers, boot: Boot): number {
  // Always award full points - features step has been removed
    return 10;
}

// Filter boots based on hard requirements
// Normalize boot type strings (handles case, spacing, and common aliases)
function normalizeBootType(value: unknown): BootType | null {
  if (!value || typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "standard" || normalized === "all-mountain") return "Standard";
  if (normalized === "freestyle") return "Freestyle";
  if (normalized === "hybrid") return "Hybrid";
  if (normalized === "freeride") return "Freeride";
  return null;
}

function filterBoots(
  boots: BootWithId[],
  answers: QuizAnswers,
  userWidthCategory: "Narrow" | "Average" | "Wide",
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
        const normalizedBootType = normalizeBootType(boot.bootType);
        bootTypeMatches = normalizedBootType === answers.bootType;
      } else if (typeof boot.bootType === "object" && boot.bootType !== null) {
        // Handle legacy object format for backwards compatibility
        const bootTypeObj = boot.bootType as any;
        bootTypeMatches =
          (answers.bootType === "Standard" && bootTypeObj.standard) ||
          (answers.bootType === "Freestyle" && bootTypeObj.freestyle) ||
          (answers.bootType === "Hybrid" && bootTypeObj.hybrid) ||
          (answers.bootType === "Freeride" && bootTypeObj.freeride);
      }
      if (!bootTypeMatches) {
        return false;
      }
    }

    // Features filtering removed - awarding full scores automatically for now
    // Features step has been removed from the quiz

    return true;
  });
}

// Score a single boot
function scoreBoot(
  boot: BootWithId,
  answers: QuizAnswers,
  acceptableFlexes: number[],
  userWidthCategory: "Narrow" | "Average" | "Wide"
): number {
  const widthScore = calculateWidthScore(
    userWidthCategory,
    boot.bootWidth
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
  answers: QuizAnswers,
  preloadedBoots?: BootWithId[]
): Promise<{ boots: BootSummary[]; recommendedMondo: string }> {
  // Get all boots
  const allBoots = preloadedBoots || (await listBoots());

  if (allBoots.length === 0) {
    throw new Error("No boots found in database. Please import boots first.");
  }

  // Debug: log available boot types in inventory
  const availableBootTypes = Array.from(
    new Set(
      allBoots
        .map((b) => {
          if (typeof b.bootType === "string") {
            return normalizeBootType(b.bootType);
          }
          if (b.bootType && typeof b.bootType === "object") {
            const obj: any = b.bootType;
            if (obj.standard) return "Standard";
            if (obj.freestyle) return "Freestyle";
            if (obj.hybrid) return "Hybrid";
            if (obj.freeride) return "Freeride";
          }
          return null;
        })
        .filter(Boolean)
    )
  );

  // Get acceptable flex values (discrete values like 100, 110)
  const acceptableFlexes = getAcceptableFlexValues(
    answers.gender,
    answers.ability,
    answers.weightKG,
    answers.bootType
  );

  // Also calculate target flex for display/debugging (midpoint of acceptable values)
  const targetFlex = calculateTargetFlex(
    answers.gender,
    answers.ability,
    answers.weightKG,
    answers.bootType
  );

  // --- Determine foot length & width ---
  let userFootLengthMM: number | null = null;
  let userFootWidthMM: number | null = null;

  // Get foot length from mm measurements or convert from shoe size
  if (answers.footLengthMM) {
    userFootLengthMM = Math.min(
      answers.footLengthMM.left,
      answers.footLengthMM.right
    );
  } else if (answers.shoeSize) {
    // Convert shoe size to estimated foot length in mm
    const estimatedLength = shoeSizeToFootLengthMM(
      answers.shoeSize.system,
      answers.shoeSize.value
    );
    if (estimatedLength !== null) {
      userFootLengthMM = estimatedLength;
    }
  }

  // Get foot width from mm measurements
  if (answers.footWidth && "left" in answers.footWidth) {
    const left = answers.footWidth.left || 0;
    const right = answers.footWidth.right || 0;
    const validWidths = [left, right].filter((v) => v > 0);
    if (validWidths.length > 0) {
      userFootWidthMM = Math.min(...validWidths);
    }
  }

  // --- Derive userWidthCategory ---
  let userWidthCategory: "Narrow" | "Average" | "Wide" | null = null;

  // Priority 1: Calculate from measurements (mm or converted from shoe size)
  if (userFootLengthMM && userFootWidthMM) {
    userWidthCategory = getUserWidthCategory(
      answers.gender,
      userFootLengthMM,
      userFootWidthMM
    );
  } 
  // Priority 2: Manual category selection (fallback)
  else if (answers.footWidth && "category" in answers.footWidth) {
    userWidthCategory = (answers.footWidth as any).category;
  }

  if (!userWidthCategory) {
    throw new Error(
      "Unable to determine user width category. Please provide foot measurements (mm) or select a width category."
    );
  }

  // Filter boots (need width data for filtering)
  const filteredBoots = filterBoots(
    allBoots,
    answers,
    userWidthCategory,
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
      userWidthCategory,
      boot.bootWidth
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
  // But flex and width category are still hard requirements - only include boots with acceptable flex values and wider width categories
  if (scoredBoots.length < 3) {
    const filteredBootIds = new Set(filteredBoots.map(b => b.bootId));
    const order = ["Narrow", "Average", "Wide"];
    const userIndex = order.indexOf(userWidthCategory);
    
    const remainingBoots = allBoots.filter(boot => {
      if (filteredBootIds.has(boot.bootId)) return false;
      if (!acceptableFlexes.includes(boot.flex)) return false;
      if (boot.gender !== answers.gender) return false;
      
      // Only allow wider boots (can't make boot wider)
      const bootIndex = order.indexOf(boot.bootWidth);
      if (bootIndex < userIndex) return false; // Reject narrower boots
      
      return true;
    });
    
    // Check if we're filtering by features
    const features = answers.features || [];
    const hasFeatureFilters = features.length > 0;
    const featureFilterInfo = hasFeatureFilters 
      ? ` (including boots without required features: ${features.join(", ")})`
      : "";
    
    const additionalScoredBoots = remainingBoots.map((boot) => {
      const widthScore = calculateWidthScore(
        userWidthCategory,
        boot.bootWidth
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

  // Sort scored boots by score (descending) before grouping
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

  // --- Group boots by family ---
  const bootsByFamily = new Map<string, typeof scoredBoots>();

  for (const item of scoredBoots) {
    const family = getBootFamily(item.boot);
    if (!bootsByFamily.has(family)) {
      bootsByFamily.set(family, []);
    }
    bootsByFamily.get(family)!.push(item);
  }

  // --- Aggregate by family ---
  const familySummaries = Array.from(bootsByFamily.entries()).map(
    ([family, boots]) => {
      const bestBoot = boots.reduce((a, b) => (a.score > b.score ? a : b));
      const brand = bestBoot.boot.brand;
      const highestFlex = Math.max(...boots.map((b) => b.boot.flex));
      const familyScore = bestBoot.score;

      return {
        family,
        brand,
        score: familyScore,
        boots,
        bestBoot,
        highestFlex,
      };
    }
  );

  // --- Sort families by score ---
  familySummaries.sort((a, b) => b.score - a.score);

  // --- Select up to 3 families, one per brand ---
  const topFamilies: typeof familySummaries = [];
  const usedBrands = new Set<string>();

  for (const fam of familySummaries) {
    if (topFamilies.length >= 3) break;
    if (usedBrands.has(fam.brand)) continue;
    topFamilies.push(fam);
    usedBrands.add(fam.brand);
  }

  // If we still don't have 3 families, fill with remaining families (same brands allowed)
  if (topFamilies.length < 3) {
    for (const fam of familySummaries) {
      if (topFamilies.length >= 3) break;
      if (topFamilies.some((f) => f.family === fam.family)) continue;
      topFamilies.push(fam);
    }
  }

  // Helper function to convert boot to BootSummary
  const bootToSummary = (boot: BootWithId, score: number): BootSummary => {
    let bootTypeStr: BootType | undefined;
    if (typeof boot.bootType === "string") {
      bootTypeStr = normalizeBootType(boot.bootType) || undefined;
    } else if (typeof boot.bootType === "object" && boot.bootType !== null) {
      const bootTypeObj = boot.bootType as any;
      if (bootTypeObj.standard) bootTypeStr = "Standard";
      else if (bootTypeObj.freestyle) bootTypeStr = "Freestyle";
      else if (bootTypeObj.hybrid) bootTypeStr = "Hybrid";
      else if (bootTypeObj.freeride) bootTypeStr = "Freeride";
    }

    return {
      bootId: boot.bootId,
      brand: boot.brand,
      model: boot.model,
      links: boot.links,
      flex: boot.flex,
      bootType: bootTypeStr,
      bootWidth: boot.bootWidth,
      lastWidthMM: boot.lastWidthMM,
      imageUrl: boot.imageUrl,
      affiliateUrl: boot.affiliateUrl,
      score: Math.round(score * 100) / 100,
      // Preserve features for comparison purposes
      walkMode: boot.walkMode,
      rearEntry: boot.rearEntry,
      calfAdjustment: boot.calfAdjustment,
      // Include shape data for comparison table
      toeBoxShape: boot.toeBoxShape,
      instepHeight: boot.instepHeight,
      ankleVolume: boot.ankleVolume,
      calfVolume: boot.calfVolume,
    };
  };

  // --- Final grouped result objects ---
  const topBoots: BootSummary[] = topFamilies.map((fam) => {
    const b = fam.bestBoot.boot;
    const modelList = fam.boots.map((m) => ({
      model: m.boot.model,
      flex: m.boot.flex,
      affiliateUrl: m.boot.affiliateUrl,
      imageUrl: m.boot.imageUrl,
    }));

    let bootTypeStr: BootType | undefined;
    if (typeof b.bootType === "string") {
      bootTypeStr = normalizeBootType(b.bootType) || undefined;
    } else if (typeof b.bootType === "object" && b.bootType !== null) {
      const bootTypeObj = b.bootType as any;
      if (bootTypeObj.standard) bootTypeStr = "Standard";
      else if (bootTypeObj.freestyle) bootTypeStr = "Freestyle";
      else if (bootTypeObj.hybrid) bootTypeStr = "Hybrid";
      else if (bootTypeObj.freeride) bootTypeStr = "Freeride";
    }

    return {
      bootId: b.bootId,
      brand: b.brand,
      model: fam.family, // family name for display
      flex: fam.highestFlex,
      bootType: bootTypeStr,
      bootWidth: b.bootWidth,
      lastWidthMM: b.lastWidthMM,
      imageUrl: b.imageUrl,
      links: b.links,
      affiliateUrl: b.affiliateUrl,
      score: Math.round(fam.score * 100) / 100,
      models: modelList,
      // Include shape data for comparison table
      toeBoxShape: b.toeBoxShape,
      instepHeight: b.instepHeight,
      ankleVolume: b.ankleVolume,
      calfVolume: b.calfVolume,
    };
  });

  // Enforce bootType selection at the very end to guard against any upstream data anomalies
  const bootTypeFiltered = answers.bootType
    ? topBoots.filter((b) => b.bootType === answers.bootType)
    : topBoots;

  if (bootTypeFiltered.length === 0) {
    const availableTypes = Array.from(new Set(topBoots.map((b) => b.bootType).filter(Boolean)));
    throw new Error(
      `No boots match your selected boot type (${answers.bootType}). Available boot types in inventory: ${availableTypes.join(", ") || "none"}.`
    );
  }

  // Sort final results by score (descending) to maintain consistent ordering
  bootTypeFiltered.sort((a, b) => b.score - a.score);

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
    boots: bootTypeFiltered,
    recommendedMondo,
  };
}

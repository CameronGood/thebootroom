import { QuizAnswers } from "@/types";

/**
 * Calculate acceptable flex range based on user profile
 * Returns an array of flex ratings that are suitable for the user
 */
export function calculateAcceptableFlexRange(answers: QuizAnswers): number[] {
  let baseFlexes: number[] = [];
  
  if (answers.gender === "Male") {
    switch (answers.ability) {
      case "Beginner": baseFlexes = [80, 90]; break;
      case "Intermediate": baseFlexes = [100, 110]; break;
      case "Advanced": baseFlexes = [120, 130]; break;
      default: baseFlexes = [100, 110]; break; // Default to intermediate
    }
  } else {
    switch (answers.ability) {
      case "Beginner": baseFlexes = [65, 75, 80, 85]; break;
      case "Intermediate": baseFlexes = [90, 95, 100]; break;
      case "Advanced": baseFlexes = [105, 110, 115]; break;
      default: baseFlexes = [90, 95, 100]; break; // Default to intermediate
    }
  }
  
  if (baseFlexes.length === 0) {
    // Fallback if something went wrong
    baseFlexes = answers.gender === "Male" ? [100, 110] : [90, 95, 100];
  }
  
  // Adjust for weight
  if (answers.gender === "Male") {
    if (answers.weightKG < 60) baseFlexes = baseFlexes.map(f => Math.max(70, f - 10));
    if (answers.weightKG > 95) baseFlexes = baseFlexes.map(f => f + 10);
  } else {
    if (answers.weightKG < 50) baseFlexes = baseFlexes.map(f => Math.max(70, f - 10));
    if (answers.weightKG > 80) baseFlexes = baseFlexes.map(f => f + 10);
  }
  
  return baseFlexes;
}

/**
 * Get flex range string (e.g., "80-90")
 */
export function getFlexRangeString(answers: QuizAnswers): string {
  const flexes = calculateAcceptableFlexRange(answers);
  return `${Math.min(...flexes)}-${Math.max(...flexes)}`;
}

/**
 * Get target flex (average of acceptable flexes)
 */
export function getTargetFlex(answers: QuizAnswers): number {
  const flexes = calculateAcceptableFlexRange(answers);
  return Math.round(flexes.reduce((a, b) => a + b, 0) / flexes.length);
}


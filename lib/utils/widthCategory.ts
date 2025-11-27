import { Gender } from "@/types";

type WidthCategory = "Narrow" | "Average" | "Wide";

/**
 * Calculates user's width category based on gender, foot length (mm), and foot width (mm).
 * Returns Narrow / Average / Wide according to provided size tables.
 */
export function getUserWidthCategory(
  gender: Gender,
  footLengthMM: number,
  footWidthMM: number
): WidthCategory {
  const table = gender === "Female" ? womensTable : mensTable;
  const row = table.find(
    (r) => footLengthMM >= r.min && footLengthMM <= r.max
  );
  if (!row) return "Average";

  if (footWidthMM <= row.narrowMax) return "Narrow";
  if (footWidthMM <= row.averageMax) return "Average";
  return "Wide";
}

interface WidthRow {
  min: number;
  max: number;
  narrowMax: number;
  averageMax: number;
  wideMax: number;
}

// --- Men ---
const mensTable: WidthRow[] = [
  { min: 220, max: 229, narrowMax: 90, averageMax: 93, wideMax: 94 },
  { min: 230, max: 239, narrowMax: 92, averageMax: 95, wideMax: 96 },
  { min: 240, max: 249, narrowMax: 94, averageMax: 97, wideMax: 98 },
  { min: 250, max: 259, narrowMax: 96, averageMax: 99, wideMax: 100 },
  { min: 260, max: 269, narrowMax: 98, averageMax: 101, wideMax: 102 },
  { min: 270, max: 279, narrowMax: 100, averageMax: 103, wideMax: 104 },
  { min: 280, max: 289, narrowMax: 102, averageMax: 105, wideMax: 106 },
  { min: 290, max: 299, narrowMax: 104, averageMax: 107, wideMax: 108 },
];

// --- Women ---









const womensTable: WidthRow[] = [
  { min: 220, max: 229, narrowMax: 92, averageMax: 95, wideMax: 96 },
  { min: 230, max: 239, narrowMax: 94, averageMax: 97, wideMax: 98 },
  { min: 240, max: 249, narrowMax: 96, averageMax: 99, wideMax: 100 },
  { min: 250, max: 259, narrowMax: 98, averageMax: 101, wideMax: 102 },
  { min: 260, max: 269, narrowMax: 100, averageMax: 103, wideMax: 104 },
  { min: 270, max: 279, narrowMax: 102, averageMax: 105, wideMax: 106 },
];


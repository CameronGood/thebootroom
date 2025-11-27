import type { Volume } from "@/types";

// LAV = Low/Average/High (alias for Volume)
export type LAV = Volume;

// Normalize text → LAV enum value
// Note: "Medium" in CSV maps to "Average" in Volume type
const MAP: Record<string, LAV> = {
  low: "Low",
  l: "Low",
  medium: "Average", // Map "Medium" to "Average"
  average: "Average",
  avg: "Average",
  a: "Average",
  high: "High",
  h: "High",
};

export function toLAVArray(
  input: string | string[] | LAV | LAV[] | null | undefined
): LAV[] {
  if (!input) return [];
  if (Array.isArray(input))
    return input.map((v) => normalize(v)).filter(Boolean) as LAV[];
  if (typeof input !== "string")
    return [input].filter(Boolean) as LAV[];

  // CSV: "Low;Average" → ["Low","Average"]
  return input
    .split(";")
    .map((s) => s.trim())
    .map((s) => normalize(s))
    .filter(Boolean) as LAV[];
}

function normalize(val: string | LAV): LAV | null {
  if (!val) return null;
  const key = String(val).trim().toLowerCase();
  return MAP[key] ?? null;
}


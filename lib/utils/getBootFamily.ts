import { Boot } from "@/types";

/**
 * Extracts the family name from a boot's tags array.
 * The family name is defined as the first tag in the CSV.
 */
export function getBootFamily(boot: Boot): string {
  if (!boot.tags || boot.tags.length === 0) return "Unknown Family";
  const tags = Array.isArray(boot.tags)
    ? boot.tags
    : String(boot.tags).split(",").map((t) => t.trim());
  return tags[0] || "Unknown Family";
}


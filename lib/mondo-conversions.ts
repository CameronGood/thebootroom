// Shared utility for Mondo size conversions
// Can be used on both client and server

// Conversion lookup tables based on standard ski boot sizing
// These map shoe sizes to mondo sizes based on the conversion table
const EU_TO_MONDO: { [key: number]: number } = {
  36.5: 22.0,
  37: 22.5,
  37.5: 23.0,
  38: 23.5,
  38.5: 24.0,
  39: 24.5,
  40: 25.0,
  40.5: 25.0,
  41: 25.5,
  41.5: 25.5,
  42: 26.0,
  42.5: 26.5,
  43: 27.0,
  43.5: 27.0,
  44: 27.5,
  45: 28.0,
  45.5: 28.5,
  46: 29.0,
  46.5: 29.0,
  47: 29.5,
};

const UK_TO_MONDO: { [key: number]: number } = {
  3.5: 22.0,
  4: 22.5,
  4.5: 23.0,
  5: 23.5,
  5.5: 24.0,
  6: 24.5,
  6.5: 25.0,
  7: 25.5,
  7.5: 25.5,
  8: 26.0,
  8.5: 26.5,
  9: 27.0,
  9.5: 27.5,
  10: 28.0,
  10.5: 28.5,
  11: 29.0,
  11.5: 29.0,
  12: 29.5,
};

const US_TO_MONDO: { [key: number]: number } = {
  3.5: 22.0,
  4: 22.5,
  4.5: 23.0,
  5: 23.5,
  5.5: 24.0,
  6: 24.5,
  6.5: 24.5,
  7: 25.0,
  7.5: 25.0,
  8: 25.5,
  8.5: 25.5,
  9: 26.0,
  9.5: 26.5,
  10: 27.0,
  10.5: 27.5,
  11: 28.0,
  11.5: 28.5,
  12: 29.0,
  12.5: 29.0,
  13: 29.5,
};

// Convert foot length (mm) to mondo size range
// Based on conversion table provided:
// 220-229mm → 22.0-22.5
// 230-239mm → 23.0-23.5
// 240-249mm → 24.0-24.5
// 250-259mm → 25.0-25.5
// 260-269mm → 26.0-26.5
// 270-279mm → 27.0-27.5
// 280-289mm → 28.0-28.5
// 290-299mm → 29.0-29.5
export function calculateRecommendedMondo(footLengthMM: number): string {
  if (!footLengthMM || footLengthMM < 220 || footLengthMM > 299) {
    return "N/A";
  }

  // Determine which 10mm range the foot length falls into
  const baseMondo = 22 + Math.floor((footLengthMM - 220) / 10);

  // Return the range for that 10mm bracket
  const mondoMin = baseMondo;
  const mondoMax = baseMondo + 0.5;

  return `${mondoMin} - ${mondoMax}`;
}

// Convert shoe size to mondo range using lookup tables
// Returns a range format like "26 - 26.5"
export function shoeSizeToMondo(
  system: "UK" | "US" | "EU",
  value: number
): string {
  let mondo: number | undefined;

  if (system === "EU") {
    // Try exact match first
    mondo = EU_TO_MONDO[value];
    // If no exact match, find closest
    if (mondo === undefined) {
      const sizes = Object.keys(EU_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = EU_TO_MONDO[closest];
    }
  } else if (system === "UK") {
    mondo = UK_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(UK_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = UK_TO_MONDO[closest];
    }
  } else {
    // US
    mondo = US_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(US_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = US_TO_MONDO[closest];
    }
  }

  if (mondo === undefined) {
    return "N/A";
  }

  // Return as a range: baseMondo - baseMondo.5
  // For example, if mondo is 26.0 or 26.5, return "26 - 26.5"
  const baseMondo = Math.floor(mondo);
  return `${baseMondo} - ${baseMondo + 0.5}`;
}
// Convert shoe size to estimated foot length in mm
// Uses mondo conversion and reverse calculates foot length
// Formula: footLengthMM ≈ 220 + (mondo - 22) * 10 + 5 (midpoint of range)
export function shoeSizeToFootLengthMM(
  system: "UK" | "US" | "EU",
  value: number
): number | null {
  let mondo: number | undefined;

  if (system === "EU") {
    mondo = EU_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(EU_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = EU_TO_MONDO[closest];
    }
  } else if (system === "UK") {
    mondo = UK_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(UK_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = UK_TO_MONDO[closest];
    }
  } else {
    // US
    mondo = US_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(US_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = US_TO_MONDO[closest];
    }
  }

  if (mondo === undefined) {
    return null;
  }

  // Reverse calculate foot length from mondo
  // mondo 22.0 → 220-229mm (use 225mm midpoint)
  // mondo 22.5 → 225-234mm (use 230mm midpoint)
  // Formula: footLengthMM = 220 + (mondo - 22) * 10 + 5
  const estimatedFootLength = 220 + (mondo - 22) * 10 + 5;
  return Math.round(estimatedFootLength);
}

// Helper function to get mondo value from a shoe size (returns number, not string)
function getMondoFromShoeSize(
  system: "UK" | "US" | "EU",
  value: number
): number | undefined {
  let mondo: number | undefined;

  if (system === "EU") {
    mondo = EU_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(EU_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = EU_TO_MONDO[closest];
    }
  } else if (system === "UK") {
    mondo = UK_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(UK_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = UK_TO_MONDO[closest];
    }
  } else {
    // US
    mondo = US_TO_MONDO[value];
    if (mondo === undefined) {
      const sizes = Object.keys(US_TO_MONDO)
        .map(Number)
        .sort((a, b) => a - b);
      const closest = sizes.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      mondo = US_TO_MONDO[closest];
    }
  }

  return mondo;
}

// Helper function to find closest shoe size for a given mondo value
function findClosestShoeSizeForMondo(
  system: "UK" | "US" | "EU",
  mondo: number
): number | undefined {
  let lookupTable: { [key: number]: number };
  
  if (system === "EU") {
    lookupTable = EU_TO_MONDO;
  } else if (system === "UK") {
    lookupTable = UK_TO_MONDO;
  } else {
    lookupTable = US_TO_MONDO;
  }

  // Find the shoe size(s) that map to this mondo value
  const matchingSizes: number[] = [];
  for (const [size, sizeMondo] of Object.entries(lookupTable)) {
    if (sizeMondo === mondo) {
      matchingSizes.push(Number(size));
    }
  }

  if (matchingSizes.length > 0) {
    // If multiple sizes map to the same mondo, return the middle one
    matchingSizes.sort((a, b) => a - b);
    return matchingSizes[Math.floor(matchingSizes.length / 2)];
  }

  // If no exact match, find the closest mondo value
  const mondoValues = Array.from(new Set(Object.values(lookupTable)));
  const closestMondo = mondoValues.reduce((prev, curr) =>
    Math.abs(curr - mondo) < Math.abs(prev - mondo) ? curr : prev
  );

  // Find all sizes that map to the closest mondo
  for (const [size, sizeMondo] of Object.entries(lookupTable)) {
    if (sizeMondo === closestMondo) {
      matchingSizes.push(Number(size));
    }
  }

  if (matchingSizes.length > 0) {
    matchingSizes.sort((a, b) => a - b);
    return matchingSizes[Math.floor(matchingSizes.length / 2)];
  }

  return undefined;
}

// Convert shoe size from one system to another using Mondo as intermediary
export function convertShoeSize(
  fromSystem: "UK" | "US" | "EU",
  fromValue: number,
  toSystem: "UK" | "US" | "EU"
): number | undefined {
  // If same system, return same value
  if (fromSystem === toSystem) {
    return fromValue;
  }

  // Convert from system → Mondo
  const mondo = getMondoFromShoeSize(fromSystem, fromValue);
  if (mondo === undefined) {
    return undefined;
  }

  // Convert Mondo → to system
  return findClosestShoeSizeForMondo(toSystem, mondo);
}

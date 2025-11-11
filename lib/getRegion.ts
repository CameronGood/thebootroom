// Geo detection utility for affiliate link region selection

export type Region = "UK" | "US" | "EU";

const COUNTRY_TO_REGION: { [key: string]: Region } = {
  // UK
  GB: "UK",
  // US
  US: "US",
  // EU countries
  AT: "EU", BE: "EU", BG: "EU", HR: "EU", CY: "EU", CZ: "EU", DK: "EU",
  EE: "EU", FI: "EU", FR: "EU", DE: "EU", GR: "EU", HU: "EU", IE: "EU",
  IT: "EU", LV: "EU", LT: "EU", LU: "EU", MT: "EU", NL: "EU", PL: "EU",
  PT: "EU", RO: "EU", SK: "EU", SI: "EU", ES: "EU", SE: "EU",
};

/**
 * Detects user's region from IP address using ipapi.co
 * Falls back to localStorage if available, otherwise defaults to US
 */
export async function detectRegion(): Promise<Region> {
  // Check localStorage first (user override)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("region") as Region | null;
    if (stored && ["UK", "US", "EU"].includes(stored)) {
      return stored;
    }
  }

  try {
    // Try to detect from IP
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code;
      
      if (countryCode && COUNTRY_TO_REGION[countryCode]) {
        const region = COUNTRY_TO_REGION[countryCode];
        // Store detected region in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("region", region);
        }
        return region;
      }
    }
  } catch (error) {
    console.warn("Failed to detect region from IP:", error);
  }

  // Default fallback
  return "US";
}

/**
 * Sets the user's preferred region (manual override)
 */
export function setRegion(region: Region): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("region", region);
  }
}

/**
 * Gets the current region from localStorage or returns null
 */
export function getStoredRegion(): Region | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("region") as Region | null;
    if (stored && ["UK", "US", "EU"].includes(stored)) {
      return stored;
    }
  }
  return null;
}


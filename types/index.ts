// Core data types for TheBootRoom

export type Gender = "Male" | "Female";
export type ToeShape = "Round" | "Square" | "Angled";
export type Volume = "Low" | "Average" | "High";
// LAV = Low/Average/High (alias for Volume)
export type LAV = Volume;
export type Ability = "Beginner" | "Intermediate" | "Advanced";
export type Feature = "Walk Mode" | "Rear Entry" | "Calf Adjustment";
export type ShoeSizeSystem = "UK" | "US" | "EU";
export type WidthCategory = "Narrow" | "Average" | "Wide";
export type Region = "UK" | "US" | "EU";
export type BootType = "Standard" | "Freestyle" | "Hybrid" | "Freeride";

export interface AffiliateLink {
  store: string; // e.g., "Ellis Brigham"
  url: string; // full affiliate URL
  logo?: string; // optional image for UI
  available?: boolean; // optional, hide if out of stock
}

export interface QuizAnswers {
  gender: Gender;
  bootType: BootType; // Single boot type selection
  ability: Ability;
  weightKG: number;
  footLengthMM?: { left: number; right: number };
  shoeSize?: { system: ShoeSizeSystem; value: number };
  footWidth?: { left?: number; right?: number } | { category?: WidthCategory };
  toeShape: ToeShape;
  instepHeight: Volume;
  ankleVolume: Volume;
  calfVolume: Volume;
  features: Feature[];
}

export interface BootSummary {
  bootId: string;
  brand: string;
  model: string; // family name when grouped
  flex: number;
  bootType?: BootType; // String: "Standard" | "Freestyle" | "Hybrid" | "Touring"
  lastWidthMM?: number;
  imageUrl?: string;
  affiliateUrl?: string; // Legacy single URL (for backwards compatibility)
  links?: { [region in Region]?: AffiliateLink[] }; // New multi-vendor links
  score: number;
  // Features preserved for comparison purposes
  walkMode?: boolean;
  rearEntry?: boolean;
  calfAdjustment?: boolean;
  models?: {
    model: string;
    flex: number;
    affiliateUrl?: string;
    imageUrl?: string;
  }[];
}

export interface SavedResult {
  quizId: string;
  completedAt: Date;
  recommendedBoots: BootSummary[];
}

export interface User {
  email: string;
  displayName?: string;
  createdAt: Date;
  savedResults: SavedResult[];
}

export interface Boot {
  year: string; // e.g., "25/26"
  gender: Gender;
  bootType: BootType; // String: "Standard" | "Freestyle" | "Hybrid" | "Touring"
  brand: string;
  model: string;
  lastWidthMM?: number; // Optional - can be derived from bootWidth if needed
  bootWidth: WidthCategory; // Categorical width: "Narrow" | "Average" | "Wide"
  flex: number;
  instepHeight: Volume[]; // Array to support multiple values (e.g., "Low;Average")
  ankleVolume: Volume[]; // Array to support multiple values (e.g., "Low;Average")
  calfVolume: Volume[]; // Array to support multiple values (e.g., "Low;Average")
  toeBoxShape: ToeShape;
  calfAdjustment: boolean;
  walkMode: boolean;
  rearEntry: boolean;
  affiliateUrl?: string; // Legacy single URL (for backwards compatibility)
  links?: { [region in Region]?: AffiliateLink[] }; // New multi-vendor links
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSession {
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  answers: QuizAnswers;
  recommendedBoots?: BootSummary[];
  recommendedMondo?: string;
}

export interface AffiliateClick {
  userId?: string;
  sessionId?: string;
  bootId: string;
  brand: string;
  model: string;
  vendor?: string;
  region?: Region;
  affiliateUrl: string;
  timestamp: Date;
  country?: string;
  ua?: string;
}

export interface FittingBreakdownSection {
  bootId: string;
  heading: string;
  body: string;
}

export interface FittingBreakdown {
  userId: string;
  quizId: string;
  language: string;
  modelProvider: string;
  modelName: string;
  generatedAt: Date;
  wordCount: number;
  sections: FittingBreakdownSection[];
}

export interface BillingMetrics {
  purchases: number;
  revenueGBP: number;
  month: string; // YYYY-MM format
}

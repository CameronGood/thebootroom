import { z } from "zod";

// Zod schemas for validation

export const quizAnswersSchema = z.object({
  gender: z.enum(["Male", "Female"]),
  footLengthMM: z
    .object({
      left: z.number().positive(),
      right: z.number().positive(),
    })
    .optional(),
  shoeSize: z
    .object({
      system: z.enum(["UK", "US", "EU"]),
      value: z.number().positive(),
    })
    .optional(),
  footWidth: z
    .union([
      // Option 1: Category selection (check first, more specific)
      // Using .strict() ensures only 'category' property is allowed
      z
        .object({
          category: z.enum(["Narrow", "Average", "Wide"]),
        })
        .strict(),
      // Option 2: MM measurements (must have at least one of left/right)
      z
        .object({
          left: z.number().positive().optional(),
          right: z.number().positive().optional(),
        })
        .refine((data) => data.left !== undefined || data.right !== undefined, {
          message: "Must provide at least one width measurement",
        }),
    ])
    .optional(),
  toeShape: z.enum(["Round", "Square", "Angled"]),
  instepHeight: z.enum(["Low", "Medium", "High"]),
  calfVolume: z.enum(["Low", "Medium", "High"]),
  weightKG: z.number().positive(),
  ability: z.enum(["Beginner", "Intermediate", "Advanced"]),
  touring: z.enum(["Yes", "No"]),
  features: z
    .array(z.enum(["Walk Mode", "Rear Entry", "Calf Adjustment"]))
    .default([]),
});

export const matchRequestSchema = z.object({
  sessionId: z.string().optional(),
  answers: quizAnswersSchema,
});

const affiliateLinkSchema = z.object({
  store: z.string(),
  url: z.string().url(),
  logo: z.string().url().optional(),
  available: z.boolean().optional(),
});

const linksSchema = z
  .record(z.enum(["UK", "US", "EU"]), z.array(affiliateLinkSchema))
  .optional();

export const bootSchema = z.object({
  year: z.string(),
  gender: z.enum(["Male", "Female"]),
  bootType: z.string(),
  brand: z.string(),
  model: z.string(),
  lastWidthMM: z.number().positive(),
  flex: z.number().positive(),
  instepHeight: z.enum(["Low", "Medium", "High"]),
  ankleVolume: z.enum(["Low", "Medium", "High"]),
  calfVolume: z.enum(["Low", "Medium", "High"]),
  toeBoxShape: z.enum(["Round", "Square", "Angled"]),
  calfAdjustment: z.boolean(),
  walkMode: z.boolean(),
  rearEntry: z.boolean(),
  affiliateUrl: z.string().url().optional(),
  links: linksSchema,
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

import { NextRequest, NextResponse } from "next/server";
import { upsertBoot, bootExists } from "@/lib/firestore/boots";
import { bootSchema } from "@/lib/validators";
import { toLAVArray } from "@/lib/utils/parseMulti";
import { verifyAdminAuth } from "@/lib/admin-auth";

// Type for raw CSV row (dynamic keys based on CSV headers)
type CSVRow = Record<string, string>;

// Type for mapped CSV row fields
interface MappedCSVRow {
  year: string;
  gender: string;
  bootType: string;
  brand: string;
  model: string;
  bootWidth: string;
  flex: string;
  lastWidthMM: string;
  toeBoxShape: string;
  instepHeight: string;
  ankleVolume: string;
  calfVolume: string;
  calfAdjustment: string;
  walkMode: string;
  rearEntry: string;
  affiliateUrl: string;
  imageUrl: string;
  tags: string;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Push last value
  return values;
}

function parseCSV(csvText: string): CSVRow[] {
  // Remove BOM if present and normalize line endings
  let cleaned = csvText
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) =>
    h.replace(/^"|"$/g, "").trim()
  );

  // Verify we have the expected headers
  const expectedHeaders = ["year", "gender", "bootType", "brand", "model", "bootWidth"];
  const hasExpectedHeaders = expectedHeaders.every((h) =>
    headers.some((header) => header.toLowerCase() === h.toLowerCase())
  );

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    const values = parseCSVLine(line);

    // Remove quotes from values
    const cleanValues = values.map((v) => v.replace(/^"|"$/g, "").trim());

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = cleanValues[index] || "";
    });
    rows.push(row);
  }

  return rows;
}

function convertYesNoToBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  // Handle various true values
  return (
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1" ||
    normalized === "y"
  );
  // Anything else (including "false", "no", "0", etc.) returns false
}

function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Map different CSV column names to expected field names
function mapRowFields(row: CSVRow): MappedCSVRow {
  // Handle different possible column name variations
  return {
    year: row.year || row.Year || row.size || row.Size || "",
    gender: row.gender || row.Gender || "",
    bootType:
      row.bootType ||
      row["Boot Type"] ||
      row["boot type"] ||
      row.boottype ||
      "",
    brand: row.brand || row.Brand || "",
    model: row.model || row.Model || "",
    bootWidth:
      row.bootWidth ||
      row["bootWidth"] ||
      row["Boot Width"] ||
      row["boot width"] ||
      "",
    flex: row.flex || row.Flex || "",
    lastWidthMM:
      row.lastWidthMM ||
      row["Last Width (mm)"] ||
      row["last width (mm)"] ||
      row["Last Width"] ||
      row.lastWidth ||
      "",
    instepHeight:
      row.instepHeight ||
      row["Instep Height"] ||
      row["instep height"] ||
      row.instep ||
      "",
    ankleVolume:
      row.ankleVolume ||
      row["Ankle Volume"] ||
      row["ankle volume"] ||
      row.ankle ||
      "",
    calfVolume:
      row.calfVolume ||
      row["Calf Volume"] ||
      row["calf volume"] ||
      row.calf ||
      "",
    toeBoxShape:
      row.toeBoxShape ||
      row["Toe Box Shape"] ||
      row["toe box shape"] ||
      row.toe ||
      "",
    calfAdjustment:
      row.calfAdjustment ||
      row["Calf Adjustment"] ||
      row["calf adjustment"] ||
      "",
    walkMode:
      row.walkMode ||
      row["Walk Mode"] ||
      row["walk mode"] ||
      row.walkmode ||
      "",
    rearEntry:
      row.rearEntry ||
      row["Rear Entry"] ||
      row["rear entry"] ||
      row.rearentry ||
      "",
    affiliateUrl:
      row.affiliateUrl ||
      row["Affiliate URL"] ||
      row["affiliate url"] ||
      row["Product URL"] ||
      row["product url"] ||
      row.url ||
      "",
    imageUrl:
      row.imageUrl || row["Image URL"] || row["image url"] || row.image || "",
    tags: row.tags || row.Tags || "",
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const csvFile = formData.get("csv") as File | null;
    const csvText = formData.get("csvText") as string | null;

    let csvContent: string;
    if (csvFile) {
      csvContent = await csvFile.text();
    } else if (csvText) {
      csvContent = csvText;
    } else {
      return NextResponse.json(
        { error: "CSV file or text is required" },
        { status: 400 }
      );
    }

    const rows = parseCSV(csvContent);
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;
    let duplicates = 0;

    if (rows.length === 0) {
      errors.push(
        "No rows found in CSV. Make sure CSV has a header row and at least one data row."
      );
    }

    for (let i = 0; i < rows.length; i++) {
      try {
        const rawRow = rows[i];

        // Skip empty rows - check all possible column name variations
        // Check if brand/model exist and are not empty strings
        const brandValue = (rawRow.brand || rawRow.Brand || rawRow.BRAND || "")
          .toString()
          .trim();
        const modelValue = (rawRow.model || rawRow.Model || rawRow.MODEL || "")
          .toString()
          .trim();

        if (!brandValue && !modelValue) {
          skipped++;
          continue;
        }

        // Map to expected field names
        const row = mapRowFields(rawRow);

        // Parse numeric values with validation
        // Handle flex values that might have two numbers (e.g., "102 95" - take the second one)
        let flexValue = (row.flex || "").toString().trim();
        if (flexValue.includes(" ")) {
          // If flex has two numbers, take the second one (the actual flex rating)
          const flexParts = flexValue.split(/\s+/);
          flexValue = flexParts[flexParts.length - 1];
        }

        const flex = parseFloat(flexValue || "0");

        if (isNaN(flex) || flex <= 0) {
          errors.push(
            `Row ${i + 2}: Invalid flex (must be a positive number). Got: "${row.flex}"`
          );
          continue;
        }

        // Normalize enum values (capitalize first letter)
        const normalizeEnum = (
          value: string,
          validValues: string[]
        ): string | null => {
          if (!value) return null;
          // Trim and normalize
          const normalized = value.trim();
          // Try exact match first
          if (validValues.includes(normalized)) return normalized;
          // Try case-insensitive match
          const lower = normalized.toLowerCase();
          const found = validValues.find((v) => v.toLowerCase() === lower);
          if (found) return found;
          // Try capitalizing first letter (handle trailing spaces)
          const trimmed = normalized.trim();
          const capitalized =
            trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          if (validValues.includes(capitalized)) return capitalized;
          return null;
        };

        const gender = normalizeEnum(row.gender, ["Male", "Female"]);
        // Parse multi-value LAV fields (semicolon-separated in CSV)
        const instepHeight = toLAVArray(row.instepHeight);
        const ankleVolume = toLAVArray(row.ankleVolume);
        const calfVolume = toLAVArray(row.calfVolume);
        const toeBoxShape = normalizeEnum(row.toeBoxShape, [
          "Round",
          "Square",
          "Angled",
        ]);
        const bootWidth = normalizeEnum(row.bootWidth, [
          "Narrow",
          "Average",
          "Wide",
        ]);

        if (!gender) {
          errors.push(
            `Row ${i + 2}: Invalid gender (must be "Male" or "Female")`
          );
          continue;
        }
        if (instepHeight.length === 0) {
          errors.push(
            `Row ${i + 2}: Invalid instepHeight (must be "Low", "Average", or "High", semicolon-separated for multiple values)`
          );
          continue;
        }
        if (ankleVolume.length === 0) {
          errors.push(
            `Row ${i + 2}: Invalid ankleVolume (must be "Low", "Average", or "High", semicolon-separated for multiple values)`
          );
          continue;
        }
        if (calfVolume.length === 0) {
          errors.push(
            `Row ${i + 2}: Invalid calfVolume (must be "Low", "Average", or "High", semicolon-separated for multiple values)`
          );
          continue;
        }
        if (!toeBoxShape) {
          errors.push(
            `Row ${i + 2}: Invalid toeBoxShape (must be "Round", "Square", or "Angled")`
          );
          continue;
        }
        if (!bootWidth) {
          errors.push(
            `Row ${i + 2}: Invalid bootWidth (must be "Narrow", "Average", or "Wide")`
          );
          continue;
        }

        // Handle URLs - only validate if provided
        let affiliateUrl = (row.affiliateUrl || "").trim();
        let imageUrl = (row.imageUrl || "").trim();

        // Add https:// if URL doesn't have protocol
        if (affiliateUrl && !affiliateUrl.startsWith("http")) {
          if (affiliateUrl.startsWith("www.")) {
            affiliateUrl = "https://" + affiliateUrl;
          } else if (affiliateUrl) {
            errors.push(
              `Row ${i + 2}: Invalid affiliateUrl (must start with http://, https://, or www.)`
            );
            continue;
          }
        }

        if (imageUrl && !imageUrl.startsWith("http")) {
          if (imageUrl.startsWith("www.")) {
            imageUrl = "https://" + imageUrl;
          } else if (imageUrl) {
            errors.push(
              `Row ${i + 2}: Invalid imageUrl (must start with http://, https://, or www.)`
            );
            continue;
          }
        }

        // Parse bootType as string
        const bootTypeStr = (row.bootType || "").toString().trim();

        // Normalize bootType to match enum values
        const normalizeBootType = (value: string): string | null => {
          if (!value) return null;
          const normalized = value.trim();
          // Try exact match first
          if (["Standard", "Freestyle", "Hybrid", "Freeride"].includes(normalized)) {
            return normalized;
          }
          // Try case-insensitive match
          const lower = normalized.toLowerCase();
          if (lower === "standard" || lower === "all-mountain") return "Standard";
          if (lower === "freestyle") return "Freestyle";
          if (lower === "hybrid") return "Hybrid";
          if (lower === "freeride") return "Freeride";
          // Try capitalizing first letter
          const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
          if (["Standard", "Freestyle", "Hybrid", "Freeride"].includes(capitalized)) {
            return capitalized;
          }
          return null;
        };

        const bootType = normalizeBootType(bootTypeStr);
        if (!bootType) {
          errors.push(
            `Row ${i + 2}: Invalid bootType (must be "Standard", "Freestyle", "Hybrid", or "Freeride"). Got: "${bootTypeStr}"`
          );
          continue;
        }

        const bootData = {
          year: (row.year || "").trim(),
          gender: gender as "Male" | "Female",
          bootType: bootType as "Standard" | "Freestyle" | "Hybrid" | "Freeride",
          brand: (row.brand || "").trim(),
          model: (row.model || "").trim(),
          bootWidth: bootWidth as "Narrow" | "Average" | "Wide",
          flex,
          instepHeight: instepHeight,
          ankleVolume: ankleVolume,
          calfVolume: calfVolume,
          toeBoxShape: toeBoxShape as "Round" | "Square" | "Angled",
          calfAdjustment: convertYesNoToBoolean(row.calfAdjustment),
          walkMode: convertYesNoToBoolean(row.walkMode),
          rearEntry: convertYesNoToBoolean(row.rearEntry),
          affiliateUrl: affiliateUrl || undefined,
          imageUrl: imageUrl || undefined,
          tags: parseTags(row.tags || ""),
        };

        // Validate with Zod (should pass now, but catch any remaining issues)
        const validated = bootSchema.parse(bootData);

        // Check for duplicates before importing
        const exists = await bootExists(
          validated.brand,
          validated.model,
          validated.year,
          validated.gender
        );

        if (exists) {
          duplicates++;
          continue;
        }

        const savedBootId = await upsertBoot(validated);
        imported++;
      } catch (error: unknown) {
        // Better error messages
        let errorMsg = "Invalid data";
        if (error && typeof error === "object" && "errors" in error && Array.isArray(error.errors)) {
          // Zod validation errors
          errorMsg = error.errors
            .map((e: { path: (string | number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        // Only show first 20 errors to avoid overwhelming the UI
        if (errors.length < 20) {
          errors.push(`Row ${i + 2}: ${errorMsg}`);
        } else if (errors.length === 20) {
          errors.push(
            `... and ${rows.length - i - 1} more errors (showing first 20)`
          );
        }
      }
    }

    const result = {
      imported,
      errors,
      total: rows.length,
      skipped,
      duplicates,
      processed: imported + errors.length + skipped + duplicates,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Import boots error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

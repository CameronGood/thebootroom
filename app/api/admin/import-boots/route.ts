import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { upsertBoot, bootExists } from "@/lib/firestore/boots";
import { bootSchema } from "@/lib/validators";

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return false;
    }
    const token = authHeader.substring(7);
    // In a real app, verify the token and check claims
    // For now, we'll check on the client side and pass a flag
    // This should be properly implemented with Firebase Admin SDK on the server
    return false; // Placeholder - implement proper admin check
  } catch {
    return false;
  }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim()); // Push last value
  return values;
}

function parseCSV(csvText: string): any[] {
  // Remove BOM if present and normalize line endings
  let cleaned = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter(line => line.trim());
  
  if (lines.length < 2) {
    console.log("Not enough lines in CSV. Lines:", lines.length);
    return [];
  }

  // Parse header row
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.replace(/^"|"$/g, "").trim());
  
  console.log("Parsed headers:", headers);
  console.log("Header count:", headers.length);
  
  // Verify we have the expected headers
  const expectedHeaders = ["year", "gender", "bootType", "brand", "model"];
  const hasExpectedHeaders = expectedHeaders.every(h => 
    headers.some(header => header.toLowerCase() === h.toLowerCase())
  );
  
  if (!hasExpectedHeaders) {
    console.warn("Warning: CSV headers don't match expected format. Found:", headers);
  }

  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    // Remove quotes from values
    const cleanValues = values.map(v => v.replace(/^"|"$/g, "").trim());

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = cleanValues[index] || "";
    });
    rows.push(row);
  }

  console.log(`Parsed ${rows.length} data rows`);
  if (rows.length > 0) {
    console.log("First row keys:", Object.keys(rows[0]));
    console.log("First row sample:", rows[0]);
  }

  return rows;
}

function convertYesNoToBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  // Handle various true values
  return normalized === "yes" || normalized === "true" || normalized === "1" || normalized === "y";
  // Anything else (including "false", "no", "0", etc.) returns false
}

function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString.split(";").map((t) => t.trim()).filter(Boolean);
}

// Map different CSV column names to expected field names
function mapRowFields(row: any) {
  // Handle different possible column name variations
  return {
    year: row.year || row.Year || row.size || row.Size || "",
    gender: row.gender || row.Gender || "",
    bootType: row.bootType || row["Boot Type"] || row["boot type"] || row.boottype || "",
    brand: row.brand || row.Brand || "",
    model: row.model || row.Model || "",
    lastWidthMM: row.lastWidthMM || row["lastWidthMM"] || row["Last Width MM"] || row.width || row.Width || "",
    flex: row.flex || row.Flex || "",
    instepHeight: row.instepHeight || row["Instep Height"] || row["instep height"] || row.instep || "",
    ankleVolume: row.ankleVolume || row["Ankle Volume"] || row["ankle volume"] || row.ankle || "",
    calfVolume: row.calfVolume || row["Calf Volume"] || row["calf volume"] || row.calf || "",
    toeBoxShape: row.toeBoxShape || row["Toe Box Shape"] || row["toe box shape"] || row.toe || "",
    calfAdjustment: row.calfAdjustment || row["Calf Adjustment"] || row["calf adjustment"] || "",
    walkMode: row.walkMode || row["Walk Mode"] || row["walk mode"] || row.walkmode || "",
    rearEntry: row.rearEntry || row["Rear Entry"] || row["rear entry"] || row.rearentry || "",
    affiliateUrl: row.affiliateUrl || row["Affiliate URL"] || row["affiliate url"] || row["Product URL"] || row["product url"] || row.url || "",
    imageUrl: row.imageUrl || row["Image URL"] || row["image url"] || row.image || "",
    tags: row.tags || row.Tags || "",
  };
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper admin check with Firebase Admin SDK
    // For now, this is a placeholder
    // const admin = await isAdmin(request);
    // if (!admin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

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

    // Debug: Log first row headers to help diagnose CSV format issues
    if (rows.length > 0) {
      console.log("CSV Headers detected:", Object.keys(rows[0]));
      console.log("First row sample:", JSON.stringify(rows[0], null, 2));
      console.log("Total rows to process:", rows.length);
      
      // Check if brand/model column headers exist (check column names, not data values)
      const headers = Object.keys(rows[0]);
      const headerLower = headers.map(h => h.toLowerCase());
      const hasBrandHeader = headerLower.some(h => h === "brand");
      const hasModelHeader = headerLower.some(h => h === "model");
      
      console.log("Has brand header:", hasBrandHeader, "Has model header:", hasModelHeader);
      
      // Only warn if headers are completely missing - but don't block import
      // The mapRowFields function handles various column name variations
      if (!hasBrandHeader && !hasModelHeader) {
        console.warn("Warning: Brand or model column headers not found. Import will continue but may skip rows without brand/model data.");
      }
    } else {
      errors.push("No rows found in CSV. Make sure CSV has a header row and at least one data row.");
    }

    for (let i = 0; i < rows.length; i++) {
      try {
        const rawRow = rows[i];
        
        // Skip empty rows - check all possible column name variations
        // Check if brand/model exist and are not empty strings
        const brandValue = (rawRow.brand || rawRow.Brand || rawRow.BRAND || "").toString().trim();
        const modelValue = (rawRow.model || rawRow.Model || rawRow.MODEL || "").toString().trim();
        
        if (!brandValue && !modelValue) {
          skipped++;
          if (i < 3) {
            console.log(`Skipping row ${i + 2} - no brand/model found. Row keys:`, Object.keys(rawRow));
            console.log(`Row ${i + 2} brand: "${brandValue}", model: "${modelValue}"`);
            console.log(`Row ${i + 2} full data:`, rawRow);
          }
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
        
        const lastWidthMM = parseFloat(row.lastWidthMM || "0");
        const flex = parseFloat(flexValue || "0");
        
        if (isNaN(lastWidthMM) || lastWidthMM <= 0) {
          errors.push(`Row ${i + 2}: Invalid lastWidthMM (must be a positive number). Got: "${row.lastWidthMM}"`);
          continue;
        }
        
        if (isNaN(flex) || flex <= 0) {
          errors.push(`Row ${i + 2}: Invalid flex (must be a positive number). Got: "${row.flex}"`);
          continue;
        }

        // Normalize enum values (capitalize first letter)
        const normalizeEnum = (value: string, validValues: string[]): string | null => {
          if (!value) return null;
          // Trim and normalize
          const normalized = value.trim();
          // Try exact match first
          if (validValues.includes(normalized)) return normalized;
          // Try case-insensitive match
          const lower = normalized.toLowerCase();
          const found = validValues.find(v => v.toLowerCase() === lower);
          if (found) return found;
          // Try capitalizing first letter (handle trailing spaces)
          const trimmed = normalized.trim();
          const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          if (validValues.includes(capitalized)) return capitalized;
          return null;
        };

        const gender = normalizeEnum(row.gender, ["Male", "Female"]);
        const instepHeight = normalizeEnum(row.instepHeight, ["Low", "Medium", "High"]);
        const ankleVolume = normalizeEnum(row.ankleVolume, ["Low", "Medium", "High"]);
        const calfVolume = normalizeEnum(row.calfVolume, ["Low", "Medium", "High"]);
        const toeBoxShape = normalizeEnum(row.toeBoxShape, ["Round", "Square", "Angled"]);

        if (!gender) {
          errors.push(`Row ${i + 2}: Invalid gender (must be "Male" or "Female")`);
          continue;
        }
        if (!instepHeight) {
          errors.push(`Row ${i + 2}: Invalid instepHeight (must be "Low", "Medium", or "High")`);
          continue;
        }
        if (!ankleVolume) {
          errors.push(`Row ${i + 2}: Invalid ankleVolume (must be "Low", "Medium", or "High")`);
          continue;
        }
        if (!calfVolume) {
          errors.push(`Row ${i + 2}: Invalid calfVolume (must be "Low", "Medium", or "High")`);
          continue;
        }
        if (!toeBoxShape) {
          errors.push(`Row ${i + 2}: Invalid toeBoxShape (must be "Round", "Square", or "Angled")`);
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
            errors.push(`Row ${i + 2}: Invalid affiliateUrl (must start with http://, https://, or www.)`);
            continue;
          }
        }
        
        if (imageUrl && !imageUrl.startsWith("http")) {
          if (imageUrl.startsWith("www.")) {
            imageUrl = "https://" + imageUrl;
          } else if (imageUrl) {
            errors.push(`Row ${i + 2}: Invalid imageUrl (must start with http://, https://, or www.)`);
            continue;
          }
        }

        const bootData = {
          year: (row.year || "").trim(),
          gender: gender as "Male" | "Female",
          bootType: (row.bootType || "").trim(),
          brand: (row.brand || "").trim(),
          model: (row.model || "").trim(),
          lastWidthMM,
          flex,
          instepHeight: instepHeight as "Low" | "Medium" | "High",
          ankleVolume: ankleVolume as "Low" | "Medium" | "High",
          calfVolume: calfVolume as "Low" | "Medium" | "High",
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
          console.log(`⏭️  Skipped duplicate: ${validated.brand} ${validated.model} ${validated.year} ${validated.gender}`);
          continue;
        }
        
        const savedBootId = await upsertBoot(validated);
        console.log(`✅ Imported boot: ${validated.brand} ${validated.model} (ID: ${savedBootId})`);
        imported++;
      } catch (error: any) {
        // Better error messages
        let errorMsg = "Invalid data";
        if (error.errors && Array.isArray(error.errors)) {
          // Zod validation errors
          errorMsg = error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
        } else if (error.message) {
          errorMsg = error.message;
        }
        // Only show first 20 errors to avoid overwhelming the UI
        if (errors.length < 20) {
          errors.push(`Row ${i + 2}: ${errorMsg}`);
        } else if (errors.length === 20) {
          errors.push(`... and ${rows.length - i - 1} more errors (showing first 20)`);
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
    
    console.log("Import summary:", result);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Import boots error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}


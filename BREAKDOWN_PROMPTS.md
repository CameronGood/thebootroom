# AI Breakdown Generation - Prompts and Data

## Current Prompts Being Used (Updated for New Quiz Structure)

### System Message
```
"You are a professional ski boot fitter. Provide detailed, accurate fitting analyses in JSON format only."
```

### Main User Prompt

The prompt is constructed from the following parts:

#### 1. User Profile Section
This is built from the quiz answers and includes:

```
User Profile:
- Gender: ${answers.gender}           // "Male" or "Female"
- Weight: ${answers.weightKG}kg        // User's weight in kilograms
- Ability: ${answers.ability}          // "Beginner", "Intermediate", or "Advanced"
- Foot Width: ${calculated}            // Either category ("Narrow"/"Average"/"Wide") or measurement in mm
- Toe Shape: ${answers.toeShape}       // "Round", "Square", or "Angled"
- Instep Height: ${answers.instepHeight}  // "Low", "Average", or "High"
- Ankle Volume: ${answers.ankleVolume}    // "Low", "Average", or "High"
- Calf Volume: ${answers.calfVolume}      // "Low", "Average", or "High"
- Boot Type: ${answers.bootType}          // "Standard", "Freestyle", "Hybrid", or "Freeride"
```

**Note:** Features have been removed from the quiz structure and are no longer included in the prompt.

**Foot Width Calculation Logic:**
- If user selected a category: Shows the category name (e.g., "Narrow")
- If user provided mm measurements: Shows the measurement (e.g., "95mm")
- If neither: Shows "Not specified"

**Foot Length Information:**
- If foot length in mm is provided: Shows length and calculated mondo size
- If shoe size is provided: Shows shoe size system and value

#### 2. User's Recommended Flex Range
Calculated based on gender, ability, and weight:

```
User's Recommended Flex Range: ${flexRange} (Target: ${targetFlex})
```

This dynamically calculates acceptable flex values based on:
- Gender (Male/Female)
- Ability level (Beginner/Intermediate/Advanced)
- Weight (adjusted up/down for lighter/heavier skiers)

#### 3. Boots Information Section
For each recommended boot:

```
Boot ${idx + 1} (bootId: ${boot.bootId}): ${boot.brand} ${boot.model}
- Flex: ${boot.flex}
- Match Score: ${boot.score}/100
- Last Width: ${boot.lastWidthMM}mm (if available)
- Available Models: [list of model variants with flex ratings if available]
```

This includes:
- **boot.bootId**: Unique identifier for the boot
- **boot.brand**: The boot manufacturer (e.g., "Salomon", "Rossignol")
- **boot.model**: The boot model name (e.g., "S/Pro 100", "Alltrack 120")
- **boot.flex**: The flex rating (e.g., 100, 110, 120)
- **boot.score**: The match score out of 100 calculated by the matching algorithm
- **boot.lastWidthMM**: The last width in mm (if available)
- **boot.models**: Array of available model variants with different flex ratings (if available)

#### 4. Required Breakdown Sections

Each boot breakdown is now in SHORT BULLET POINT format (3-5 bullet points, each 1-2 sentences max):

1. **Boot Range and Match Score [SCORE]** (NOT "/100" - just the number)
   - Format as bullet points using "- " at the start of each point
   - Start with a brief statement about why this boot is a great match (1 sentence)
   - Then list key factors in bullet points:
     * Width compatibility - Compare user's width category to boot's width category (be specific, e.g., "narrow-to-narrow match")
     * Shape and volume harmony - Compare user's characteristics (toe shape, instep, ankle, calf) to boot's specifications
     * What this means for fit - Brief statement about out-of-box fit expectations
   - Keep information dense and minimize conversational chat while maintaining warm, expert tone
   - Never use "perfect fit" - use "great out-of-box fit", "excellent initial fit", or "strong match"

**Note:** The breakdown now focuses ONLY on the match score. Flex selection and fitting advice are handled separately in static components (FlexSelectionGuide and FittingAdviceGuide).

#### 5. Complete Prompt Template

```
You are a warm, experienced ski boot fitter who genuinely cares about helping customers find their perfect fit. 
Write natural, engaging analyses that feel like a real conversation with an expert boot fitter for each recommended boot based on the user's profile and boot specifications.

{User Profile Section}
{Foot Length Information}
User's Recommended Flex Range: {flexRange} (Target: {targetFlex})

Recommended Boots:
{Boots Info Section with bootIds}

For EACH boot, write a concise breakdown in SHORT BULLET POINT format (3-5 bullet points, each 1-2 sentences max):

1. **Boot Range and Match Score [SCORE]** (NOT "/100" - just the number)
   - Format as bullet points using "- " at the start of each point
   - Start with a brief statement about why this boot is a great match (1 sentence)
   - Then list key factors in bullet points:
     * Width compatibility - Compare user's width category to boot's width category
     * Shape and volume harmony - Compare user's characteristics to boot's specifications
     * What this means for fit - Brief statement about out-of-box fit expectations
   - Keep information dense and minimize conversational chat while maintaining warm, expert tone
   - Never use "perfect fit" - use "great out-of-box fit", "excellent initial fit", or "strong match"

Format the response using British English spelling and terminology. Write in a warm, expert tone but keep it concise. 
Do NOT mention prices or retailers. Write in British English only.

Return JSON with sections array, each containing bootId, heading, and body (with bullet points).
```

**Format:** Short bullet points (3-5 points, each 1-2 sentences max)
**Tone:** Warm, expert, information-dense, minimal chat
**Max Tokens:** 900 (reduced to accommodate shorter, more focused responses)

## Data Sources

### Input Data Structure

#### QuizAnswers Type
```typescript
{
  gender: "Male" | "Female"
  bootType: "Standard" | "Freestyle" | "Hybrid" | "Freeride"
  ability: "Beginner" | "Intermediate" | "Advanced"
  weightKG: number
  footLengthMM?: { left: number; right: number }
  shoeSize?: { system: "UK" | "US" | "EU"; value: number }
  footWidth?: { left?: number; right?: number } | { category?: "Narrow" | "Average" | "Wide" }
  toeShape: "Round" | "Square" | "Angled"
  instepHeight: "Low" | "Average" | "High"
  ankleVolume: "Low" | "Average" | "High"
  calfVolume: "Low" | "Average" | "High"
  features: ("Walk Mode" | "Rear Entry" | "Calf Adjustment")[]
}
```

#### BootSummary Type (what gets sent to AI)
```typescript
{
  bootId: string
  brand: string
  model: string
  flex: number
  score: number        // Match score out of 100
  bootType?: string
  lastWidthMM?: number
  imageUrl?: string
  affiliateUrl?: string
  links?: { [region in "UK" | "US" | "EU"]?: AffiliateLink[] }
  walkMode?: boolean
  rearEntry?: boolean
  calfAdjustment?: boolean
  models?: Array<{
    model: string
    flex: number
    affiliateUrl?: string
    imageUrl?: string
  }>
}
```

## AI Model Configuration

- **Model**: OpenAI GPT-4o
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 1600 (allows for ~1200-1400 words total for multiple boots)
- **Response Format**: JSON object (structured output)
- **Language**: British English (en-GB)

## Output Structure

### FittingBreakdownSection
```typescript
{
  bootId: string        // Matches the boot being analyzed
  heading: string       // "Boot Name - Brief Fit Summary"
  body: string          // 250-400 words of detailed analysis
}
```

### Complete Breakdown Response
```typescript
{
  userId: string
  quizId: string
  language: "en-GB"
  modelProvider: "openai"
  modelName: "gpt-4o"
  generatedAt: Date
  wordCount: number
  sections: FittingBreakdownSection[]
}
```

## Example Prompt (Fully Constructed)

```
You are a professional ski boot fitter with years of experience. 
Write clear, specific, data-driven analyses for each recommended boot based on the user's profile and boot specifications.

User Profile:
- Gender: Male
- Weight: 75kg
- Ability: Intermediate
- Foot Width: Average
- Toe Shape: Round
- Instep Height: Average
- Ankle Volume: Average
- Calf Volume: High
- Boot Type: Standard
- Features: Walk Mode, Calf Adjustment

Recommended Boots:
Boot 1: Salomon S/Pro 100
- Flex: 100
- Match Score: 85/100

Boot 2: Rossignol Alltrack 120
- Flex: 110
- Match Score: 82/100

Boot 3: Tecnica Mach1 105
- Flex: 105
- Match Score: 78/100

Write one section per boot (250-400 words each). Each section should:
1. Explain why this boot matches the user's profile
2. Highlight specific fit characteristics (width, volume, flex)
3. Discuss how the boot's features align with the user's needs
4. Provide practical fitting advice

Do NOT mention prices or retailers. Write in British English.

Return ONLY a JSON object with this exact structure:
{
  "sections": [
    {
      "bootId": "boot-id-1",
      "heading": "Boot Name - Brief Fit Summary",
      "body": "Detailed analysis text (250-400 words)..."
    },
    {
      "bootId": "boot-id-2",
      "heading": "Boot Name - Brief Fit Summary",
      "body": "Detailed analysis text (250-400 words)..."
    }
  ]
}
```

## Notes

- The prompt explicitly asks for **British English** spelling and terminology
- **No prices or retailers** should be mentioned in the breakdown
- Each boot gets **250-400 words** of analysis
- The breakdown focuses on **data-driven** insights based on the matching algorithm
- Boot IDs are matched to ensure sections correspond to the correct boots

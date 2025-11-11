import OpenAI from "openai";
import { QuizAnswers, BootSummary, FittingBreakdownSection } from "@/types";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBreakdown({
  answers,
  boots,
  language = "en-GB",
}: {
  answers: QuizAnswers;
  boots: BootSummary[];
  language?: string;
}): Promise<FittingBreakdownSection[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    return [];
  }

  try {
    // Build prompt
    const userProfile = `
User Profile:
- Gender: ${answers.gender}
- Weight: ${answers.weightKG}kg
- Ability: ${answers.ability}
- Foot Width: ${
      "category" in (answers.footWidth || {})
        ? answers.footWidth.category
        : answers.footWidth?.left || answers.footWidth?.right
          ? `${answers.footWidth.left || answers.footWidth.right}mm`
          : "Not specified"
    }
- Toe Shape: ${answers.toeShape}
- Instep Height: ${answers.instepHeight}
- Calf Volume: ${answers.calfVolume}
- Touring: ${answers.touring}
- Features: ${answers.features.join(", ") || "None"}
`;

    const bootsInfo = boots
      .map(
        (boot, idx) => `
Boot ${idx + 1}: ${boot.brand} ${boot.model}
- Flex: ${boot.flex}
- Match Score: ${boot.score}/100
`
      )
      .join("\n");

    const prompt = `You are a professional ski boot fitter with years of experience. 
Write clear, specific, data-driven analyses for each recommended boot based on the user's profile and boot specifications.

${userProfile}

Recommended Boots:
${bootsInfo}

Write one section per boot (250-400 words each). Each section should:
1. Explain why this boot matches the user's profile
2. Highlight specific fit characteristics (width, volume, flex)
3. Discuss how the boot's features align with the user's needs
4. Provide practical fitting advice

Do NOT mention prices or retailers. Write in ${language === "en-GB" ? "British English" : "English"}.

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
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a professional ski boot fitter. Provide detailed, accurate fitting analyses in JSON format only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1600,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response - OpenAI with json_object format returns an object
    const parsed = JSON.parse(responseText);

    // Handle both { sections: [...] } and direct array formats
    let sections = [];
    if (Array.isArray(parsed)) {
      sections = parsed;
    } else if (parsed.sections && Array.isArray(parsed.sections)) {
      sections = parsed.sections;
    } else {
      // Try to find any array in the response
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          sections = parsed[key];
          break;
        }
      }
    }

    // Ensure bootIds match
    return sections.map((section: any, idx: number) => ({
      bootId: section.bootId || boots[idx]?.bootId || `boot-${idx}`,
      heading: section.heading || `${boots[idx]?.brand} ${boots[idx]?.model}`,
      body: section.body || "",
    }));
  } catch (error: any) {
    console.error("Error generating breakdown:", error);
    return [];
  }
}

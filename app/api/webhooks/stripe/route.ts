import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/firestore/quizSessions";
import { generateBreakdown } from "@/lib/aiProvider";
import {
  saveFittingBreakdown,
  breakdownExists,
} from "@/lib/firestore/fittingBreakdowns";
import { incrementBillingMetrics } from "@/lib/firestore/billingMetrics";
import { BREAKDOWN_PRICE_GBP } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const { userId, quizId, selectedModels: selectedModelsStr } = paymentIntent.metadata;

    if (!userId || !quizId) {
      console.error("Missing userId or quizId in payment intent metadata");
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    try {
      // Check if breakdown already exists (idempotency)
      const exists = await breakdownExists(userId, quizId);
      if (exists) {
        console.log(`Breakdown already exists for ${userId}_${quizId}`);
        return NextResponse.json({ received: true, skipped: true });
      }

      // Fetch quiz session
      const session = await getSession(quizId);
      if (!session || !session.answers || !session.recommendedBoots) {
        console.error("Session not found or incomplete");
        return NextResponse.json(
          { error: "Session not found or incomplete" },
          { status: 404 }
        );
      }

      // Parse selected models if provided
      let selectedModels: Record<string, number[]> | undefined;
      if (selectedModelsStr) {
        try {
          selectedModels = JSON.parse(selectedModelsStr);
        } catch (e) {
          console.error("Failed to parse selectedModels:", e);
        }
      }

      // Filter boots to only include selected models if provided
      let bootsToInclude = session.recommendedBoots;
      if (selectedModels && Object.keys(selectedModels).length > 0) {
        bootsToInclude = session.recommendedBoots.map(boot => {
          const selectedIndices = selectedModels[boot.bootId];
          if (selectedIndices && boot.models && boot.models.length > 0) {
            // Filter models to only include selected ones
            const filteredModels = boot.models.filter((_, index) => 
              selectedIndices.includes(index)
            );
            return {
              ...boot,
              models: filteredModels,
            };
          }
          return boot;
        });
      }

      // Generate breakdown using GPT-4o
      const sections = await generateBreakdown({
        answers: session.answers,
        boots: bootsToInclude,
        language: "en-GB",
      });

      if (sections.length === 0) {
        console.error("Failed to generate breakdown");
        return NextResponse.json(
          { error: "Failed to generate breakdown" },
          { status: 500 }
        );
      }

      // Calculate word count
      const wordCount = sections.reduce(
        (count, section) =>
          count + section.body.split(/\s+/).filter(Boolean).length,
        0
      );

      // Save breakdown to Firestore
      await saveFittingBreakdown(userId, quizId, {
        language: "en-GB",
        modelProvider: "openai",
        modelName: "gpt-4o",
        wordCount,
        sections,
      });

      // Increment billing metrics
      const amountGBP = BREAKDOWN_PRICE_GBP / 100; // Convert pennies to pounds
      await incrementBillingMetrics(amountGBP);

      console.log(`Breakdown generated and saved for ${userId}_${quizId}`);
      return NextResponse.json({ received: true });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

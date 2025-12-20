import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@/lib/firestore/quizSessions";
import { createOrUpdateSessionAdmin } from "@/lib/firestore/quizSessionsAdmin";
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

  if (!stripe) {
    console.error("Stripe is not initialized");
    return NextResponse.json(
      { error: "Stripe not configured" },
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
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const { userId, quizId, selectedModels: selectedModelsStr } = paymentIntent.metadata;

    if (!quizId) {
      console.error("Missing quizId in payment intent metadata");
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    // userId is optional - for anonymous purchases
    const isAnonymous = !userId || userId === "";

    try {
      // Check if breakdown already exists (idempotency) - only for authenticated users
      if (!isAnonymous) {
      const exists = await breakdownExists(userId, quizId);
      if (exists) {
        return NextResponse.json({ received: true, skipped: true });
        }
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

      if (isAnonymous) {
        // For anonymous users: just mark the session as paid
        // The breakdown will be generated on-demand when they click the button
        await createOrUpdateSessionAdmin(quizId, {
          paymentIntentId: paymentIntent.id,
          answers: {
            ...session.answers,
            paidForComparison: true,
          },
        });
        console.log(`Payment received for anonymous user - session ${quizId} marked as paid`);
      } else {
        // For authenticated users: generate and save breakdown automatically
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
        
        // Update the session to mark payment received
        await createOrUpdateSessionAdmin(quizId, {
          paymentIntentId: paymentIntent.id,
          answers: {
            ...session.answers,
            paidForComparison: true,
          },
        });
        console.log(`Breakdown saved and session ${quizId} marked as paid for user ${userId}`);
      }

      // Increment billing metrics
      const amountGBP = BREAKDOWN_PRICE_GBP / 100; // Convert pennies to pounds
      await incrementBillingMetrics(amountGBP);

      return NextResponse.json({ received: true });
    } catch (error: unknown) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

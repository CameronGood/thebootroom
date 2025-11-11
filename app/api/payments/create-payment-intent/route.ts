import { NextRequest, NextResponse } from "next/server";
import { stripe, BREAKDOWN_PRICE_GBP } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is initialized
    if (!stripe) {
      console.error("Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable.");
      return NextResponse.json(
        { error: "Payment service not configured. Please check server configuration." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { quizId, userId } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: "quizId is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: BREAKDOWN_PRICE_GBP,
      currency: "gbp",
      metadata: {
        userId,
        quizId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Payment intent created but no client secret returned");
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Payment intent creation error:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    return NextResponse.json(
      { 
        error: error.message || "Failed to create payment intent",
        details: error.type || error.code || "Unknown error"
      },
      { status: 500 }
    );
  }
}


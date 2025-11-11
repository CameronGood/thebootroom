// Stripe server-side initialization
import Stripe from "stripe";

let stripe: Stripe | null = null;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set in environment variables");
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });
  }
} catch (error) {
  console.error("Error initializing Stripe:", error);
}

export { stripe };

if (!stripe) {
  console.warn("Stripe is not initialized. Payment features will not work.");
}

// Payment amount in pennies (GBP)
export const BREAKDOWN_PRICE_GBP = 299; // £2.99


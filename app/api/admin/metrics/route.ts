import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { verifyAdminAuth } from "@/lib/admin-auth";

// Firestore document types
interface QuizSessionDocument {
  completedAt?: Date | FirebaseFirestore.Timestamp;
  [key: string]: unknown;
}

interface AffiliateClickDocument {
  bootId: string;
  brand: string;
  model: string;
  country?: string;
  region?: string;
  vendor?: string;
  clickedAt: Date | FirebaseFirestore.Timestamp;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.isAdmin) {
      console.error("[Metrics API] Unauthorized:", authResult.error);
      return NextResponse.json(
        { error: authResult.error || "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get all users (using Admin SDK)
    const usersSnapshot = await adminFirestore.collection("users").get();
    const usersCount = usersSnapshot.size;

    // Get all quiz sessions (using Admin SDK)
    const sessionsSnapshot = await adminFirestore.collection("quizSessions").get();
    const sessions = sessionsSnapshot.docs.map((doc) => doc.data() as QuizSessionDocument);
    const quizStarts = sessions.length;
    const quizCompletions = sessions.filter((s) => s.completedAt !== undefined).length;

    // Get all affiliate clicks (using Admin SDK)
    const clicksSnapshot = await adminFirestore.collection("affiliateClicks").get();
    const clicks = clicksSnapshot.docs.map((doc) => doc.data() as AffiliateClickDocument);
    const affiliateClicks = clicks.length;

    // Calculate top boot clicks
    const bootClickCounts: Record<
      string,
      { bootId: string; brand: string; model: string; clicks: number }
    > = {};
    clicks.forEach((click) => {
      const key = click.bootId;
      if (!bootClickCounts[key]) {
        bootClickCounts[key] = {
          bootId: click.bootId,
          brand: click.brand,
          model: click.model,
          clicks: 0,
        };
      }
      bootClickCounts[key].clicks++;
    });

    const topBootClicks = Object.values(bootClickCounts)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Calculate users by country
    const countryCounts: Record<string, number> = {};
    clicks.forEach((click) => {
      if (click.country) {
        countryCounts[click.country] = (countryCounts[click.country] || 0) + 1;
      }
    });

    const usersByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate clicks by region
    const regionCounts: Record<string, number> = {};
    clicks.forEach((click) => {
      const region = click.region || "Unknown";
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const clicksByRegion = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate clicks by vendor
    const vendorCounts: Record<string, number> = {};
    clicks.forEach((click) => {
      const vendor = click.vendor || "Unknown";
      vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;
    });

    const clicksByVendor = Object.entries(vendorCounts)
      .map(([vendor, count]) => ({ vendor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 vendors

    // Calculate top clicked boots with vendor/region breakdown
    const bootClickDetails: Record<
      string,
      {
        bootId: string;
        brand: string;
        model: string;
        clicks: number;
        vendors: Record<string, number>;
        regions: Record<string, number>;
      }
    > = {};

    clicks.forEach((click) => {
      const key = click.bootId;
      if (!bootClickDetails[key]) {
        bootClickDetails[key] = {
          bootId: click.bootId,
          brand: click.brand,
          model: click.model,
          clicks: 0,
          vendors: {},
          regions: {},
        };
      }
      bootClickDetails[key].clicks++;

      // Track vendor
      const vendor = click.vendor || "Unknown";
      bootClickDetails[key].vendors[vendor] =
        (bootClickDetails[key].vendors[vendor] || 0) + 1;

      // Track region
      const region = click.region || "Unknown";
      bootClickDetails[key].regions[region] =
        (bootClickDetails[key].regions[region] || 0) + 1;
    });

    const topBootClicksWithDetails = Object.values(bootClickDetails)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Get billing metrics for current month (using Admin SDK)
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Get current month's billing metrics
    const currentBillingDoc = await adminFirestore.collection("billingMetrics").doc(currentMonth).get();
    const billingMetrics = currentBillingDoc.exists ? currentBillingDoc.data() : null;

    // Get all billing metrics for historical data (using Admin SDK)
    const billingMetricsSnapshot = await adminFirestore.collection("billingMetrics").get();
    const allBillingMetrics = billingMetricsSnapshot.docs.map((doc) => ({
      month: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      usersCount: usersCount,
      quizStarts: quizStarts,
      quizCompletions: quizCompletions,
      affiliateClicks: affiliateClicks,
      topBootClicks: topBootClicks,
      usersByCountry: usersByCountry,
      clicksByRegion: clicksByRegion,
      clicksByVendor: clicksByVendor,
      topBootClicksWithDetails: topBootClicksWithDetails,
      billingMetrics: billingMetrics || {
        purchases: 0,
        revenueGBP: 0,
        month: currentMonth,
      },
      allBillingMetrics: allBillingMetrics,
    });
  } catch (error) {
    console.error("[Metrics API] ❌ Caught error:", error);
    console.error("[Metrics API] Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("[Metrics API] Error message:", error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

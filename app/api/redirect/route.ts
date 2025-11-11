import { NextRequest, NextResponse } from "next/server";
import { getBoot } from "@/lib/firestore/boots";
import { logClick } from "@/lib/firestore/affiliateClicks";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bootId = searchParams.get("bootId");
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const vendor = searchParams.get("vendor") || undefined;
    const region = searchParams.get("region") || undefined;

    if (!bootId) {
      return NextResponse.json({ error: "bootId is required" }, { status: 400 });
    }

    // Fetch boot
    const boot = await getBoot(bootId);
    if (!boot) {
      return NextResponse.json({ error: "Boot not found" }, { status: 404 });
    }

    // Determine affiliate URL
    let affiliateUrl: string | undefined;
    
    // If vendor and region are provided, use the new links structure
    if (vendor && region && boot.links?.[region as "UK" | "US" | "EU"]) {
      const regionLinks = boot.links[region as "UK" | "US" | "EU"];
      const link = regionLinks?.find(l => l.store === vendor);
      if (link && link.available !== false) {
        affiliateUrl = link.url;
      }
    }
    
    // Fallback to legacy affiliateUrl if new structure doesn't have a match
    if (!affiliateUrl) {
      affiliateUrl = boot.affiliateUrl;
    }

    if (!affiliateUrl) {
      return NextResponse.json({ error: "No affiliate URL available for this boot" }, { status: 404 });
    }

    // Get country and user agent from headers
    const country = request.headers.get("cf-ipcountry") || 
                    request.headers.get("x-vercel-ip-country") || 
                    undefined;
    const ua = request.headers.get("user-agent") || undefined;

    // Log click with vendor and region
    await logClick({
      userId,
      sessionId,
      bootId,
      brand: boot.brand,
      model: boot.model,
      vendor,
      region: region as "UK" | "US" | "EU" | undefined,
      affiliateUrl,
      country,
      ua,
    });

    // Redirect to affiliate URL
    return NextResponse.redirect(affiliateUrl, { status: 302 });
  } catch (error) {
    console.error("Redirect API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


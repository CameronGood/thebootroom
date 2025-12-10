import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location } = body;

    if (!location || typeof location !== "string") {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Use server-side key (without restrictions) for API routes
    // Server-side API calls cannot use keys with HTTP referrer restrictions
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Debug logging (remove in production)
    console.log("Environment check:", {
      hasServerKey: !!process.env.GOOGLE_MAPS_API_KEY,
      hasPublicKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      usingKey: apiKey ? "server-side (unrestricted)" : "none"
    });
    
    if (!apiKey) {
      console.error("Google Maps API key missing. You need GOOGLE_MAPS_API_KEY (without restrictions) for server-side API calls.");
      return NextResponse.json(
        { 
          error: "Google Maps API key not configured for server-side use. Please add GOOGLE_MAPS_API_KEY (without HTTP referrer restrictions) to your .env.local file and restart the dev server." 
        },
        { status: 500 }
      );
    }

    // Call Google Maps Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json(
        { error: "No results found for this location" },
        { status: 404 }
      );
    }

    if (data.status !== "OK") {
      console.error("Geocoding API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || "Geocoding failed" },
        { status: 500 }
      );
    }

    const result = data.results[0];
    const locationData = result.geometry.location;

    // Extract country from address components
    const countryComponent = result.address_components?.find(
      (component: any) => component.types.includes("country")
    );
    const country = countryComponent?.short_name || null;
    const countryLong = countryComponent?.long_name || null;

    return NextResponse.json({
      lat: locationData.lat,
      lng: locationData.lng,
      formattedAddress: result.formatted_address,
      country: country,
      countryLong: countryLong,
    });
  } catch (error: any) {
    console.error("Error in geocoding:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



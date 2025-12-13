import { NextRequest, NextResponse } from "next/server";
import { getBootFittersNearby } from "@/lib/firestore/bootFitters";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radius = radiusParam ? parseFloat(radiusParam) : 50; // Default 50km

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return NextResponse.json(
        { error: "Invalid coordinates or radius" },
        { status: 400 }
      );
    }

    const fitters = await getBootFittersNearby(lat, lng, radius);

    return NextResponse.json({ fitters });
  } catch (error: unknown) {
    console.error("Error fetching boot fitters:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}



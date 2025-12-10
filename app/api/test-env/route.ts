import { NextResponse } from "next/server";

export async function GET() {
  // This is just for debugging - remove in production
  const hasNextPublic = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasNonPublic = !!process.env.GOOGLE_MAPS_API_KEY;
  const keyLength = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length || 0;
  
  return NextResponse.json({
    hasNextPublicKey: hasNextPublic,
    hasNonPublicKey: hasNonPublic,
    keyLength: keyLength,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('MAPS')),
    message: hasNextPublic 
      ? "API key found!" 
      : "API key not found. Check .env.local file location and format."
  });
}


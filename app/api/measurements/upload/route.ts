import { NextRequest, NextResponse } from "next/server";
import { uploadObject } from "@/lib/r2/client";
import { adminFirestore } from "@/lib/firebase-admin";

/**
 * Server-side upload endpoint for R2
 * Handles file uploads using Cloudflare API token authentication
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const objectKey = searchParams.get("objectKey");

    if (!objectKey) {
      return NextResponse.json(
        { error: "Object key is required" },
        { status: 400 }
      );
    }

    // Get the file from the request body
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2 using API token
    await uploadObject(objectKey, buffer, file.type || "image/jpeg");

    return NextResponse.json({
      success: true,
      objectKey,
    });
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}



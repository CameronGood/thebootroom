import { NextRequest } from "next/server";
import { admin } from "./firebase-admin";

/**
 * Verify if the request comes from an authenticated admin user
 * Checks Firebase Auth ID token and verifies admin custom claim
 * 
 * @param request - NextRequest object
 * @returns Promise<{ isAdmin: boolean; uid?: string; error?: string }>
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  isAdmin: boolean;
  uid?: string;
  error?: string;
}> {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        isAdmin: false,
        error: "Missing or invalid authorization header",
      };
    }

    // Extract token
    const idToken = authHeader.substring(7);

    // Verify token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check for admin claim
    if (decodedToken.admin !== true) {
      return {
        isAdmin: false,
        uid: decodedToken.uid,
        error: "User is not an admin",
      };
    }

    // User is verified as admin
    return {
      isAdmin: true,
      uid: decodedToken.uid,
    };
  } catch (error) {
    // Token verification failed
    console.error("[verifyAdminAuth] Error during verification:", error);
    
    return {
      isAdmin: false,
      error: error instanceof Error ? error.message : "Token verification failed",
    };
  }
}

/**
 * Alternative: Check if a user ID has admin privileges
 * Useful when you already have the user's UID
 * 
 * @param uid - Firebase user ID
 * @returns Promise<boolean>
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const user = await admin.auth().getUser(uid);
    return user.customClaims?.admin === true;
  } catch (error) {
    return false;
  }
}


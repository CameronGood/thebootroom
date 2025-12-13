import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { auth } from "../firebase";
import { User, SavedResult } from "../../types";

// Type for Firestore Timestamp-like objects
type TimestampLike = 
  | Date 
  | Timestamp 
  | { seconds: number; nanoseconds?: number } 
  | number 
  | string 
  | null 
  | undefined;

// Helper function to safely convert Firestore Timestamp to Date
function toDate(value: TimestampLike): Date {
  if (!value) {
    return new Date();
  }
  // If it's already a Date object
  if (value instanceof Date) {
    return value;
  }
  // If it's a Firestore Timestamp
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  // If it's a timestamp object with seconds/nanoseconds
  if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000 + ("nanoseconds" in value && typeof value.nanoseconds === "number" ? value.nanoseconds : 0) / 1000000);
  }
  // If it's a number (milliseconds since epoch)
  if (typeof value === "number") {
    return new Date(value);
  }
  // If it's a string, try to parse it
  if (typeof value === "string") {
    return new Date(value);
  }
  // Fallback to current date
  return new Date();
}

export async function getUserDoc(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(firestore, "users", userId));
  if (!userDoc.exists()) {
    return null;
  }
  const data = userDoc.data();
  // Type guard for saved results
  interface FirestoreSavedResult {
    quizId: string;
    completedAt: TimestampLike;
    recommendedBoots: unknown[];
  }

  return {
    email: data.email,
    displayName: data.displayName,
    createdAt: toDate(data.createdAt),
    savedResults: (data.savedResults || []).map((sr: FirestoreSavedResult) => ({
      quizId: sr.quizId,
      completedAt: toDate(sr.completedAt),
      recommendedBoots: sr.recommendedBoots,
    })),
  };
}

export async function upsertSavedResult(
  userId: string,
  savedResult: SavedResult,
  userEmail?: string
): Promise<void> {
  // Verify user is authenticated - Firebase SDK automatically includes auth token with requests
  // But we should verify the user matches before proceeding
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User must be authenticated to save results");
  }
  if (currentUser.uid !== userId) {
    throw new Error(`User ID mismatch: authenticated user is ${currentUser.uid}, but trying to save to ${userId}`);
  }

  // Ensure auth token is fresh - this helps ensure Firestore gets the latest token
  try {
    await currentUser.getIdToken(true); // Force token refresh
  } catch (tokenError) {
    console.error("Error refreshing auth token:", tokenError);
    throw new Error("Failed to refresh authentication token. Please try logging in again.");
  }

  const userRef = doc(firestore, "users", userId);
  
  try {
    // Try to read the document first
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user doc if it doesn't exist
      // Email is optional - can be set later if needed
      await setDoc(
        userRef,
        {
          email: userEmail || "",
          createdAt: serverTimestamp(),
          savedResults: [savedResult],
        },
        { merge: false } // Use merge: false for initial creation
      );
    } else {
      // Update existing savedResults array - check for duplicates by quizId
      const currentData = userDoc.data();
      const savedResults = currentData.savedResults || [];
      
      // Check if a result with the same quizId already exists
      const existingIndex = savedResults.findIndex(
        (result: SavedResult) => String(result.quizId) === String(savedResult.quizId)
      );
      
      let updatedResults: SavedResult[];
      if (existingIndex >= 0) {
        // Replace existing result (update)
        updatedResults = [...savedResults];
        updatedResults[existingIndex] = savedResult;
      } else {
        // Add new result (insert)
        updatedResults = [...savedResults, savedResult];
      }
      
      await setDoc(
        userRef,
        {
          savedResults: updatedResults,
        },
        { merge: true }
      );
    }
  } catch (error: unknown) {
    console.error("Error in upsertSavedResult:", error);
    console.error("Authenticated user UID:", currentUser?.uid);
    console.error("Document path userId:", userId);
    
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("Error code:", errorCode);
    console.error("Error message:", errorMessage);
    console.error("Full error:", error);
    
    // Check if it's a permission error
    if (errorCode === 'permission-denied') {
      throw new Error("Permission denied. Please ensure you are logged in and the user ID matches. If the problem persists, try logging out and back in.");
    }
    
    throw new Error(`Failed to save result: ${errorMessage}`);
  }
}

export async function deleteSavedResult(
  userId: string,
  quizId: string
): Promise<void> {
  const userRef = doc(firestore, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User document not found");
  }

  const currentData = userDoc.data();
  const savedResults = currentData.savedResults || [];

  // Verify quizId is provided
  if (!quizId) {
    throw new Error("quizId is required");
  }

  // Remove only the result with matching quizId (strict comparison)
  const updatedResults = savedResults.filter(
    (result: SavedResult) => {
      // Ensure we're comparing the same type (both strings)
      const resultQuizId = String(result.quizId || "");
      const targetQuizId = String(quizId || "");
      return resultQuizId !== targetQuizId;
    }
  );

  // Only update if we actually removed something (safety check)
  if (updatedResults.length === savedResults.length) {
    console.warn(`No result found with quizId: ${quizId}`);
    // Still proceed - maybe the result was already deleted
  }

  // Update the document - use merge: false to ensure we replace the array completely
  await setDoc(
    userRef,
    {
      savedResults: updatedResults,
    },
    { merge: true }
  );
}

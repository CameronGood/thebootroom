import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { User, SavedResult } from "../../types";

// Helper function to safely convert Firestore Timestamp to Date
function toDate(value: any): Date {
  if (!value) {
    return new Date();
  }
  // If it's already a Date object
  if (value instanceof Date) {
    return value;
  }
  // If it's a Firestore Timestamp
  if (value && typeof value.toDate === "function") {
    return value.toDate();
  }
  // If it's a timestamp object with seconds/nanoseconds
  if (value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000);
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
  return {
    email: data.email,
    displayName: data.displayName,
    createdAt: toDate(data.createdAt),
    savedResults: (data.savedResults || []).map((sr: any) => ({
      quizId: sr.quizId,
      completedAt: toDate(sr.completedAt),
      recommendedBoots: sr.recommendedBoots,
    })),
  };
}

export async function upsertSavedResult(
  userId: string,
  savedResult: SavedResult
): Promise<void> {
  const userRef = doc(firestore, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create user doc if it doesn't exist
    const userData = userDoc.data();
    await setDoc(
      userRef,
      {
        email: userData?.email || "",
        createdAt: serverTimestamp(),
        savedResults: [savedResult],
      },
      { merge: true }
    );
  } else {
    // Add to existing savedResults array
    const currentData = userDoc.data();
    const savedResults = currentData.savedResults || [];
    await setDoc(
      userRef,
      {
        savedResults: [...savedResults, savedResult],
      },
      { merge: true }
    );
  }
}

export async function deleteSavedResult(
  userId: string,
  quizId: string
): Promise<void> {
  const userRef = doc(firestore, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return;
  }

  const currentData = userDoc.data();
  const savedResults = currentData.savedResults || [];

  // Remove the result with matching quizId
  const updatedResults = savedResults.filter(
    (result: any) => result.quizId !== quizId
  );

  await setDoc(
    userRef,
    {
      savedResults: updatedResults,
    },
    { merge: true }
  );
}

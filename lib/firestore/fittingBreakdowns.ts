import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { adminFirestore, admin } from "../firebase-admin";
import { FittingBreakdown } from "@/types";

// Client-side version (for use in client components)
export async function getFittingBreakdown(
  userId: string,
  quizId: string
): Promise<FittingBreakdown | null> {
  const docId = `${userId}_${quizId}`;
  const breakdownDoc = await getDoc(doc(firestore, "fittingBreakdowns", docId));

  if (!breakdownDoc.exists()) {
    return null;
  }

  const data = breakdownDoc.data();
  return {
    userId: data.userId,
    quizId: data.quizId,
    language: data.language,
    modelProvider: data.modelProvider,
    modelName: data.modelName,
    generatedAt: (data.generatedAt as Timestamp).toDate(),
    wordCount: data.wordCount,
    sections: data.sections,
  } as FittingBreakdown;
}

// Server-side version using Admin SDK (for use in API routes)
export async function getFittingBreakdownAdmin(
  userId: string,
  quizId: string
): Promise<FittingBreakdown | null> {
  const docId = `${userId}_${quizId}`;
  const breakdownDoc = await adminFirestore.collection("fittingBreakdowns").doc(docId).get();

  if (!breakdownDoc.exists) {
    return null;
  }

  const data = breakdownDoc.data();
  if (!data) return null;

  return {
    userId: data.userId,
    quizId: data.quizId,
    language: data.language,
    modelProvider: data.modelProvider,
    modelName: data.modelName,
    generatedAt: data.generatedAt?.toDate() || new Date(),
    wordCount: data.wordCount,
    sections: data.sections,
  } as FittingBreakdown;
}

// Client-side version (for use in client components)
export async function saveFittingBreakdown(
  userId: string,
  quizId: string,
  breakdown: Omit<FittingBreakdown, "userId" | "quizId" | "generatedAt">
): Promise<void> {
  const docId = `${userId}_${quizId}`;
  await setDoc(
    doc(firestore, "fittingBreakdowns", docId),
    {
      userId,
      quizId,
      ...breakdown,
      generatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Server-side version using Admin SDK (for use in API routes)
export async function saveFittingBreakdownAdmin(
  userId: string,
  quizId: string,
  breakdown: Omit<FittingBreakdown, "userId" | "quizId" | "generatedAt">
): Promise<void> {
  const docId = `${userId}_${quizId}`;
  try {
    // Ensure Admin SDK is initialized
    if (!admin.apps.length) {
      throw new Error("Firebase Admin SDK not initialized");
    }
    
    await adminFirestore.collection("fittingBreakdowns").doc(docId).set({
      userId,
      quizId,
      ...breakdown,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (error: unknown) {
    console.error(`Error saving breakdown to Firestore (${docId}):`, error);
    console.error(`Error type: ${error && typeof error === "object" && error.constructor ? error.constructor.name : "unknown"}`);
    console.error(`Error message: ${error instanceof Error ? error.message : String(error)}`);
    const errorCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error(`Error code: ${errorCode}`);
    throw error; // Re-throw so API route can handle it
  }
}

export async function breakdownExists(
  userId: string,
  quizId: string
): Promise<boolean> {
  const docId = `${userId}_${quizId}`;
  const breakdownDoc = await getDoc(doc(firestore, "fittingBreakdowns", docId));
  return breakdownDoc.exists();
}

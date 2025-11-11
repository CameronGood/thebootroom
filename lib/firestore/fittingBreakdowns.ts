import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { FittingBreakdown } from "@/types";

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

export async function breakdownExists(
  userId: string,
  quizId: string
): Promise<boolean> {
  const docId = `${userId}_${quizId}`;
  const breakdownDoc = await getDoc(doc(firestore, "fittingBreakdowns", docId));
  return breakdownDoc.exists();
}

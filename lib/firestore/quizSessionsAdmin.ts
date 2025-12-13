"use server";

import { adminFirestore, admin } from "../firebase-admin";
import { QuizSession, QuizAnswers, BootSummary } from "../../types";

// Helper to remove undefined (same as client version)
function removeUndefined<T>(obj: T): T | null {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined) as T;
  }
  if (typeof obj === "object" && obj.constructor === Object) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) cleaned[key] = removeUndefined(value);
    }
    return cleaned as T;
  }
  return obj;
}

export async function createOrUpdateSessionAdmin(
  sessionId: string,
  data: {
    userId?: string;
    answers?: QuizAnswers;
    recommendedBoots?: BootSummary[];
    recommendedMondo?: string;
    completedAt?: Date;
  }
): Promise<void> {
  const sessionRef = adminFirestore.collection("quizSessions").doc(sessionId);
  const existingDoc = await sessionRef.get();

  const updateData: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (data.userId !== undefined) {
    updateData.userId = data.userId;
  }
  if (data.answers) {
    updateData.answers = removeUndefined(data.answers);
  }
  if (data.recommendedBoots) {
    updateData.recommendedBoots = removeUndefined(data.recommendedBoots);
  }
  if (data.recommendedMondo !== undefined && data.recommendedMondo !== null) {
    updateData.recommendedMondo = data.recommendedMondo;
  }
  if (data.completedAt) {
    updateData.completedAt = admin.firestore.FieldValue.serverTimestamp();
  }

  const cleanedUpdateData = removeUndefined(updateData);

  if (!existingDoc.exists) {
    await sessionRef.set({
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...cleanedUpdateData,
    });
  } else {
    await sessionRef.set(cleanedUpdateData, { merge: true });
  }
}


import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { QuizSession, QuizAnswers, BootSummary } from "../../types";

// Helper function to remove undefined values from objects (Firestore doesn't accept undefined)
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned;
  }

  return obj;
}

export async function createOrUpdateSession(
  sessionId: string,
  data: {
    userId?: string;
    answers?: QuizAnswers;
    recommendedBoots?: BootSummary[];
    recommendedMondo?: string;
    completedAt?: Date;
  }
): Promise<void> {
  const sessionRef = doc(firestore, "quizSessions", sessionId);
  const existingDoc = await getDoc(sessionRef);

  const updateData: any = {
    updatedAt: serverTimestamp(),
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
    updateData.completedAt = serverTimestamp();
  }

  // Remove any undefined values from updateData itself
  const cleanedUpdateData = removeUndefined(updateData);

  if (!existingDoc.exists()) {
    // Create new session
    await setDoc(sessionRef, {
      startedAt: serverTimestamp(),
      ...cleanedUpdateData,
    });
  } else {
    // Update existing session
    await setDoc(sessionRef, cleanedUpdateData, { merge: true });
  }
}

export async function getSession(
  sessionId: string
): Promise<QuizSession | null> {
  const sessionDoc = await getDoc(doc(firestore, "quizSessions", sessionId));
  if (!sessionDoc.exists()) {
    return null;
  }
  const data = sessionDoc.data();
  return {
    userId: data.userId,
    startedAt: (data.startedAt as Timestamp).toDate(),
    completedAt: data.completedAt
      ? (data.completedAt as Timestamp).toDate()
      : undefined,
    answers: data.answers,
    recommendedBoots: data.recommendedBoots,
    recommendedMondo: data.recommendedMondo,
  } as QuizSession;
}

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  MeasurementSession,
  MeasurementSessionStatus,
  MeasurementPhotoResult,
  MeasurementResult,
  SockThickness,
} from "../../types";

// Helper function to remove undefined values from objects (Firestore doesn't accept undefined)
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
      if (value !== undefined) {
        cleaned[key] = removeUndefined(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

export async function createMeasurementSession(
  sessionId: string,
  data: {
    quizSessionId: string;
    sockThickness: SockThickness;
    status?: MeasurementSessionStatus;
  }
): Promise<void> {
  const sessionRef = doc(firestore, "measurementSessions", sessionId);
  await setDoc(sessionRef, {
    quizSessionId: data.quizSessionId,
    sockThickness: data.sockThickness,
    status: data.status || "idle",
    createdAt: serverTimestamp(),
  });
}

export async function getMeasurementSession(
  sessionId: string
): Promise<MeasurementSession | null> {
  const sessionDoc = await getDoc(
    doc(firestore, "measurementSessions", sessionId)
  );
  if (!sessionDoc.exists()) {
    return null;
  }
  const data = sessionDoc.data();
  return {
    quizSessionId: data.quizSessionId,
    status: data.status as MeasurementSessionStatus,
    sockThickness: data.sockThickness as SockThickness,
    photo1: data.photo1 as MeasurementPhotoResult | undefined,
    photo2: data.photo2 as MeasurementPhotoResult | undefined,
    final: data.final as
      | { left: MeasurementResult; right: MeasurementResult }
      | undefined,
    createdAt: (data.createdAt as Timestamp).toDate(),
    completedAt: data.completedAt
      ? (data.completedAt as Timestamp).toDate()
      : undefined,
    errorMessage: data.errorMessage as string | undefined,
  } as MeasurementSession;
}

export async function updateMeasurementSession(
  sessionId: string,
  data: {
    status?: MeasurementSessionStatus;
    photo1?: MeasurementPhotoResult;
    photo2?: MeasurementPhotoResult;
    final?: {
      left: MeasurementResult;
      right: MeasurementResult;
    };
    completedAt?: Date;
    errorMessage?: string;
  }
): Promise<void> {
  const sessionRef = doc(firestore, "measurementSessions", sessionId);
  const updateData: Record<string, unknown> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.photo1 !== undefined) {
    updateData.photo1 = removeUndefined(data.photo1);
  }
  if (data.photo2 !== undefined) {
    updateData.photo2 = removeUndefined(data.photo2);
  }
  if (data.final !== undefined) {
    updateData.final = removeUndefined(data.final);
  }
  if (data.completedAt !== undefined) {
    updateData.completedAt = serverTimestamp();
  }
  if (data.errorMessage !== undefined) {
    updateData.errorMessage = data.errorMessage;
  }

  const cleanedUpdateData = removeUndefined(updateData);
  await setDoc(sessionRef, cleanedUpdateData, { merge: true });
}



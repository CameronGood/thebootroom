import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";
import { Boot, Gender } from "../../types";
import { toLAVArray } from "../utils/parseMulti";

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

export async function listBoots(filters?: {
  gender?: Gender;
  walkMode?: boolean;
  rearEntry?: boolean;
  calfAdjustment?: boolean;
}): Promise<(Boot & { bootId: string })[]> {
  let q = query(collection(firestore, "boots"));

  if (filters?.gender) {
    q = query(q, where("gender", "==", filters.gender));
  }
  if (filters?.walkMode !== undefined) {
    q = query(q, where("walkMode", "==", filters.walkMode));
  }
  if (filters?.rearEntry !== undefined) {
    q = query(q, where("rearEntry", "==", filters.rearEntry));
  }
  if (filters?.calfAdjustment !== undefined) {
    q = query(q, where("calfAdjustment", "==", filters.calfAdjustment));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    // Derive bootWidth from lastWidthMM for backward compatibility if missing
    let bootWidth: "Narrow" | "Average" | "Wide" = data.bootWidth || "Average";
    if (!data.bootWidth && data.lastWidthMM) {
      const width = data.lastWidthMM;
      if (width <= 98) bootWidth = "Narrow";
      else if (width <= 102) bootWidth = "Average";
      else bootWidth = "Wide";
    }
    return {
      ...data,
      bootId: docSnapshot.id,
      bootWidth,
      // Normalize LAV arrays (handle legacy single values or arrays)
      instepHeight: toLAVArray(data.instepHeight),
      ankleVolume: toLAVArray(data.ankleVolume),
      calfVolume: toLAVArray(data.calfVolume),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Boot & { bootId: string };
  });
}

// Admin SDK version (bypasses security rules; for server-side use only)

export async function getBoot(
  bootId: string
): Promise<(Boot & { bootId: string }) | null> {
  const bootDoc = await getDoc(doc(firestore, "boots", bootId));
  if (!bootDoc.exists()) {
    return null;
  }
  const data = bootDoc.data();
  // Derive bootWidth from lastWidthMM for backward compatibility if missing
  let bootWidth: "Narrow" | "Average" | "Wide" = data.bootWidth || "Average";
  if (!data.bootWidth && data.lastWidthMM) {
    const width = data.lastWidthMM;
    if (width <= 98) bootWidth = "Narrow";
    else if (width <= 102) bootWidth = "Average";
    else bootWidth = "Wide";
  }
  return {
    ...data,
    bootId: bootDoc.id,
    bootWidth,
    // Normalize LAV arrays (handle legacy single values or arrays)
    instepHeight: toLAVArray(data.instepHeight),
    ankleVolume: toLAVArray(data.ankleVolume),
    calfVolume: toLAVArray(data.calfVolume),
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  } as Boot & { bootId: string };
}

export async function upsertBoot(
  bootData: Omit<Boot, "createdAt" | "updatedAt"> & { bootId?: string }
): Promise<string> {
  const { bootId: providedBootId, ...bootDataWithoutId } = bootData;
  const bootId = providedBootId || doc(collection(firestore, "boots")).id;
  const bootRef = doc(firestore, "boots", bootId);

  const existingDoc = await getDoc(bootRef);
  const now = serverTimestamp();

  // Clean the boot data to remove undefined values before saving
  const cleanedBootData = removeUndefined({
    ...bootDataWithoutId,
    createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
    updatedAt: now,
  });

  await setDoc(bootRef, cleanedBootData, { merge: true });

  return bootId;
}

export async function deleteBoot(bootId: string): Promise<void> {
  await deleteDoc(doc(firestore, "boots", bootId));
}

// Check if a boot already exists (duplicate check based on brand, model, year, gender)
export async function bootExists(
  brand: string,
  model: string,
  year: string,
  gender: Gender,
  excludeBootId?: string
): Promise<boolean> {
  const q = query(
    collection(firestore, "boots"),
    where("brand", "==", brand),
    where("model", "==", model),
    where("year", "==", year),
    where("gender", "==", gender)
  );

  const snapshot = await getDocs(q);

  // If checking for a new boot (no excludeBootId), any match is a duplicate
  if (!excludeBootId) {
    return !snapshot.empty;
  }

  // If editing, check if there's a match that's NOT the current boot
  return snapshot.docs.some((doc) => doc.id !== excludeBootId);
}

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

export async function listBoots(filters?: {
  gender?: Gender;
  walkMode?: boolean;
  rearEntry?: boolean;
  calfAdjustment?: boolean;
}): Promise<Boot[]> {
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
    return {
      ...data,
      bootId: docSnapshot.id,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    } as Boot & { bootId: string };
  });
}

export async function getBoot(
  bootId: string
): Promise<(Boot & { bootId: string }) | null> {
  const bootDoc = await getDoc(doc(firestore, "boots", bootId));
  if (!bootDoc.exists()) {
    return null;
  }
  const data = bootDoc.data();
  return {
    ...data,
    bootId: bootDoc.id,
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

  await setDoc(
    bootRef,
    {
      ...bootDataWithoutId,
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
      updatedAt: now,
    },
    { merge: true }
  );

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

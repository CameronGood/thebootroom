import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "../firebase";

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
    return cleaned;
  }
  
  return obj;
}

export interface BootFitter {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
}

export interface BootFitterWithDistance extends BootFitter {
  distance: number; // Distance in kilometers
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function listBootFitters(): Promise<BootFitter[]> {
  const snapshot = await getDocs(collection(firestore, "bootFitters"));
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      website: data.website,
      latitude: data.latitude,
      longitude: data.longitude,
    } as BootFitter;
  });
}

export async function getBootFittersNearby(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<BootFitterWithDistance[]> {
  const allFitters = await listBootFitters();
  
  const fittersWithDistance: BootFitterWithDistance[] = allFitters
    .map((fitter) => ({
      ...fitter,
      distance: calculateDistance(lat, lng, fitter.latitude, fitter.longitude),
    }))
    .filter((fitter) => fitter.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return fittersWithDistance;
}

export async function getBootFitter(
  fitterId: string
): Promise<BootFitter | null> {
  const fitterDoc = await getDoc(doc(firestore, "bootFitters", fitterId));
  if (!fitterDoc.exists()) {
    return null;
  }
  const data = fitterDoc.data();
  return {
    id: fitterDoc.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country,
    phone: data.phone,
    website: data.website,
    latitude: data.latitude,
    longitude: data.longitude,
  } as BootFitter;
}

export async function upsertBootFitter(
  fitterData: Omit<BootFitter, "id"> & { id?: string }
): Promise<string> {
  const { id: providedId, ...fitterDataWithoutId } = fitterData;
  const fitterId = providedId || doc(collection(firestore, "bootFitters")).id;
  const fitterRef = doc(firestore, "bootFitters", fitterId);

  const existingDoc = await getDoc(fitterRef);
  const now = serverTimestamp();

  // Remove undefined values before saving (Firestore doesn't accept undefined)
  const cleanedData = removeUndefined({
    ...fitterDataWithoutId,
    createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
    updatedAt: now,
  });

  await setDoc(fitterRef, cleanedData, { merge: true });

  return fitterId;
}

export async function deleteBootFitter(fitterId: string): Promise<void> {
  await deleteDoc(doc(firestore, "bootFitters", fitterId));
}


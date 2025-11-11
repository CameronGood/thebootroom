import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { AffiliateClick } from "../../types";

export async function logClick(payload: {
  userId?: string;
  sessionId?: string;
  bootId: string;
  brand: string;
  model: string;
  vendor?: string;
  region?: string;
  affiliateUrl: string;
  country?: string;
  ua?: string;
}): Promise<void> {
  await addDoc(collection(firestore, "affiliateClicks"), {
    ...payload,
    timestamp: serverTimestamp(),
  });
}

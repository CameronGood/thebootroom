"use server";

import { adminFirestore } from "../firebase-admin";
import { Boot } from "../../types";
import { toLAVArray } from "../utils/parseMulti";

export async function listBootsAdmin(): Promise<(Boot & { bootId: string })[]> {
  const snapshot = await adminFirestore.collection("boots").get();
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as any;
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
      instepHeight: toLAVArray(data.instepHeight),
      ankleVolume: toLAVArray(data.ankleVolume),
      calfVolume: toLAVArray(data.calfVolume),
    } as Boot & { bootId: string };
  });
}


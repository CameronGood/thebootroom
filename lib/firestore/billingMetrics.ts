import { doc, getDoc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { BillingMetrics } from "@/types";

export async function incrementBillingMetrics(
  amountGBP: number
): Promise<void> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const metricsRef = doc(firestore, "billingMetrics", monthKey);

  await setDoc(
    metricsRef,
    {
      purchases: increment(1),
      revenueGBP: increment(amountGBP),
      month: monthKey,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getBillingMetrics(
  month: string
): Promise<BillingMetrics | null> {
  const metricsDoc = await getDoc(doc(firestore, "billingMetrics", month));
  
  if (!metricsDoc.exists()) {
    return null;
  }

  const data = metricsDoc.data();
  return {
    purchases: data.purchases || 0,
    revenueGBP: data.revenueGBP || 0,
    month: data.month || month,
  } as BillingMetrics;
}


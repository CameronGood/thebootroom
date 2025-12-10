import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use service account from environment variables first
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin initialized from environment variables");
    } else {
      // Fallback to service account JSON file
      const serviceAccount = require("../the-boot-room-firebase-adminsdk-fbsvc-c35f182e60.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized from service account file");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error; // Throw to prevent silent failures
  }
} else {
  console.log("Firebase Admin already initialized");
}

export const adminFirestore = admin.firestore();
export { admin };
export default admin;


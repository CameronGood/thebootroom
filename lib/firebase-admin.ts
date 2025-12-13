import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use service account from environment variables
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      throw new Error(
        "Firebase Admin initialization failed. Please set FIREBASE_ADMIN_PRIVATE_KEY and FIREBASE_ADMIN_CLIENT_EMAIL environment variables. See ENV_SETUP.md for instructions."
      );
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error; // Throw to prevent silent failures
  }
}

export const adminFirestore = admin.firestore();
export { admin };
export default admin;

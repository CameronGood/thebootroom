// Simple script to set admin claim
// Usage:
// 1. Ensure your .env.local has FIREBASE_ADMIN_PRIVATE_KEY and FIREBASE_ADMIN_CLIENT_EMAIL
// 2. Run: node scripts/set-admin-simple.js <user-email>

const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

// Initialize using environment variables
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error("❌ Missing required environment variables:");
    console.error("   - FIREBASE_ADMIN_PRIVATE_KEY");
    console.error("   - FIREBASE_ADMIN_CLIENT_EMAIL");
    console.error("   - NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    console.error("\nMake sure these are set in your .env.local file.");
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const userEmail = process.argv[2];

if (!userEmail) {
  console.error(
    "❌ Please provide user email: node set-admin-simple.js <email>"
  );
  process.exit(1);
}

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for: ${userEmail}`);
    console.log(
      "⚠️  User must log out and log back in for changes to take effect."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

setAdmin().then(() => process.exit(0));

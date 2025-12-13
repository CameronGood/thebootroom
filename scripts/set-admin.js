// Script to set admin custom claim on a user
// Run with: node scripts/set-admin.js

const admin = require("firebase-admin");
const readline = require("readline");
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter user email: ", async (email) => {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`✅ Admin claim set for user: ${email} (${user.uid})`);
    console.log(
      "⚠️  User needs to log out and log back in for changes to take effect."
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  rl.close();
  process.exit(0);
});

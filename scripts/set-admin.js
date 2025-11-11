// Script to set admin custom claim on a user
// Run with: node scripts/set-admin.js <user-email>

const admin = require("firebase-admin");
const readline = require("readline");

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require("../path-to-your-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

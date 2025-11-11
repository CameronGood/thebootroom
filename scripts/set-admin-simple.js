// Simple script to set admin claim
// Usage: 
// 1. Install firebase-admin: npm install firebase-admin
// 2. Get your service account key from Firebase Console
// 3. Update the serviceAccount path below
// 4. Run: node scripts/set-admin-simple.js <user-email>

const admin = require('firebase-admin');

// TODO: Replace with path to your service account key JSON file
// Download from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Please provide user email: node set-admin-simple.js <email>');
  process.exit(1);
}

async function setAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim set for: ${userEmail}`);
    console.log('⚠️  User must log out and log back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setAdmin().then(() => process.exit(0));


# 🧪 Admin Authentication Testing Guide

## Overview
This guide will help you test the newly implemented server-side admin authentication to ensure it's working correctly before proceeding with further cleanup.

---

## Prerequisites

Before testing, ensure:
- [ ] Firebase Admin SDK environment variables are set (see `FIREBASE_ADMIN_SECURITY.md`)
- [ ] You have at least one user account with admin privileges
- [ ] Development server is running (`pnpm dev`)

---

## Test Plan

### Test 1: Verify Firebase Admin SDK Initialization

**Goal:** Ensure Firebase Admin SDK initializes correctly with environment variables.

**Steps:**
1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Check the console output for errors
   - ✅ **Expected:** No Firebase Admin initialization errors
   - ❌ **If you see errors:** Check your `.env.local` file has correct values

3. Try to access any page (e.g., http://localhost:3000)
   - ✅ **Expected:** Page loads normally
   - ❌ **If error:** Firebase Admin SDK is not configured correctly

**Troubleshooting:**
```bash
# Check if environment variables are loaded
# Add this temporarily to lib/firebase-admin.ts (remove after testing)
console.log('Has FIREBASE_ADMIN_PRIVATE_KEY:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
console.log('Has FIREBASE_ADMIN_CLIENT_EMAIL:', !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
```

---

### Test 2: Set Admin Custom Claim

**Goal:** Grant admin privileges to your test user account.

**Option A: Using Firebase Admin SDK Script (Recommended)**

1. Create a temporary script `scripts/set-admin-claim.js`:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

async function setAdminClaim(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`✅ Admin claim set for user: ${email} (${user.uid})`);
    console.log('⚠️  User must sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error setting admin claim:', error.message);
  }
  
  process.exit(0);
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Usage: node set-admin-claim.js <user-email>');
  process.exit(1);
}

setAdminClaim(email);
```

2. Run the script:
```bash
# Load environment variables and run script
node -r dotenv/config scripts/set-admin-claim.js your-email@example.com
```

**Option B: Using Firebase Console**

Unfortunately, custom claims cannot be set directly through the Firebase Console. You must use the Admin SDK or Cloud Functions.

**Option C: Using Existing Scripts**

Check if you already have admin setup scripts:
```bash
# Check existing scripts
ls scripts/
# You may have: set-admin.js or set-admin-simple.js
```

If they exist, run them:
```bash
node scripts/set-admin-simple.js your-email@example.com
```

---

### Test 3: Verify Admin Claim on Client

**Goal:** Confirm the admin claim is visible in the client-side auth context.

**Steps:**

1. Sign out of your application (if signed in)

2. Sign back in with the admin user account

3. Open browser DevTools Console (F12)

4. Add this temporary debug code to `app/admin/page.tsx`:

```typescript
// Add at the top of the AdminDashboard component
useEffect(() => {
  if (user) {
    user.getIdTokenResult().then((tokenResult) => {
      console.log('🔍 Admin claim check:', {
        uid: user.uid,
        email: user.email,
        isAdmin: tokenResult.claims.admin === true,
        allClaims: tokenResult.claims,
      });
    });
  }
}, [user]);
```

5. Navigate to http://localhost:3000/admin

6. Check console output:
   - ✅ **Expected:** `isAdmin: true`
   - ❌ **If false:** Admin claim not set or user needs to re-authenticate

---

### Test 4: Test Admin API - Import Boots Endpoint

**Goal:** Verify the `/api/admin/import-boots` endpoint properly authenticates admin users.

**Test 4A: Authenticated Admin Request (Should Succeed)**

1. Open browser DevTools Console on http://localhost:3000/admin

2. Get your auth token:
```javascript
// Run in browser console
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log('Token:', token);
// Copy the token
```

3. Test the API with curl or Postman:

```bash
# Replace YOUR_TOKEN with the token from step 2
curl -X POST http://localhost:3000/api/admin/import-boots \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "csvText=year,gender,bootType,brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume,toeBoxShape,calfAdjustment,walkMode,rearEntry
25/26,Male,Standard,Test Brand,Test Model,100,110,Average,Average,Average,Round,No,No,No"
```

**Expected Response:**
```json
{
  "imported": 1,
  "skipped": 0,
  "duplicates": 0,
  "errors": []
}
```

**Test 4B: Unauthenticated Request (Should Fail)**

```bash
curl -X POST http://localhost:3000/api/admin/import-boots \
  -H "Content-Type: multipart/form-data" \
  -F "csvText=test"
```

**Expected Response:**
```json
{
  "error": "Missing or invalid authorization header"
}
```
**Status Code:** 403

**Test 4C: Non-Admin User Request (Should Fail)**

1. Create a regular (non-admin) user account
2. Sign in with that account
3. Get the auth token (same as Test 4A, step 2)
4. Make the same request with the non-admin token

**Expected Response:**
```json
{
  "error": "User is not an admin"
}
```
**Status Code:** 403

---

### Test 5: Test Admin API - Metrics Endpoint

**Goal:** Verify the `/api/admin/metrics` endpoint properly authenticates admin users.

**Test 5A: Authenticated Admin Request (Should Succeed)**

```bash
# Replace YOUR_TOKEN with admin user token
curl http://localhost:3000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "usersCount": 0,
  "quizStarts": 0,
  "quizCompletions": 0,
  "affiliateClicks": 0,
  "topBootClicks": [],
  "usersByCountry": [],
  ...
}
```
**Status Code:** 200

**Test 5B: Unauthenticated Request (Should Fail)**

```bash
curl http://localhost:3000/api/admin/metrics
```

**Expected Response:**
```json
{
  "error": "Missing or invalid authorization header"
}
```
**Status Code:** 403

---

### Test 6: Test Admin UI Integration

**Goal:** Verify the admin dashboard UI works with the new authentication.

**Steps:**

1. Sign in as admin user

2. Navigate to http://localhost:3000/admin

3. **Test Boots Tab:**
   - Click "Import Boots" button
   - Upload a CSV or paste CSV text
   - Click "Import"
   - ✅ **Expected:** Boots import successfully
   - ❌ **If 403 error:** Check browser console for auth token issues

4. **Test Analytics Tab:**
   - Click "Analytics" tab
   - ✅ **Expected:** Metrics load successfully
   - ❌ **If 403 error:** Check browser console for auth token issues

5. **Test Add/Edit Boot:**
   - Click "Add Boot" button
   - Fill in form
   - Click "Save"
   - ✅ **Expected:** Boot saves successfully

---

### Test 7: Test Non-Admin Access Prevention

**Goal:** Ensure non-admin users cannot access admin features.

**Steps:**

1. Sign out

2. Sign in with a non-admin user account (or create one)

3. Try to access http://localhost:3000/admin
   - ✅ **Expected:** Redirected or shown "Unauthorized" message
   - ❌ **If you can access:** Client-side protection may need review

4. Try to call admin API directly (using non-admin token from Test 4C)
   - ✅ **Expected:** 403 Forbidden response
   - ❌ **If 200 response:** Server-side auth is not working

---

## Test Results Checklist

Mark each test as you complete it:

- [ ] **Test 1:** Firebase Admin SDK initializes without errors
- [ ] **Test 2:** Admin claim successfully set on user account
- [ ] **Test 3:** Admin claim visible in client-side auth context
- [ ] **Test 4A:** Admin can import boots (authenticated request succeeds)
- [ ] **Test 4B:** Unauthenticated request to import boots fails with 403
- [ ] **Test 4C:** Non-admin user request to import boots fails with 403
- [ ] **Test 5A:** Admin can fetch metrics (authenticated request succeeds)
- [ ] **Test 5B:** Unauthenticated request to metrics fails with 403
- [ ] **Test 6:** Admin dashboard UI works correctly with authentication
- [ ] **Test 7:** Non-admin users cannot access admin features

---

## Common Issues & Solutions

### Issue 1: "Firebase Admin initialization failed"

**Cause:** Environment variables not set correctly

**Solution:**
1. Check `.env.local` file exists in `thebootroom/` directory
2. Verify `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL` are set
3. Ensure private key has proper newline characters (`\n`)
4. Restart dev server after changing `.env.local`

### Issue 2: "User is not an admin" even after setting claim

**Cause:** User token not refreshed after claim was set

**Solution:**
1. Sign out completely
2. Close browser/clear cache
3. Sign back in
4. Token will now include admin claim

### Issue 3: Admin API returns 403 in UI but works with curl

**Cause:** Frontend not sending auth token correctly

**Solution:**
Check the admin components (BootsTab, AnalyticsTab) are getting the auth token:

```typescript
// In admin components, verify:
const user = auth.currentUser;
const token = await user?.getIdToken();

fetch('/api/admin/metrics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Issue 4: CORS errors in development

**Cause:** Browser security restrictions

**Solution:**
- Ensure you're accessing via http://localhost:3000 (not 127.0.0.1)
- Check Next.js dev server is running on port 3000

---

## Production Testing

Before deploying to production:

1. **Set Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL`
   - Redeploy

2. **Test on Vercel Preview Deployment:**
   - Create a PR or push to a branch
   - Test admin authentication on preview URL
   - Verify all admin endpoints work

3. **Test on Production:**
   - After merging to main
   - Test with production admin account
   - Monitor Vercel logs for any auth errors

---

## Security Verification

After all tests pass, verify:

- [ ] Firebase Admin SDK JSON file is NOT in repository
- [ ] `.env.local` is in `.gitignore`
- [ ] Admin endpoints return 403 for non-admin users
- [ ] Admin endpoints return 403 for unauthenticated requests
- [ ] Admin claim is checked server-side (not just client-side)
- [ ] Auth tokens are verified using Firebase Admin SDK
- [ ] No sensitive data exposed in error messages

---

## Next Steps

Once all tests pass:

1. ✅ Mark Phase 1 as fully tested and verified
2. 🚀 Proceed with Phase 2: Remove unused files and dead code
3. 📝 Document any issues encountered and solutions applied

---

**Questions or Issues?**

If you encounter problems during testing, check:
1. Browser console for client-side errors
2. Terminal/server logs for server-side errors
3. Network tab in DevTools to see actual API requests/responses
4. Firebase Console → Authentication → Users to verify admin claim

**Need help?** Review the error messages carefully - they should indicate whether the issue is:
- Missing/invalid token
- Token verification failed
- User is not an admin
- Firebase Admin SDK initialization error


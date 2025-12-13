# 🧪 Testing Instructions - Admin Authentication

## Quick Start

Follow these steps to test the newly implemented admin authentication system.

---

## Step 1: Install Dependencies

If you haven't already, install the new `dotenv` dependency:

```bash
pnpm install
```

This adds `dotenv` which is needed for the admin setup scripts.

---

## Step 2: Set Up Environment Variables

Make sure your `.env.local` file has the Firebase Admin SDK credentials:

```env
# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@the-boot-room.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=the-boot-room.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=the-boot-room
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=the-boot-room.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**If you haven't set up the Firebase Admin credentials yet:**
- Follow the instructions in `FIREBASE_ADMIN_SECURITY.md`
- You'll need to revoke the old key and generate a new one

---

## Step 3: Start Development Server

```bash
pnpm dev
```

Check the console output:
- ✅ **Good:** No Firebase Admin initialization errors
- ❌ **Error:** Check your `.env.local` file

---

## Step 4: Create/Set Admin User

You need at least one user with admin privileges to test.

### Option A: Set Admin Claim on Existing User

If you already have a user account:

```bash
node scripts/set-admin-simple.js your-email@example.com
```

**Expected output:**
```
✅ Admin claim set for: your-email@example.com
⚠️  User must log out and log back in for changes to take effect.
```

### Option B: Interactive Script

```bash
node scripts/set-admin.js
```

Then enter your email when prompted.

### Option C: Create New Admin User

1. Go to http://localhost:3000
2. Sign up with a new account
3. Run one of the scripts above with that email
4. Sign out and sign back in

---

## Step 5: Test Admin Access

### 5A: Test Client-Side Admin Check

1. Sign in with your admin user
2. Navigate to http://localhost:3000/admin
3. You should see the admin dashboard
4. Open browser console (F12)
5. Check for any errors

**Expected:** Admin dashboard loads successfully

### 5B: Test Admin API - Import Boots

1. In the admin dashboard, click the "Boots" tab
2. Click "Import Boots" button
3. Paste this test CSV:

```csv
year,gender,bootType,brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume,toeBoxShape,calfAdjustment,walkMode,rearEntry
25/26,Male,Standard,Test Brand,Test Model,100,110,Average,Average,Average,Round,No,No,No
```

4. Click "Import"

**Expected:** 
- Success message: "Imported 1 boots"
- No 403 errors

### 5C: Test Admin API - Analytics

1. Click the "Analytics" tab
2. Check if metrics load

**Expected:**
- Metrics display (even if all zeros)
- No 403 errors

---

## Step 6: Test Non-Admin Protection

### 6A: Test with Non-Admin User

1. Sign out
2. Create a new user account (or sign in with existing non-admin account)
3. Try to access http://localhost:3000/admin

**Expected:**
- Redirected away OR
- "Unauthorized" message shown

### 6B: Test API Protection

Open browser console and run:

```javascript
// Get your current (non-admin) user token
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Try to access admin endpoint
fetch('/api/admin/metrics', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

**Expected:**
```json
{
  "error": "User is not an admin"
}
```

---

## Step 7: Test Unauthenticated Access

Open a new incognito/private browser window:

1. Go to http://localhost:3000/admin
   - **Expected:** Redirected to login or shown unauthorized

2. Try API without token:
```bash
curl http://localhost:3000/api/admin/metrics
```

**Expected:**
```json
{
  "error": "Missing or invalid authorization header"
}
```

---

## Verification Checklist

Mark each item as you test:

- [ ] Dependencies installed (`pnpm install`)
- [ ] `.env.local` configured with Firebase Admin credentials
- [ ] Dev server starts without errors
- [ ] Admin claim set on test user
- [ ] User signed out and back in (to refresh token)
- [ ] Admin dashboard accessible for admin user
- [ ] Import boots works (no 403 errors)
- [ ] Analytics loads (no 403 errors)
- [ ] Non-admin user CANNOT access admin features
- [ ] Unauthenticated requests return 403

---

## Common Issues

### Issue: "Missing required environment variables"

**Solution:** Check your `.env.local` file:
- Must be in the `thebootroom/` directory (not root)
- Must have all required variables
- Private key must be wrapped in quotes
- Restart dev server after changes

### Issue: "User is not an admin" after setting claim

**Solution:** 
- Sign out completely
- Close browser
- Sign back in
- Token will now include admin claim

### Issue: Import boots returns 403 in UI

**Solution:** Check browser console for errors. The admin components need to send the auth token:

```typescript
const token = await auth.currentUser?.getIdToken();
fetch('/api/admin/import-boots', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Success Criteria

✅ **All tests pass when:**
1. Admin users can access admin dashboard
2. Admin users can import boots and view analytics
3. Non-admin users CANNOT access admin features
4. Unauthenticated requests return 403
5. No console errors during normal operation

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Mark admin authentication as verified
2. 🚀 Proceed with Phase 2: Remove unused files
3. 📝 Document any issues encountered

---

## Need More Details?

See `ADMIN_AUTH_TESTING.md` for:
- Detailed test scenarios
- curl examples for API testing
- Troubleshooting guide
- Production testing checklist


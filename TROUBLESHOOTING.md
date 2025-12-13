# 🔧 Troubleshooting Admin Authentication

## Critical Issue Found & Fixed

### ⚠️ firebase-admin.ts Was Empty

The `lib/firebase-admin.ts` file was accidentally corrupted and became empty. This has been **fixed** ✅

**What happened:**
- During the editing process, the file content was lost
- This caused Firebase Admin SDK to fail silently
- All admin API calls returned errors

**Status:** File has been restored with correct content.

---

## Current Error: "Metrics API error: {}"

This error means the API is returning a non-200 status (likely 403), but the error body is empty or malformed.

### Most Likely Causes

#### 1. **Missing Environment Variables** (Most Common)

**Symptoms:**
- Empty error responses
- 403 or 500 status codes
- "Firebase Admin initialization failed" in server console

**Solution:**

Check your `.env.local` file exists and has these values:

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

**Important:**
- File must be named `.env.local` (with leading dot)
- File must be in `thebootroom/` directory (not root)
- Private key must be wrapped in double quotes
- After changes, **restart the dev server**

**To verify:**
```bash
# Check if .env.local exists
ls -la thebootroom/.env.local

# Or on Windows:
dir thebootroom\.env.local
```

#### 2. **Admin Claim Not Set**

**Symptoms:**
- Error: "User is not an admin"
- 403 status code
- Can access /admin page but API fails

**Solution:**

Set admin claim on your user:
```bash
node scripts/set-admin-simple.js your-email@example.com
```

Then **sign out and back in** (crucial - refreshes token).

#### 3. **Not Signed In**

**Symptoms:**
- Alert: "Please sign in to view analytics"
- No user token in console
- Redirected to login

**Solution:**
1. Sign in to the application
2. Navigate to /admin
3. Try again

---

## Step-by-Step Diagnostic

Follow these steps to diagnose your specific issue:

### Step 1: Check Server Console

Look at your terminal where `pnpm dev` is running.

**What to look for:**

✅ **Good:**
```
○ Compiling / ...
✓ Compiled / in 2.3s
```

❌ **Bad:**
```
Error initializing Firebase Admin: Error: Firebase Admin initialization failed...
```

**If you see Firebase Admin error:**
- Environment variables are missing or incorrect
- See solution for Cause #1 above

### Step 2: Check Browser Console

Open DevTools (F12) and look at the Console tab.

**What to look for:**

```
[Metrics API] Auth check: { isAdmin: true, uid: "...", hasError: false }
[Metrics API] Admin verified, fetching metrics...
```

✅ **If you see this:** Admin auth is working!

```
[Metrics API] Unauthorized: User is not an admin
```

❌ **If you see this:** Admin claim not set (see Cause #2)

```
[Metrics API] Unauthorized: Missing or invalid authorization header
```

❌ **If you see this:** Not signed in or token expired

### Step 3: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh the /admin page
4. Look for the request to `/api/admin/metrics`

**Click on it and check:**

**Status Code:**
- `200` ✅ Success
- `403` ❌ Forbidden (auth issue)
- `500` ❌ Server error (likely env vars)

**Response:**
- If status 403, check the response body for error message
- Should say: "User is not an admin" or "Missing authorization header"

**Request Headers:**
- Look for `Authorization: Bearer eyJ...`
- If missing: Frontend issue
- If present: Backend issue

### Step 4: Verify Environment Variables

**Quick Test:**

Create a temporary test file `thebootroom/test-env.js`:

```javascript
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Check:');
console.log('✓ FIREBASE_ADMIN_PRIVATE_KEY:', process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'SET' : 'MISSING');
console.log('✓ FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'SET' : 'MISSING');
console.log('✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
```

Run it:
```bash
cd thebootroom
node test-env.js
```

**Expected output:**
```
Environment Variables Check:
✓ FIREBASE_ADMIN_PRIVATE_KEY: SET
✓ FIREBASE_ADMIN_CLIENT_EMAIL: SET
✓ NEXT_PUBLIC_FIREBASE_PROJECT_ID: SET
```

**If any show MISSING:**
- Your `.env.local` is not configured correctly
- Follow `FIREBASE_ADMIN_SECURITY.md` to set up credentials

---

## Quick Fixes

### Fix 1: Restart Everything

Sometimes a simple restart fixes issues:

```bash
# Stop dev server (Ctrl+C)
# Kill any lingering Node processes
# Start fresh
pnpm dev
```

### Fix 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click on Refresh button
3. Select "Empty Cache and Hard Reload"
4. Try again

### Fix 3: Sign Out and Back In

1. Click sign out in your app
2. Close browser completely
3. Open browser again
4. Sign in
5. Try admin dashboard

### Fix 4: Regenerate Firebase Credentials

If you recently changed Firebase credentials:

1. Follow `FIREBASE_ADMIN_SECURITY.md`
2. Revoke old key, generate new one
3. Update `.env.local`
4. Restart dev server
5. Try again

---

## Error Messages Guide

### "Please sign in to view analytics"
**Cause:** Not authenticated
**Fix:** Sign in to the application

### "API returned status 403"
**Cause:** Not authorized or admin claim missing
**Fix:** Set admin claim and sign out/in

### "Firebase Admin initialization failed"
**Cause:** Environment variables missing
**Fix:** Configure `.env.local` properly

### "User is not an admin"
**Cause:** Admin claim not set on user
**Fix:** 
```bash
node scripts/set-admin-simple.js your-email@example.com
```
Then sign out and back in.

### "Missing or invalid authorization header"
**Cause:** Token not sent or expired
**Fix:** Sign out and back in

---

## Still Having Issues?

### Collect Diagnostic Information

Run these commands and share the output:

```bash
# 1. Check file exists
ls -la thebootroom/.env.local

# 2. Check server logs
# (copy the terminal output where pnpm dev is running)

# 3. Check browser console
# (F12 → Console tab, copy any errors)

# 4. Check network request
# (F12 → Network tab → /api/admin/metrics → copy status and response)
```

### Common Environment Variable Issues

**Issue:** Private key has literal `\n` instead of newlines

**Wrong:**
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour...\n-----END PRIVATE KEY-----\n"
```

**Right:** The `\n` should be actual characters, not interpreted newlines. The code handles this.

**Issue:** Missing quotes around private key

**Wrong:**
```env
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

**Right:**
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
```

---

## Testing After Fix

Once you've applied a fix:

1. **Restart dev server:**
   ```bash
   # Ctrl+C to stop
   pnpm dev
   ```

2. **Clear browser cache** (Ctrl+Shift+Delete or F12 → Network → "Disable cache")

3. **Sign out and back in**

4. **Test admin dashboard:**
   - Go to http://localhost:3000/admin
   - Click Analytics tab
   - Should load without errors

5. **Check console logs:**
   - Server console should show: `[Metrics API] Admin verified, fetching metrics...`
   - Browser console should show no errors

---

## Success Indicators

✅ **Everything is working when:**
- Dev server starts with no Firebase errors
- Can access /admin dashboard
- Analytics loads without errors
- Browser console shows: `[Metrics API] Auth check: { isAdmin: true }`
- Network tab shows 200 status for `/api/admin/metrics`
- Metrics display (even if all zeros)

---

## Next Steps

Once admin authentication is fully working:

1. ✅ Verify all admin features work
2. ✅ Test with non-admin user (should be blocked)
3. 🚀 Proceed to Phase 2: Remove unused files
4. 🧹 Phase 3: Clean up console.logs
5. 🎨 Phase 4: Optimize client bundles

---

**Need immediate help?** Share:
1. Server console output (where `pnpm dev` runs)
2. Browser console errors (F12 → Console)
3. Network tab response (F12 → Network → /api/admin/metrics)
4. Whether `.env.local` exists and has Firebase Admin credentials


# 🔐 URGENT: Firebase Admin SDK Security Update Required

## ⚠️ Security Issue
Your Firebase Admin SDK private key was previously committed to the repository. This key has been deleted from the codebase, but you **MUST** revoke it and generate a new one to ensure security.

## 🚨 Immediate Action Required

### Step 1: Revoke the Old Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **the-boot-room**
3. Click on the gear icon (⚙️) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Scroll down to the **Firebase Admin SDK** section
6. Click on **Manage service account permissions** (this opens Google Cloud Console)
7. Find the service account that ends with `@the-boot-room.iam.gserviceaccount.com`
8. Click on it to open details
9. Go to the **KEYS** tab
10. Find the key that was previously in your repo (check the creation date)
11. Click the **⋮** (three dots) menu → **Delete**
12. Confirm deletion

### Step 2: Generate a New Service Account Key

1. Still in the **KEYS** tab (from Step 1)
2. Click **ADD KEY** → **Create new key**
3. Select **JSON** format
4. Click **CREATE**
5. The JSON file will download automatically
6. **IMPORTANT:** 
   - Store this file securely (e.g., in a password manager)
   - **NEVER** commit this file to Git
   - Keep it for local development only

### Step 3: Set Up Environment Variables

#### For Local Development

1. Open the downloaded JSON file
2. Copy the following values:
   - `client_email`
   - `private_key`

3. Add to your `.env.local` file:

```env
# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@the-boot-room.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Make sure you already have these client-side variables:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=the-boot-room.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=the-boot-room
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=the-boot-room.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important Notes:**
- The `private_key` value must be wrapped in double quotes
- Keep the `\n` characters as-is (they represent line breaks)
- The entire key should be on one line in the `.env.local` file

#### For Vercel/Production

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `FIREBASE_ADMIN_CLIENT_EMAIL` = (paste the client_email value)
   - `FIREBASE_ADMIN_PRIVATE_KEY` = (paste the entire private_key value)
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = (if not already set)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = (if not already set)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = (if not already set)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = (if not already set)
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = (if not already set)
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = (if not already set)

4. Set the environment scope:
   - Production ✅
   - Preview ✅
   - Development ✅

5. Click **Save**

6. Redeploy your application:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push
   ```

### Step 4: Verify Setup

1. Test locally:
   ```bash
   pnpm dev
   ```

2. Check the console - you should NOT see any Firebase Admin initialization errors

3. Test an admin endpoint (if you have admin access):
   - Try importing boots or accessing analytics
   - If it works, your setup is correct ✅

4. Test in production:
   - Deploy to Vercel
   - Check deployment logs for Firebase errors
   - Test admin functionality

## 🔒 Security Best Practices Going Forward

### ✅ DO:
- Store service account keys in environment variables
- Use `.env.local` for local development (already in `.gitignore`)
- Use Vercel Environment Variables for production
- Keep your JSON key file in a secure location (password manager)
- Rotate keys periodically (every 90 days recommended)

### ❌ DON'T:
- Commit service account JSON files to Git
- Share keys in Slack, email, or other channels
- Store keys in plaintext on your computer
- Use production keys in development (if possible)
- Leave unused keys active

## 📚 Additional Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## ✅ Checklist

- [ ] Old service account key revoked in Firebase Console
- [ ] New service account key generated
- [ ] JSON key file stored securely (not in repo)
- [ ] `.env.local` updated with new credentials
- [ ] Vercel environment variables updated
- [ ] Local development tested
- [ ] Production deployment tested
- [ ] Admin functionality verified

---

**Once completed, delete this file or move it to a secure internal documentation location.**


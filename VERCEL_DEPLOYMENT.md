# Vercel Deployment Guide

This guide will walk you through deploying your Next.js application to Vercel.

## Prerequisites

1. **Git Repository**: Your code must be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is fine)
3. **All API Keys Ready**: Have all your API keys ready (see Environment Variables section below)

## Step 1: Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js

## Step 2: Configure Build Settings

Vercel should auto-detect your Next.js project, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (or leave blank - Vercel will auto-detect)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `pnpm install` (auto-detected)
- **Root Directory**: `./` (unless your Next.js app is in a subdirectory)

**Important**: Your `package.json` specifies `pnpm@9.0.0`, so Vercel will automatically use pnpm.

## Step 3: Set Environment Variables

Go to **Settings** → **Environment Variables** and add ALL of the following:

### Firebase (Client-Side - Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin (Server-Side - Private)
```
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

**Important for FIREBASE_ADMIN_PRIVATE_KEY:**
- Copy the ENTIRE private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Keep the `\n` characters as-is (they represent newlines)
- The value should be wrapped in quotes if it contains special characters
- In Vercel's UI, paste it exactly as it appears in your service account JSON

### Stripe
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (set this AFTER deployment - see Step 5)
```

### OpenAI
```
OPENAI_API_KEY=sk-...
```

### Google Maps
```
GOOGLE_MAPS_API_KEY=your_server_side_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_side_api_key_here
```

**Note**: If you have one unrestricted key, use it for both variables.

### Cloudflare R2
```
CLOUDFLARE_API_TOKEN=your_single_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_BUCKET_NAME=tbr-foot-measurements
```

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Step 5: Post-Deployment Setup

### A. Stripe Webhook Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks) (use test or live mode as appropriate)
2. Click **"Add endpoint"**
3. Enter your production URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - (Add any other events your app needs)
5. Copy the **"Signing secret"** (starts with `whsec_`)
6. Go back to Vercel → **Settings** → **Environment Variables**
7. Add/update `STRIPE_WEBHOOK_SECRET` with the signing secret
8. Redeploy your application (Vercel will auto-redeploy if you have auto-deploy enabled)

### B. Google Maps API Restrictions

If you're using separate keys for client and server:

1. **Server-side key** (`GOOGLE_MAPS_API_KEY`): Should have NO HTTP referrer restrictions
2. **Client-side key** (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`): Can have HTTP referrer restrictions
   - Add your Vercel domain: `https://your-project.vercel.app/*`
   - Add your custom domain if you have one: `https://yourdomain.com/*`

### C. Firebase Security Rules

Ensure your Firestore security rules allow access from your production domain. Test them in the Firebase Console.

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update any API key restrictions (Google Maps, etc.) to include your custom domain

## Environment-Specific Variables

Vercel allows you to set different values for different environments:

- **Production**: Your live site
- **Preview**: Every branch/PR gets a preview deployment
- **Development**: Local development (not used by Vercel)

**Recommendation**: 
- Use **test keys** (Stripe test mode, etc.) for Preview environments
- Use **production keys** only for Production environment

To set environment-specific variables:
1. When adding a variable, select the environment(s) it applies to
2. Or edit an existing variable and change its environment scope

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - Missing environment variables (check console logs)
   - TypeScript errors (fix locally first)
   - Missing dependencies (ensure `package.json` is correct)

### Runtime Errors

1. **Check function logs** in Vercel dashboard
2. **Common issues**:
   - Firebase Admin not initialized (check `FIREBASE_ADMIN_PRIVATE_KEY` format)
   - Stripe webhook failing (verify webhook secret matches)
   - Google Maps API errors (check API key restrictions)

### Firebase Admin Private Key Issues

If you see "Firebase Admin initialization failed":
- Ensure the private key includes the BEGIN/END lines
- Ensure `\n` characters are preserved (don't replace them with actual newlines in Vercel UI)
- The key should be on a single line with `\n` characters

### Environment Variables Not Working

- **Redeploy** after adding/updating environment variables
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Server-side variables (without `NEXT_PUBLIC_`) are only available in API routes and server components

## Quick Checklist

- [ ] Repository connected to Vercel
- [ ] Build settings configured (auto-detected is fine)
- [ ] All Firebase variables set (client + admin)
- [ ] Stripe keys set (secret + publishable)
- [ ] OpenAI API key set
- [ ] Google Maps keys set (server + client)
- [ ] Cloudflare R2 variables set
- [ ] Initial deployment successful
- [ ] Stripe webhook configured and secret added
- [ ] Google Maps API restrictions updated
- [ ] Custom domain configured (if applicable)
- [ ] Tested payment flow
- [ ] Tested foot measurement feature
- [ ] Tested boot fitter locator

## Next Steps

After deployment:
1. Test all major features
2. Monitor Vercel logs for errors
3. Set up error tracking (Sentry, etc.) if needed
4. Configure analytics
5. Set up monitoring/alerts

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/projects/environment-variables)



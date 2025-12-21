# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the `thebootroom` directory with the following variables:

### Firebase Configuration

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Stripe Configuration (Required for Payment Features)

```env
STRIPE_SECRET_KEY=sk_test_... (get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe Dashboard after creating webhook endpoint)
```

### OpenAI Configuration (Required for AI Breakdown Generation)

```env
OPENAI_API_KEY=sk-... (get from https://platform.openai.com/api-keys)
```

### Google Maps Configuration (Required for Boot Fitter Locator)

**Important:** If your API key has HTTP referrer restrictions, you need TWO keys:

```env
# Server-side key (for API routes) - NO restrictions
GOOGLE_MAPS_API_KEY=your_server_side_api_key_here

# Client-side key (for static maps) - Can have referrer restrictions
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_side_api_key_here
```

**OR** if you have one unrestricted key, use it for both:

```env
GOOGLE_MAPS_API_KEY=your_unrestricted_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_unrestricted_api_key_here
```

## How to Get Your Keys

### Stripe Keys (Test Mode)

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" (starts with `sk_test_`)
3. Copy the "Publishable key" (starts with `pk_test_`)

### Stripe Webhook Secret

1. Deploy your app to Vercel first
2. Go to: https://dashboard.stripe.com/test/webhooks
3. Click "Add endpoint"
4. Enter your production URL: `https://your-domain.vercel.app/api/webhooks/stripe`
5. Select event: `payment_intent.succeeded`
6. Copy the "Signing secret" (starts with `whsec_`)

### OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### Google Maps API Key

1. Go to: https://console.cloud.google.com/google/maps-apis
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Geocoding API
   - Maps Static API
4. Go to "Credentials" → "Create Credentials" → "API Key"

**For Server-Side API Routes (Geocoding):**
- Create an API key WITHOUT HTTP referrer restrictions
- Restrict it to: Geocoding API only
- Add to `.env.local` as: `GOOGLE_MAPS_API_KEY=your_key_here`

**For Client-Side (Static Maps):**
- Can use the same key OR create a separate one
- Can have HTTP referrer restrictions (restrict to your domain)
- Add to `.env.local` as: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`

**Note:** If you get "API keys with referer restrictions cannot be used with this API" error, you need to create a separate unrestricted key for server-side use.

### Cloudflare R2 Configuration (Required for Foot Measurement Feature)

```env
CLOUDFLARE_API_TOKEN=your_single_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_BUCKET_NAME=tbr-foot-measurements
```

**How to Get Your R2 Credentials:**

1. Go to: https://dash.cloudflare.com/
2. Select your account
3. Navigate to **R2** in the left sidebar
4. Note your **Account ID** (found at the top of the R2 dashboard)
5. Go to **API Tokens** (user menu → **My Profile** → **API Tokens**)
6. Click **Create Token**
7. Use the **Edit Cloudflare Workers** template or create a custom token with:
   - **Permissions**: 
     - Account → Cloudflare R2 → Edit
     - Zone → Zone Settings → Read (if needed)
   - **Account Resources**: Include your account
8. Copy the **API Token** (only shown once - save it!)

**Bucket Setup:**

1. In R2 dashboard, click **Create bucket**
2. Name it: `tbr-foot-measurements` (or use your preferred name)
3. Set **Public Access** to **Disabled** (private bucket)
4. After creating, go to bucket settings → **Lifecycle Rules**
5. Add a rule to delete objects after **1 hour**

**Important:** 
- The bucket must be private (no public access) since images contain sensitive user data and are deleted immediately after processing.
- This implementation uses Cloudflare API Token authentication with Bearer token auth (not S3-compatible credentials).
- Uploads are handled via server-side proxy endpoint for security.

## Important Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- **Restart your dev server** after adding/updating environment variables
- Use **test keys** for development, **live keys** for production
- For production (Vercel), add these same variables in Vercel Dashboard → Settings → Environment Variables

## Quick Setup

1. Create `.env.local` in the `thebootroom` directory
2. Copy the template above
3. Fill in your actual keys
4. Restart your dev server: `pnpm dev`

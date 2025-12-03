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

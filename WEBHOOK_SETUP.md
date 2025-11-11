# Stripe Webhook Setup Guide

## Webhook Endpoint URL

### Production (Vercel)

After deploying to Vercel, your webhook URL will be:

```
https://your-domain.vercel.app/api/webhooks/stripe
```

Or if you have a custom domain:

```
https://your-custom-domain.com/api/webhooks/stripe
```

### Local Development

For local testing:

```
http://localhost:3000/api/webhooks/stripe
```

## Setup Steps

### 1. Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (get this from Stripe after creating webhook)
   - `OPENAI_API_KEY`
   - All Firebase environment variables

### 2. Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Local Testing with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret shown in the terminal
5. Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Testing

1. Make a test payment in your app
2. Check Stripe Dashboard > Webhooks for delivery status
3. Check your application logs for webhook processing
4. Verify the breakdown is generated and saved to Firestore

## Troubleshooting

- **404 Error**: Make sure the webhook URL is correct and the endpoint is deployed
- **Signature verification failed**: Check that `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
- **Webhook not received**: Verify the event type is `payment_intent.succeeded` and the endpoint is active

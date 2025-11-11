# Installing Stripe CLI on Windows

## Option 1: Using Scoop (Recommended)

1. Install Scoop (if not already installed):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   iwr -useb get.scoop.sh | iex
   ```

2. Install Stripe CLI:
   ```powershell
   scoop install stripe
   ```

## Option 2: Using Chocolatey

1. Install Chocolatey (if not already installed):
   - Visit https://chocolatey.org/install
   - Run the installation command as Administrator

2. Install Stripe CLI:
   ```powershell
   choco install stripe-cli
   ```

## Option 3: Manual Installation

1. Download the latest Windows binary from:
   https://github.com/stripe/stripe-cli/releases/latest

2. Download `stripe_X.X.X_windows_x86_64.zip`

3. Extract the zip file

4. Add the extracted folder to your PATH environment variable:
   - Right-click "This PC" → Properties → Advanced system settings
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add the path to the extracted folder
   - Click "OK" on all dialogs

5. Restart your terminal/PowerShell

## Verify Installation

After installation, verify it works:
```powershell
stripe --version
```

## Login to Stripe

After installation, login to your Stripe account:
```powershell
stripe login
```

This will open a browser window to authorize the CLI.

## Forward Webhooks Locally

Once installed and logged in, run:
```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

Copy the `whsec_...` secret and add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`.

## Alternative: Test in Production

If you prefer not to install Stripe CLI, you can:
1. Deploy to Vercel
2. Configure the webhook in Stripe Dashboard using your production URL
3. Use Stripe's test mode to make test payments
4. Check the webhook logs in Stripe Dashboard

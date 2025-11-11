# TheBootRoom

A web app that matches users to the best-fitting ski boots via a short fitting form, returns the top 3 matches with affiliate links, lets users save results with an account, and includes an admin page to manage the boot database and view analytics.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Hosting**: Vercel (frontend)

## Features

- 🎿 10-step quiz to match users with ski boots
- 🔍 Intelligent matching algorithm based on foot measurements, ability, and preferences
- 💾 Save quiz results with user accounts
- 🔗 Affiliate link tracking and analytics
- 👨‍💼 Admin dashboard for boot management and analytics
- 🔐 Firebase Authentication (Email/Password + Google)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google
   - Enable Anonymous (optional)
3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Deploy security rules from `firestore.rules`
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the Firebase configuration

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy the contents of `firestore.rules` to Firebase Console > Firestore Database > Rules.

### 5. Set Up Admin Users

To grant admin access, you'll need to set a custom claim on user accounts. This can be done using Firebase Admin SDK:

```javascript
// Using Firebase Admin SDK
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
thebootroom/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── account/           # User account page
│   ├── admin/             # Admin dashboard
│   ├── quiz/              # Quiz page
│   ├── results/           # Results page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── quiz/             # Quiz step components
│   └── ...
├── lib/                   # Utility functions
│   ├── firebase.ts       # Firebase initialization
│   ├── auth.tsx          # Auth context provider
│   ├── matching.ts       # Matching algorithm
│   ├── firestore/        # Firestore helpers
│   └── validators.ts     # Zod schemas
├── types/                 # TypeScript types
└── firestore.rules       # Firestore security rules
```

## CSV Import Format

Boots can be imported via CSV with the following format:

```csv
year,gender,bootType,brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume,toeBoxShape,calfAdjustment,walkMode,rearEntry,affiliateUrl,imageUrl,tags
25/26,Male,All-Mountain,Salomon,Shift Alpha BOA 130,98,130,Low,Low,Low,Square,No,No,No,https://...,https://...,all-mountain;performance
```

Boolean fields (calfAdjustment, walkMode, rearEntry) should be "Yes" or "No".

## Matching Algorithm

The matching algorithm scores boots based on:

- **Width Match** (40 points max): How well the boot width matches the user's foot width
- **Flex Match** (30 points max): How well the boot flex matches the user's ability and weight
- **Shape/Volume** (24 points max): Toe shape, instep height, and calf volume matches (8 points each)
- **Feature Affinity** (6 points max): Additional features like walk mode, rear entry, calf adjustment (2 points each)

## License

Private project - All rights reserved

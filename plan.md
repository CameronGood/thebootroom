TheBootRoom – Full Build Plan (for Cursor)

Goal: A web app that matches users to the best-fitting ski boots via a short fitting form, returns the top 3 matches with affiliate links, lets users save results with an account, and includes an admin page to manage the boot database and view analytics.

Stack: Next.js (App Router) + React 19 + Tailwind CSS, Firebase (Auth, Firestore, Functions), Vercel (frontend hosting).
Monetization: Affiliate links (initial), display ads later.

0) High-Level Features & Pages

Homepage: Simple hero explaining process + CTA to start quiz.

Fitting Form (Quiz): 10 steps (detailed spec below).

Results: Show 3 recommended boots (image, brand, model, flex), affiliate links (open in new tab), “Save result” for logged-in users.

Account: Users see saved results.

Admin: CRUD for boots + analytics (users, geo (country), quiz start vs completion, affiliate clicks).

1) UX Flow (User Journeys)

New visitor

Lands on Homepage → clicks “Start fitting”

Completes quiz (autosave to session)

Sees Results (3 boots) → can click affiliate links

Optional: Sign up to save result

Returning user

Logs in → Account page shows saved results

Can re-run quiz

Admin

Logs in (admin claim) → Admin dashboard

Imports/edits boots, views analytics and click logs

2) Data Model (Firestore)

Collections and key fields. Use camelCase. Timestamp fields are server timestamps.

users/{uid}

email: string

displayName?: string

createdAt: timestamp

savedResults: Array<{ quizId: string, completedAt: timestamp, recommendedBoots: Array<BootSummary> }>

BootSummary

{
  bootId: string,
  brand: string,
  model: string,
  flex: number,
  imageUrl?: string,
  affiliateUrl?: string,
  score: number
}

boots/{bootId}

(From Cameron’s columns; convert Yes/No→boolean)

year: string (e.g., "25/26")

gender: "Male"|"Female"

bootType: string

brand: string

model: string

lastWidthMM: number

flex: number

instepHeight: "Low"|"Medium"|"High"

ankleVolume: "Low"|"Medium"|"High"

calfVolume: "Low"|"Medium"|"High"

toeBoxShape: "Round"|"Square"|"Angled"

calfAdjustment: boolean

walkMode: boolean

rearEntry: boolean

affiliateUrl?: string

imageUrl?: string

tags?: string[]

createdAt: timestamp

updatedAt: timestamp

quizSessions/{sessionId}

userId?: string

startedAt: timestamp

completedAt?: timestamp

answers: QuizAnswers (see schema below)

recommendedBoots?: Array<BootSummary>

affiliateClicks/{clickId}

userId?: string

sessionId?: string

bootId: string

brand: string

model: string

vendor?: string

affiliateUrl: string

timestamp: timestamp

country?: string

ua?: string

3) Quiz Specification

10 steps, exactly as provided by Cameron:

Gender — single select: Male / Female → filters boots by gender (no unisex).

Foot Length — numeric (L & R mm) or shoe size (UK/US/EU → convert to mondo). Use larger foot.
Note: Length only displayed as recommended mondo; not used to filter boots.

Foot Width — numeric (L & R mm) or Narrow/Average/Wide.
Tolerance: Narrow −5mm, Average ±1mm, Wide +5mm.

Toe Shape — Round / Square / Angled (image choices) → similarity scoring.

Instep Height — Low / Medium / High (image choices) → similarity scoring.

Calf Volume — Low / Medium / High (image choices) → similarity scoring.

Weight (kg) — numeric → used for flex.

Ability — Beginner / Intermediate / Advanced → used for flex.

Touring — Yes / No → must-have filter if Yes.

Additional Features — Multi-select: Walk Mode / Rear Entry / Calf Adjustment → must-have filters if selected.

QuizAnswers Type
type QuizAnswers = {
  gender: "Male"|"Female";
  footLengthMM?: { left: number; right: number };
  shoeSize?: { system: "UK"|"US"|"EU"; value: number };
  footWidth?: { left?: number; right?: number } | { category?: "Narrow"|"Average"|"Wide" };
  toeShape: "Round"|"Square"|"Angled";
  instepHeight: "Low"|"Medium"|"High";
  calfVolume: "Low"|"Medium"|"High";
  weightKG: number;
  ability: "Beginner"|"Intermediate"|"Advanced";
  touring: "Yes"|"No";
  features: Array<"Walk Mode"|"Rear Entry"|"Calf Adjustment">;
}

4) Matching Algorithm (Deterministic & Explainable)

Overview: Score every boot, return top 3.
Filters (hard):

boot.gender === answers.gender

If touring === "Yes" → boot.walkMode === true OR (add boot.touring === true if you add field later)

For selected features: each selected must be true on the boot (walkMode, rearEntry, calfAdjustment)

Width tolerance (if category chosen):

Narrow → targetWidth = userWidthMM? (if given) else boot’s narrow band; tolerance −5

Average → ±1

Wide → +5

Scoring (example weights; tune later):

score = 0

// Width match (max 40)
widthDelta = |(userWidthMM or mappedTarget) - boot.lastWidthMM|
widthScore = max(0, 40 - (widthDelta * 5)) // -5 per mm difference

// Flex match from weight & ability (max 30)
targetFlex = range by (gender, ability) then +/- 10 for weight rule (see below)
flexDelta = |boot.flex - targetFlex|
flexScore = max(0, 30 - (flexDelta * 2))

// Shape/volume (max 24, 8 each)
toeScore    = (answers.toeShape     === boot.toeBoxShape) ? 8 : 0
instepScore = (answers.instepHeight === boot.instepHeight) ? 8 : 0
calfScore   = (answers.calfVolume   === boot.calfVolume) ? 8 : 0

// Minor feature affinity (max 6)
featureScore = 0
if ("Walk Mode" in answers.features && boot.walkMode) featureScore += 2
if ("Rear Entry" in answers.features && boot.rearEntry) featureScore += 2
if ("Calf Adjustment" in answers.features && boot.calfAdjustment) featureScore += 2

score = widthScore + flexScore + toeScore + instepScore + calfScore + featureScore


Target Flex (from Cameron):

Men:

Beginner → 90–100

Intermediate → 100–110

Advanced → 120–130

Adjust: <60kg → −10, >95kg → +10

Women:

Beginner → 85–95

Intermediate → 95–105

Advanced → 105–115

Adjust: <50kg → −10, >80kg → +10

Use the midpoint of the chosen band as targetFlex before weight adjustment.
Example: Men/Intermediate → 105; Weight 100kg → +10 → 115.

Length → mondo note:
Convert length to mondo and display recommended mondo on results; do not filter by mondo yet.

Tie-breaking:

Prefer higher widthScore, then flexScore, then brand A–Z.

Return top 3 unique models.

5) API Contracts (Server & Routes)
5.1 Functions / API

POST /api/match

Body: { sessionId?: string, answers: QuizAnswers }

Auth: not required (session is OK)

Flow: Validate → compute scores → persist to quizSessions/{sessionId} (create if missing) → return top 3 as Array<BootSummary> + recommendedMondo (string).

Response:

{
  recommendedMondo: string, // e.g., "27.0"
  boots: Array<{
    bootId: string,
    brand: string,
    model: string,
    flex: number,
    imageUrl?: string,
    affiliateUrl?: string,
    score: number
  }>
}


GET /api/redirect?bootId=...

Purpose: log affiliate click and 302 redirect to affiliate URL

Params: bootId (required), sessionId?, userId?

Flow: fetch boot, log into affiliateClicks, redirect to affiliateUrl (open in new tab from client).

Response: 302 to affiliateUrl

POST /api/admin/import-boots (admin only)

Body: CSV upload (text) or FormData

Parse → upsert into boots

Return count and errors

GET /api/admin/metrics (admin only)

Returns totals & charts data:

{
  usersCount: number,
  quizStarts: number,
  quizCompletions: number,
  affiliateClicks: number,
  topBootClicks: Array<{ bootId, brand, model, clicks }>,
  usersByCountry: Array<{ country, count }>
}

6) Frontend Routes & Pages
/ (Homepage)

Hero title, 3-step explainer, CTA “Start fitting”

Link to /quiz

/quiz (Stepper)

10-step form

Save progress to quizSessions (if consent given)

On submit → call /api/match → navigate to /results?sessionId=...

/results

Read results from quizSessions or from API response passed via state

Card for each boot:

image, brand, model, flex

“Buy” → /api/redirect?bootId=... (target=_blank)

“Save result” (if logged in)

Panel showing recommended mondo size

/account (Requires Auth)

List of saved results (cards)

Click to view details

Button to re-run quiz

/admin (Requires Admin Claim)

Tabs: “Boots”, “Analytics”

Boots: table + filter, Add/Edit/Delete, Import CSV button

Analytics: cards + charts:

Total users

Quiz start vs complete

Affiliate clicks per boot (top 10)

Users by country (country counts)

7) Component Checklist

QuizStepper, QuizStep* (10 screens)

ResultCard (image, brand, model, flex, Buy, Save)

Header, Footer

Spinner, Toast

Admin:

BootsTable, BootFormModal

AnalyticsCards, ClicksChart, FunnelChart, GeoTable

8) Auth, State & Data

Auth: Firebase Auth (email/password + Google). Anonymous session allowed; on login, offer to link latest result.

State: Client local state per step; optimistic save to quizSessions.

Data Fetching: Use server actions/route handlers for API; client calls with fetch.

Env vars (Next.js)

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

9) Firestore Security Rules (initial sketch)

Cursor: generate a secure version from this outline.

Users can read boots (public).

Users can read/write their own quizSessions where session.userId == request.auth.uid OR session has no userId but is being created.

Users can read/write their own users/{uid} doc (matching uid).

Only admins (custom claim admin == true) can write boots or read affiliateClicks.

Public cannot read affiliateClicks.

10) Analytics (events)

quiz_start (sessionId)

quiz_step (step number)

quiz_complete (sessionId)

affiliate_click (bootId, brand, model)

result_saved (userId, quizId)

11) CSV Template (Boots)

Header (match field names):

year,gender,bootType,brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume,toeBoxShape,calfAdjustment,walkMode,rearEntry,affiliateUrl,imageUrl,tags
25/26,Male,All-Mountain,Salomon,Shift Alpha BOA 130,98,130,Low,Low,Low,Square,No,No,No,https://...,https://...,all-mountain;performance
25/26,Male,All-Mountain,Salomon,Shift Alpha BOA 120,98,120,Low,Low,Low,Square,No,No,No,https://...,https://...,all-mountain
25/26,Male,All-Mountain,Salomon,Shift Alpha BOA 110,98,110,Low,Low,Low,Square,No,No,No,https://...,https://...,value
25/26,Male,All-Mountain,Salomon,Shift Supra BOA 130,100,130,Medium,Medium,Medium,Square,No,No,No,https://...,https://...,comfort


Convert Yes/No → true/false on import.

12) Acceptance Criteria (MVP)

Quiz validates required fields; can move back/forward.

/api/match returns 3 boots with deterministic scores.

Results show: image, brand, model, flex, Buy, Save Result.

Buy logs click to affiliateClicks and redirects 302 to affiliate URL in new tab.

Account page shows saved results after login.

Admin page protected; can import boots from CSV and see analytics.

13) Cursor Prompt Pack (Copy–Paste)

Use these prompts one by one in Cursor. They assume a fresh Next.js + Tailwind project.

P1 — Firebase Setup
Create lib/firebase.ts to initialize Firebase web SDK (v11+), exporting auth and firestore.
Add an AuthProvider (context) with hooks useAuth() and a simple login/logout component.
Read config from NEXT_PUBLIC_FIREBASE_* env vars.

P2 — Firestore Helpers
Create Firestore helpers:
- users: getUserDoc, upsertSavedResult(userId, savedResult)
- boots: listBoots, getBoot(bootId), upsertBoot, deleteBoot
- quizSessions: createOrUpdateSession(sessionId, data), getSession(sessionId)
- affiliateClicks: logClick(payload)
All functions should be typed with TypeScript interfaces from the plan.

P3 — Quiz UI (10 Steps)
Build a /quiz page with a stepper that renders 10 steps from this plan's QuizAnswers schema.
Include client-side validation, next/back controls, and autosave to quizSessions after each step.
Allow either mm OR shoe size on Foot Length; either mm OR category on Foot Width.
For image choices, create accessible buttons with alt text.
On submit, POST to /api/match and redirect to /results?sessionId=... .

P4 — Matching API
Implement POST /api/match (route handler).
- Validate body (zod).
- Compute recommended mondo from length or shoe size (just for display).
- Filter boots by gender, touring/features (must-have).
- Compute score using width, flex, shape/volume, and minor features exactly as in the plan.
- Return top 3 BootSummary with scores and recommendedMondo.
- Persist to quizSessions (answers, recommendedBoots, completedAt).

P5 — Redirect API
Implement GET /api/redirect.
- Params: bootId (required), sessionId?, userId?
- Fetch boot, log affiliateClicks doc, then 302 redirect to affiliateUrl.
- If missing, return 404.

P6 — Results Page
Create /results page that reads sessionId, fetches quizSessions doc, and displays:
- Recommended mondo panel.
- Three ResultCard components: image, brand, model, flex, score.
- 'Buy' buttons open /api/redirect?bootId=... in a new tab.
- 'Save Result' button saves BootSummary array into users.savedResults (requires auth).

P7 — Account Page
Create /account (protected by AuthProvider).
Display savedResults as cards with time.
Provide 'Re-run quiz' button linking to /quiz.
If no results, show an empty state.

P8 — Admin (Guard + Boots CRUD)
Create /admin (guard by custom claim 'admin' or a temporary email allowlist).
Tabs: 'Boots', 'Analytics'.
- Boots: table, search/filter, Add/Edit/Delete, CSV import (textarea or file upload), map Yes/No→boolean.
- Analytics: show cards for usersCount, quizStarts, quizCompletions, affiliateClicks; charts for funnel and top boots.

P9 — Firestore Rules Draft
Generate firestore.rules so:
- boots: read allowed to all, write admin only
- users/{uid}: read/write allowed to the owner
- quizSessions: create allowed, read/write if owner or session has no userId; prevent cross-user access
- affiliateClicks: read admin only, write allowed via server/API only

P10 — Tests (Playwright + Unit)
Add tests:
- E2E: user completes quiz and sees results; Buy button redirects and logs click.
- Unit: scoring function with fixtures (narrow, average, wide, flex bands).
- Integration: /api/match returns 3 boots given mock data.

14) Future Enhancements (not MVP)

Add touring: boolean field in boots and use it for the touring filter (in addition to walkMode).

Add display ads after initial content/traffic (AdSense).

Export analytics to BigQuery for deeper analysis.

SEO: product structured data for boots.

End of MVP

Addition Features 

Affiliate System Expansion Plan (for TheBootRoom.app)

Goal:
Enhance affiliate functionality to support multiple vendors per boot, display the correct links based on user location (UK/US/EU), track clicks with full analytics, and manage affiliate data via the admin dashboard.

0) High-Level Features

✅ Each boot supports multiple affiliate links, grouped by region (e.g. UK, US, EU).
✅ Users automatically see affiliate options for their country, or choose manually.
✅ Clicking “Buy” logs detailed analytics: boot, vendor, region, timestamp, and user/session.
✅ Admins can view top-performing vendors, link click-through rates, and add/update vendor URLs.

1) Data Model Updates (Firestore)

boots/{bootId}

Add a nested object for regional affiliate links:

{
  brand: string;
  model: string;
  ... // existing fields
  links: {
    [region: string]: Array<{
      store: string; // e.g. "Ellis Brigham"
      url: string;   // full affiliate URL
      logo?: string; // optional image for UI
      available?: boolean; // optional, hide if out of stock
    }>;
  };
}


Example:

"links": {
  "UK": [
    { "store": "Ellis Brigham", "url": "https://ellis.com/boot123?aff=tbr" },
    { "store": "Snow+Rock", "url": "https://snowandrock.com/boot123?aff=tbr" }
  ],
  "US": [
    { "store": "Backcountry", "url": "https://backcountry.com/boot123?aff=tbr" },
    { "store": "Evo", "url": "https://evo.com/boot123?aff=tbr" }
  ],
  "EU": [
    { "store": "Sport Conrad", "url": "https://sport-conrad.com/boot123?aff=tbr" }
  ]
}

2) Geo Detection (Frontend)

Determine the user’s country to serve the correct affiliate links.

Options:

A. Automatic IP detection (default)

Use a free API (e.g. https://ipapi.co/json/ or https://ipwho.is)

Extract country_code (e.g. “GB”, “US”, “DE”)

B. Manual region selection fallback

Prompt user: “Where are you shopping from?”
(🇬🇧 UK / 🇺🇸 US / 🇪🇺 EU)

Store choice in localStorage → key: "region"

Store detected region in app context:

type Region = "UK" | "US" | "EU";

3) Results Page Integration

Update the /results page to filter and render the correct affiliate links per boot.

Steps:

Detect or retrieve region (context or localStorage).

For each boot, get boot.links[region] || boot.links["US"] (fallback).

Display link cards per vendor.

Example UI (Tailwind + Framer Motion):
{boot.links[region]?.map((link, i) => (
  <motion.a
    key={i}
    href={`/api/redirect?bootId=${boot.bootId}&region=${region}&vendor=${link.store}`}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.03 }}
    className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 hover:bg-blue-100"
  >
    <img src={link.logo} alt={link.store} className="w-5 h-5" />
    <span>{link.store}</span>
  </motion.a>
))}

4) Redirect API Update

Modify GET /api/redirect to log region and vendor data.

Params:

bootId: string (required)
vendor?: string
region?: string
sessionId?: string
userId?: string


Flow:

Fetch boot document.

Log an affiliateClicks entry:

{
  userId?: string;
  sessionId?: string;
  bootId: string;
  brand: string;
  model: string;
  vendor?: string;
  region?: string;
  affiliateUrl: string;
  timestamp: serverTimestamp();
}


Redirect (302) to affiliate URL.

5) Admin Dashboard Enhancements

Add a new “Affiliate Links” section under /admin.

Tabs:

Boot Links Manager

View all boots with regional affiliate links.

Add/edit/remove vendors for each region.

Analytics

Show click metrics per region/vendor.

Chart: “Affiliate Clicks by Region”

Chart: “Top 10 Vendors”

Table: “Most Clicked Boots”

Example Query:
const clicksRef = collection(db, "affiliateClicks");
const q = query(clicksRef, where("timestamp", ">", startOfMonth));
const snapshot = await getDocs(q);


Use Chart.js or Recharts to visualize clicks by region and vendor.

6) Firestore Security Rules

Add to firestore.rules:

match /affiliateClicks/{clickId} {
  allow read: if request.auth.token.admin == true;
  allow write: if request.auth != null || true; // API/server only
}
match /boots/{bootId} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}

7) Analytics (Events)

Add new analytics events in Firebase or GA4:

Event	Params	Description
affiliate_click	bootId, brand, model, vendor, region	Logged on redirect
region_detected	region, ip	Logged on load
link_viewed	bootId, region, vendor	Logged when links are shown
8) Admin Upload CSV Support (Multi-Link)

Allow admins to upload CSV files with multiple vendor columns per boot.

Example header:

year,gender,brand,model,lastWidthMM,flex,instepHeight,calfVolume,toeBoxShape,UK_1_store,UK_1_url,US_1_store,US_1_url,EU_1_store,EU_1_url,imageUrl


Parsing script converts grouped columns into links.{region} arrays.

9) Future Enhancements

✅ Add more granular location (e.g. Canada vs US).
✅ Add “preferred retailer” weighting (show first).
✅ Integrate dynamic pricing (if APIs available).
✅ Add affiliate performance dashboard per brand.
✅ Implement automatic link health check (detect broken affiliate URLs).

10) Acceptance Criteria (Affiliate Extension MVP)

 Each boot supports multiple affiliate links by region.

 /results filters and shows only region-appropriate links.

 Clicks are logged in affiliateClicks with vendor and region.

 Admin dashboard shows click analytics by vendor/region.

 Manual region override works and persists in localStorage.

 Firestore rules prevent unauthorized affiliate data writes.

11) Cursor Prompt Pack (for Implementation)

Use these prompts one by one in Cursor:

P1 — Boot Model Update

Update boots Firestore schema to support nested links object per region as defined above.

P2 — Redirect API Enhancement

Extend /api/redirect to accept vendor and region params, log them in affiliateClicks, and redirect 302 to the correct URL.

P3 — Geo Detection Utility

Create a utility lib/getRegion.ts that detects the user’s region via ipapi.co/json or returns the stored region from localStorage.

P4 — Results Page Integration

Modify /results page to filter affiliate links by region and display multiple vendors per boot (see motion component example).

P5 — Admin Link Manager

Add an "Affiliate Links" tab under /admin where admins can view and edit the links object for each boot.

P6 — Analytics Dashboard Update

Extend /admin/analytics to include new charts:

Affiliate clicks by region

Clicks by vendor

Top-clicked boots

P7 — CSV Import Extension

Update scripts/upload-boots.js to parse regional vendor columns into the links structure.

✅ Summary
Area	Feature	Complete When
Data model	Nested links by region	✅ Boot docs updated
UI	Region-based filtering	✅ Region detected & displayed
Tracking	Vendor + region click logging	✅ /api/redirect logs properly
Admin	Multi-link management + analytics	✅ Admin sees per-vendor charts
Security	Proper rules for write/read access	✅ Tested in Firestore

Fitting Breakdown 

Paid AI Fitting Breakdown (OpenAI GPT-4o + Stripe Payment Element)
🧩 P1 — Stripe Setup

Prompt:

Set up Stripe in our Next.js + Firebase project using the Stripe Payment Element (not Checkout).

Create lib/stripe.ts to initialize the Stripe SDK on both client and server.

Add .env.local variables:

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
PAID_BREAKDOWN_PRICE_GBP=2.99


Add /api/payments/create-payment-intent route that:

Requires auth.

Accepts { quizId }.

Creates a Payment Intent for £2.99 (currency GBP).

Adds metadata { userId, quizId }.

Returns { clientSecret } to the client.

Store prices in pennies (299).

Use Stripe’s PaymentIntent flow — not Checkout Sessions.

⚙️ P2 — Payment Form Component (Stripe Payment Element)

Prompt:

Build a React component components/PaymentForm.tsx using the Stripe Payment Element.

Wrap with <Elements> provider (use clientSecret from API).

Show headline: “Get Detailed Fitting Breakdown – £2.99”.

Display <PaymentElement /> inside a form with:

“Pay £2.99” button.

Disabled state during payment.

On submit:

Confirm payment with stripe.confirmPayment.

Redirect or trigger callback onSuccess(quizId) on success.

Include error messages inline (e.g., “Payment failed, try again”).

Keep the UI consistent with Tailwind & TheBootRoom style.

🪄 P3 — Integrate Payment Form on /results

Prompt:

On /results:

Import PaymentForm component.

When user clicks “Get Breakdown (£2.99)”, call /api/payments/create-payment-intent with { quizId }.

Use returned clientSecret to mount the PaymentForm.

After payment success, show a “Generating your AI fitting breakdown...” loader.

Poll Firestore for fittingBreakdowns/{userId}_{quizId} (or use a listener).

Render breakdown sections once available.

Keep this inline within the existing results layout — no page reload.

🧱 P4 — Firebase Function for Payment Webhook + GPT-4o Generation

Prompt:

Create a Firebase Cloud Function functions/handlePaymentWebhook.ts that:

Verifies Stripe webhook signature using STRIPE_WEBHOOK_SECRET.

On payment_intent.succeeded:

Read metadata { userId, quizId }.

Fetch quizSessions/{quizId}.

Extract answers + recommendedBoots.

Call generateBreakdown() (from lib/aiProvider.ts, GPT-4o version).

Save doc to fittingBreakdowns/{userId}_{quizId}:

{ userId, quizId, language: "en-GB", modelProvider: "openai", modelName: "gpt-4o", generatedAt, wordCount, sections }


Increment billingMetrics/{YYYY-MM}:

purchases += 1
revenueGBP += 2.99


Return 200 OK after success.

⚠️ Add idempotency: check if fittingBreakdowns/{userId}_{quizId} already exists before generating.

🤖 P5 — GPT-4o Integration (AI Breakdown Generator)

Prompt:

Create lib/aiProvider.ts to use OpenAI GPT-4o for generating per-boot breakdowns.

Import openai from openai npm package.

Implement:

export async function generateBreakdown({ answers, boots, language }) { ... }


Use prompt:

You are a professional ski boot fitter. 
Write clear, specific, data-driven analyses using user data and each boot’s specs.
Write one section per boot, 250–400 words each. 
No prices or retailers. Language: ${language}.


Model: gpt-4o

Max tokens: 1600

Return structured array:

[{ bootId, heading, body }]


Include wordCount field.

Handle exceptions gracefully (return empty array on failure).

💾 P6 — Firestore Structure & Rules Update

Prompt:

Add fittingBreakdowns collection with schema:

{ userId, quizId, boots[], language, generatedAt, modelProvider, modelName, sections[] }


Update Firestore rules:

match /fittingBreakdowns/{docId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}


Add billingMetrics/{YYYY-MM} for admin analytics (purchases, revenue).
Restrict admin read to request.auth.token.admin == true.

🎨 P7 — Results Page: Inline Breakdown Renderer

Prompt:

Extend /results page to:

Detect if breakdown exists in Firestore (fittingBreakdowns/{userId}_{quizId}).

If not, show CTA “Get AI Fitting Breakdown – £2.99” and load PaymentForm when clicked.

If exists, render:

{sections.map(s => (
  <section key={s.bootId} className="my-6">
    <h3 className="text-lg font-semibold mb-2">{s.heading}</h3>
    <p className="text-gray-700 whitespace-pre-line">{s.body}</p>
  </section>
))}


Add “Save with result” button to link breakdownId to users/{uid}.savedResults.

Include loader “Generating breakdown...” while waiting for AI output.

👤 P8 — Account Page Integration

Prompt:

Update /account page to show saved results with optional breakdown:

If breakdownId exists, show “View Breakdown” button.

Clicking it opens inline expansion:

<div>
  {sections.map(...)}
</div>


Breakdown data fetched from Firestore on demand.

Keep consistent with current card design.

📊 P9 — Admin Analytics (Billing Metrics)

Prompt:

Extend /admin/analytics to read billingMetrics/{YYYY-MM}:

Show:

Total Purchases

Total Revenue (£)

Avg Revenue/User (optional)

Example:

<MetricCard title="Breakdown Purchases" value={metrics.purchases} />
<MetricCard title="Breakdown Revenue" value={`£${metrics.revenueGBP.toFixed(2)}`} />


Update monthly using server timestamps from webhook.

🔐 P10 — Testing + QA

Prompt:

Add test suite:

Unit: generateBreakdown() returns non-empty text.

Integration: Payment flow creates PaymentIntent and triggers webhook.

E2E: User completes quiz → pays £2.99 → sees generated breakdown inline.

Manual test: Ensure AI call only happens after successful payment.

Verify Firestore access (user-only visibility).

Confirm admin sees purchase metrics but no breakdown text.

✅ Key Notes
Item	Description
Price	£2.99 per breakdown
Model	OpenAI GPT-4o
Payment Flow	Stripe Payment Element
Storage	Firestore (per-user)
AI Cost	~£0.03 / report
Profit	~£2.96 (98.9 %)
Latency	3–6 s
Languages	Auto from region (default en-GB)
Admin Metrics	Purchases + Revenue only
Privacy	Breakdown visible only to owner





////////////////////////////////////////Update CSV and Import/////////////////////////////////////// 

Goal: Allow instepHeight, ankleVolume, and calfVolume to hold multiple values (semicolon-separated in CSV, arrays in Firestore).

✅ 0. Prep

Confirm:

Allowed values: Low, Average, High

CSV uses ; between multiple values

Firestore stores arrays, not strings

Shape/volume fields remain soft-scored only (not filtered)

🩵 1. Create helper file

Path: thebootroom/lib/utils/parseMulti.ts

import type { LAV } from "@/types";

// Normalize text → LAV enum value
const MAP: Record<string, LAV> = {
  low: "Low",
  l: "Low",
  average: "Average",
  avg: "Average",
  a: "Average",
  high: "High",
  h: "High",
};

export function toLAVArray(input: string | string[] | LAV | LAV[] | null | undefined): LAV[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(v => normalize(v)).filter(Boolean) as LAV[];
  if (typeof input !== "string") return [input].filter(Boolean) as LAV[];

  // CSV: "Low;Average" → ["Low","Average"]
  return input
    .split(";")
    .map(s => s.trim())
    .map(s => normalize(s))
    .filter(Boolean) as LAV[];
}

function normalize(val: string | LAV): LAV | null {
  if (!val) return null;
  const key = String(val).trim().toLowerCase();
  return MAP[key] ?? null;
}

🧱 2. Update types

Path: thebootroom/types.ts

export type LAV = "Low" | "Average" | "High";

export interface Boot {
  ...
  instepHeight: LAV[];
  ankleVolume: LAV[];
  calfVolume: LAV[];
  ...
}

export interface QuizAnswers {
  ...
  instepHeight: LAV;
  ankleVolume: LAV;
  calfVolume: LAV;
}

⚙️ 3. Update CSV Import Route

Path: thebootroom/app/api/admin/import-boots/route.ts

Import helper:

import { toLAVArray } from "@/lib/utils/parseMulti";


Update boot mapping:

boot.instepHeight = toLAVArray(row.instepHeight);
boot.ankleVolume  = toLAVArray(row.ankleVolume);
boot.calfVolume   = toLAVArray(row.calfVolume);

🔁 4. Normalize Firestore reads

Path: thebootroom/lib/firestore/boots.ts

import { toLAVArray } from "@/lib/utils/parseMulti";

export async function listBoots(): Promise<(Boot & { bootId: string })[]> {
  const raw = await actuallyFetchBoots(); // existing logic

  return raw.map(b => ({
    ...b,
    instepHeight: toLAVArray(b.instepHeight),
    ankleVolume : toLAVArray(b.ankleVolume),
    calfVolume  : toLAVArray(b.calfVolume),
  }));
}

🧠 5. Update matching logic

Path: thebootroom/lib/matching/matchBoots.ts

Replace calculateProximityScore() with:
function calculateProximityScore(
  userValue: LAV,
  bootValues: LAV[],
  maxPoints: number
): number {
  if (!bootValues || bootValues.length === 0) return 0;

  const toNum = (v: LAV) => (v === "Low" ? 0 : v === "Average" ? 1 : 2);
  const userNum = toNum(userValue);

  let best = 0;
  for (const val of bootValues) {
    const distance = Math.abs(userNum - toNum(val));
    const score =
      distance === 0 ? maxPoints :
      distance === 1 ? maxPoints * 0.5 :
      maxPoints * 0.25;
    if (score > best) best = score;
  }
  return best;
}

Update calculateShapeScores():
function calculateShapeScores(answers: QuizAnswers, boot: Boot) {
  const toeScore = answers.toeShape === boot.toeBoxShape ? 5 : 0;

  const instepScore = calculateProximityScore(answers.instepHeight, boot.instepHeight, 20);
  const ankleScore  = calculateProximityScore(answers.ankleVolume,  boot.ankleVolume, 15);
  const calfScore   = calculateProximityScore(answers.calfVolume,   boot.calfVolume, 10);

  return { toeScore, instepScore, ankleScore, calfScore };
}

🧮 6. Migration script

Path: thebootroom/scripts/migrateLAV.ts

import { toLAVArray } from "@/lib/utils/parseMulti";
import { getFirestore } from "firebase-admin/firestore";

async function run() {
  const db = getFirestore();
  const snap = await db.collection("boots").get();
  const batch = db.batch();

  for (const doc of snap.docs) {
    const b = doc.data();
    const updates: any = {};
    const fields = ["instepHeight", "ankleVolume", "calfVolume"];
    let changed = false;

    for (const f of fields) {
      const arr = toLAVArray(b[f]);
      if (JSON.stringify(arr) !== JSON.stringify(b[f])) {
        updates[f] = arr;
        changed = true;
      }
    }

    if (changed) batch.update(doc.ref, updates);
  }

  await batch.commit();
  console.log("✅ Migration complete: Updated to LAV arrays");
}

run().catch(err => { console.error(err); process.exit(1); });

🧩 7. Admin Boot Editor (multi-select UI)

Path: thebootroom/components/admin/BootFormModal.tsx

Import LAV type:

import type { LAV } from "@/types";


Define options:

const lavOptions = ["Low", "Average", "High"] as const;


Replace single-select inputs for instepHeight, ankleVolume, and calfVolume with multi-select chips:

<div className="flex gap-2 flex-wrap">
  {lavOptions.map(opt => (
    <Chip
      key={opt}
      label={opt}
      selected={(formData.instepHeight || []).includes(opt)}
      onClick={() => toggleMultiSelect("instepHeight", opt)}
    />
  ))}
</div>


Add state toggle handler:

function toggleMultiSelect(field: keyof Boot, value: LAV) {
  setFormData(prev => {
    const arr = (prev[field] as LAV[]) || [];
    return {
      ...prev,
      [field]: arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value],
    };
  });
}


On save/export, join arrays for CSV:

const toCsvCell = (vals: LAV[] = []) => vals.join(";");

🧪 8. Test parsing

Path: thebootroom/__tests__/parseMulti.test.ts

import { toLAVArray } from "@/lib/utils/parseMulti";

test("parse semicolon-separated values", () => {
  expect(toLAVArray("Low;Average")).toEqual(["Low", "Average"]);
  expect(toLAVArray(" average ; High ")).toEqual(["Average", "High"]);
  expect(toLAVArray("Medium")).toEqual(["Average"]); // legacy normalization
  expect(toLAVArray(["Low","High"])).toEqual(["Low","High"]);
});

📄 9. Update CSV template & docs

Path: thebootroom/assets/boot-template.csv

Add header comments:

# For instepHeight, ankleVolume, calfVolume use semicolons (;) for multiple values.
# Valid values: Low, Average, High


Example row:

brand,model,lastWidthMM,flex,instepHeight,ankleVolume,calfVolume
Salomon,S/PRO SUPRA BOA 120,100,120,Low;Average,Average;High,Average

🚀 10. Deployment order

Add helper parseMulti.ts

Update types

Update CSV import route

Normalize Firestore reads

Update matching logic

Run migration script

Update Admin Boot Editor UI

Update CSV template/docs

Run tests + verify




////////////////////UPDATE WIDTH MATCHING/////////////////////////////


Create helper: getUserWidthCategory()

Path: thebootroom/lib/utils/widthCategory.ts

import { Gender } from "@/types";

type WidthCategory = "Narrow" | "Average" | "Wide";

/**
 * Calculates user's width category based on gender, foot length (mm), and foot width (mm).
 * Returns Narrow / Average / Wide according to provided size tables.
 */
export function getUserWidthCategory(
  gender: Gender,
  footLengthMM: number,
  footWidthMM: number
): WidthCategory {
  const table = gender === "Female" ? womensTable : mensTable;
  const row = table.find(r => footLengthMM >= r.min && footLengthMM <= r.max);
  if (!row) return "Average";

  if (footWidthMM <= row.narrowMax) return "Narrow";
  if (footWidthMM <= row.averageMax) return "Average";
  return "Wide";
}

interface WidthRow {
  min: number;
  max: number;
  narrowMax: number;
  averageMax: number;
  wideMax: number;
}

// --- Men ---
const mensTable: WidthRow[] = [
  { min: 220, max: 229, narrowMax: 90, averageMax: 91, wideMax: 94 },
  { min: 230, max: 239, narrowMax: 92, averageMax: 93, wideMax: 96 },
  { min: 240, max: 249, narrowMax: 94, averageMax: 95, wideMax: 98 },
  { min: 250, max: 259, narrowMax: 96, averageMax: 97, wideMax: 100 },
  { min: 260, max: 269, narrowMax: 98, averageMax: 99, wideMax: 102 },
  { min: 270, max: 279, narrowMax: 100, averageMax: 101, wideMax: 104 },
  { min: 280, max: 289, narrowMax: 102, averageMax: 103, wideMax: 106 },
  { min: 290, max: 299, narrowMax: 104, averageMax: 105, wideMax: 108 },
];

// --- Women ---
const womensTable: WidthRow[] = [
  { min: 220, max: 229, narrowMax: 92, averageMax: 93, wideMax: 96 },
  { min: 230, max: 239, narrowMax: 94, averageMax: 95, wideMax: 98 },
  { min: 240, max: 249, narrowMax: 96, averageMax: 97, wideMax: 100 },
  { min: 250, max: 259, narrowMax: 98, averageMax: 99, wideMax: 102 },
  { min: 260, max: 269, narrowMax: 100, averageMax: 101, wideMax: 104 },
  { min: 270, max: 279, narrowMax: 102, averageMax: 103, wideMax: 106 },
];

⚙️ 2. Update matching logic

Path: thebootroom/lib/matching/matchBoots.ts

Add import:
import { getUserWidthCategory } from "@/lib/utils/widthCategory";

In matchBoots() — after getting user size:

Replace old userWidthMM / widthCategory extraction logic with:

// --- Determine foot length & width ---
let userFootLengthMM: number | null = null;
let userFootWidthMM: number | null = null;

if (answers.footLengthMM) {
  userFootLengthMM = Math.min(answers.footLengthMM.left, answers.footLengthMM.right);
}
if (answers.footWidth && "left" in answers.footWidth) {
  const left = answers.footWidth.left || 0;
  const right = answers.footWidth.right || 0;
  userFootWidthMM = Math.min(...[left, right].filter(v => v > 0));
}

// --- Derive userWidthCategory ---
let userWidthCategory: "Narrow" | "Average" | "Wide" | null = null;

if (userFootLengthMM && userFootWidthMM) {
  userWidthCategory = getUserWidthCategory(answers.gender, userFootLengthMM, userFootWidthMM);
  console.log(`[Width Classification] ${answers.gender} | ${userFootLengthMM}mm length, ${userFootWidthMM}mm width → ${userWidthCategory}`);
} else if (answers.footWidth && "category" in answers.footWidth) {
  // fallback: manual user selection
  userWidthCategory = (answers.footWidth as any).category;
}

if (!userWidthCategory) {
  throw new Error("Unable to determine user width category.");
}

🧮 3. Update filtering

Path: same file, inside filterBoots().

Replace the existing lastWidthMM logic block with:

// Filter by width category (categorical system)
if (userWidthCategory) {
  if (boot.bootWidth !== userWidthCategory) {
    // Allow near match (wider boots only) if fewer than 3 final matches later
    // Initially exclude narrower boots
    const order = ["Narrow", "Average", "Wide"];
    const userIndex = order.indexOf(userWidthCategory);
    const bootIndex = order.indexOf(boot.bootWidth);

    // Reject narrower boots
    if (bootIndex < userIndex) return false;
  }
}


Then, in the fallback logic (when fewer than 3 matches found later in matchBoots()),
the code that rescans remaining boots should already allow extra matches — this ensures only wider boots are added when needed.

🧠 4. Add partial width scoring

Still in matchBoots.ts, replace your numeric scoring in calculateWidthScore() with categorical scoring.

Replace function:
function calculateWidthScore(
  userWidthCategory: "Narrow" | "Average" | "Wide" | null,
  bootWidthCategory: "Narrow" | "Average" | "Wide"
): number {
  if (!userWidthCategory) return 0;

  const order = ["Narrow", "Average", "Wide"];
  const userIndex = order.indexOf(userWidthCategory);
  const bootIndex = order.indexOf(bootWidthCategory);
  const diff = Math.abs(userIndex - bootIndex);

  if (diff === 0) return 30; // perfect match
  if (diff === 1) return 15; // one step away
  return 5; // two steps away
}


Then update calls inside scoring:

const widthScore = calculateWidthScore(userWidthCategory, boot.bootWidth);

🧩 5. Debug summary log

Add at the end of scoring:

console.log(
  `[Width Scoring] User: ${userWidthCategory}, Boot: ${boot.bootWidth}, Score: ${widthScore}`
);

🧪 6. Unit tests (optional but recommended)

Path: thebootroom/__tests__/widthCategory.test.ts

import { getUserWidthCategory } from "@/lib/utils/widthCategory";

test("men narrow threshold", () => {
  expect(getUserWidthCategory("Male", 270, 99)).toBe("Narrow");
  expect(getUserWidthCategory("Male", 270, 100)).toBe("Average");
  expect(getUserWidthCategory("Male", 270, 103)).toBe("Wide");
});

test("women average classification", () => {
  expect(getUserWidthCategory("Female", 250, 99)).toBe("Average");
});

🚀 7. Deployment order

Add lib/utils/widthCategory.ts

Update matchBoots.ts imports and logic to classify width category.

Replace filtering width logic.

Replace scoring with categorical partial scoring.

Add test file.

Verify with several quiz examples.



////////////////////////Brand Diversity and model grouping/////////////////////////////////




1️⃣ Add Helper: getBootFamily.ts

Path: thebootroom/lib/utils/getBootFamily.ts

import { Boot } from "@/types";

/**
 * Extracts the family name from a boot's tags array.
 * The family name is defined as the first tag in the CSV.
 */
export function getBootFamily(boot: Boot): string {
  if (!boot.tags || boot.tags.length === 0) return "Unknown Family";
  const tags = Array.isArray(boot.tags)
    ? boot.tags
    : String(boot.tags).split(",").map(t => t.trim());
  return tags[0] || "Unknown Family";
}

⚙️ 2️⃣ Grouping & Scoring Logic

Path: thebootroom/lib/matching/matchBoots.ts

Add:

import { getBootFamily } from "@/lib/utils/getBootFamily";


Then after scoredBoots.sort(...), insert:

// --- Group boots by family ---
const bootsByFamily = new Map<string, typeof scoredBoots>();

for (const item of scoredBoots) {
  const family = getBootFamily(item.boot);
  if (!bootsByFamily.has(family)) {
    bootsByFamily.set(family, []);
  }
  bootsByFamily.get(family)!.push(item);
}

// --- Aggregate by family ---
const familySummaries = Array.from(bootsByFamily.entries()).map(([family, boots]) => {
  const bestBoot = boots.reduce((a, b) => (a.score > b.score ? a : b));
  const brand = bestBoot.boot.brand;
  const highestFlex = Math.max(...boots.map(b => b.boot.flex));
  const familyScore = bestBoot.score;

  return {
    family,
    brand,
    score: familyScore,
    boots,
    bestBoot,
    highestFlex,
  };
});

// --- Sort families by score ---
familySummaries.sort((a, b) => b.score - a.score);

🧩 3️⃣ Brand Diversity + Top 3 Families

Replace your existing “top 3 boots” selection section:

// --- Select up to 3 families, one per brand ---
const topFamilies: typeof familySummaries = [];
const usedBrands = new Set<string>();

for (const fam of familySummaries) {
  if (topFamilies.length >= 3) break;
  if (usedBrands.has(fam.brand)) continue;
  topFamilies.push(fam);
  usedBrands.add(fam.brand);
}

// --- Final grouped result objects ---
const topBoots: BootSummary[] = topFamilies.map(fam => {
  const b = fam.bestBoot.boot;
  const modelList = fam.boots.map(m => ({
    model: m.boot.model,
    flex: m.boot.flex,
    affiliateUrl: m.boot.affiliateUrl,
    imageUrl: m.boot.imageUrl,
  }));

  return {
    bootId: b.bootId,
    brand: b.brand,
    model: fam.family, // family name for display
    flex: fam.highestFlex,
    bootType: b.bootType,
    imageUrl: b.imageUrl,
    tags: b.tags,
    score: Math.round(fam.score * 100) / 100,
    models: modelList,
  };
});

🧠 4️⃣ Update Return Object

At the bottom of matchBoots():

return {
  boots: topBoots, // now grouped by family
  recommendedMondo,
};

🧮 5️⃣ Update Types

Path: thebootroom/types.ts

Add models to BootSummary:

export interface BootSummary {
  bootId: string;
  brand: string;
  model: string; // family name
  flex: number;
  bootType?: BootType;
  imageUrl?: string;
  tags?: string[];
  score: number;
  models?: {
    model: string;
    flex: number;
    affiliateUrl?: string;
    imageUrl?: string;
  }[];
}

🎨 6️⃣ UI — Family Card Component (Expandable)

Path: thebootroom/components/results/BootResultCard.tsx

This version allows only one card open at a time (expand/collapse).

Add a selectedCard state in the parent (Results page):

const [selectedCard, setSelectedCard] = useState<string | null>(null);


Then pass down:

<BootResultCard
  key={boot.bootId}
  boot={boot}
  isExpanded={selectedCard === boot.bootId}
  onToggle={() => setSelectedCard(selectedCard === boot.bootId ? null : boot.bootId)}
/>

In BootResultCard.tsx:
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function BootResultCard({ boot, isExpanded, onToggle }) {
  return (
    <Card
      onClick={onToggle}
      className={`flex flex-col items-center p-4 rounded-2xl shadow-md cursor-pointer transition ${
        isExpanded ? "ring-2 ring-primary" : "hover:shadow-lg"
      }`}
    >
      <img src={boot.imageUrl} alt={boot.model} className="w-32 h-auto mb-2" />
      <h3 className="text-lg font-semibold text-center">
        {boot.brand} {boot.model} Family
      </h3>
      <p className="text-sm text-muted-foreground">
        Highest Flex: {boot.flex}
      </p>
      <p className="text-sm font-medium mt-1">
        Match Score: {boot.score.toFixed(1)}%
      </p>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-3 overflow-hidden"
          >
            <h4 className="font-medium text-primary mb-1">Models in this Family</h4>
            <ul className="space-y-1 text-sm">
              {boot.models?.map((m, i) => (
                <li key={i}>
                  {m.model} ({m.flex})
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

🛍️ 7️⃣ “Available at” Section (Under Fitting Breakdown)

Path: thebootroom/components/results/FittingBreakdown.tsx

{selectedBoot?.models && selectedBoot.models.length > 0 && (
  <div className="mt-4 border-t pt-3">
    <h4 className="font-semibold mb-2">Available at:</h4>
    <ul className="space-y-1">
      {selectedBoot.models.map((m, i) => (
        <li key={i}>
          {m.affiliateUrl ? (
            <a
              href={m.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {m.model} ({m.flex})
            </a>
          ) : (
            <span>{m.model} ({m.flex})</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)}


This only shows when the selected family card is expanded.

🧪 8️⃣ Debug Logging

Inside matchBoots() after grouping:

console.log("=== FAMILY GROUP DEBUG ===");
for (const fam of familySummaries.slice(0, 5)) {
  console.log(
    `${fam.brand} ${fam.family}: ${fam.boots.length} models | Highest Flex ${fam.highestFlex} | Score ${fam.score.toFixed(1)}`
  );
}
console.log("==========================");

🚀 9️⃣ Deployment Order

Add /lib/utils/getBootFamily.ts

Update /lib/matching/matchBoots.ts (grouping + brand diversity logic)

Update /types.ts with models[] array

Replace results card with expandable BootResultCard

Add “Available at” section under FittingBreakdown

Add parent selectedCard state for one-at-a-time expansion

Test grouping and toggle interactions

Confirm top-3 brand diversity and proper family grouping

🌟 Optional Enhancement (for Cursor bonus)

Add a smooth scroll to the selected family card when expanded:

useEffect(() => {
  if (isExpanded) {
    document.getElementById(boot.bootId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [isExpanded]);


Add id={boot.bootId} to your <Card> for the scroll anchor.
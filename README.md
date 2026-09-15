# SoapRun — Car Washer Management App

A mobile-first web app for a local car washer who services vehicles in housing societies. Manage customers, their vehicles, monthly washing subscriptions, payments, and WhatsApp payment reminders.

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase. Deploys on Vercel.

---

## What it does

- **Customers** — add, edit, search, filter by society, soft-delete (deactivate). One customer can have many vehicles.
- **Vehicles** — each vehicle carries its own type and its own monthly price, entered manually. No hard-coded pricing.
- **Monthly subscriptions** — a payment row is created for every active vehicle each month, with a unique constraint on `(vehicle_id, billing_month)` so duplicates are impossible.
- **Payments** — mark paid (full or partial), choose method, set date. Historical rows keep the price that was in effect at the time, so raising a price never rewrites the past.
- **Pending payments** — a dedicated screen listing everyone who owes money this month, each with a Mark Paid button and a WhatsApp reminder button.
- **WhatsApp reminders** — opens WhatsApp with a pre-filled message via click-to-chat. Nothing is ever sent automatically; the washer taps send.
- **Stop / Resume washing** — stopping a subscription removes the vehicle from the active washing list; resuming brings it back and regenerates the current month's payment row.
- **Reports** — per-month expected, collected, pending, and collection rate, with paid and pending breakdowns.
- **Settings** — business name, WhatsApp number, currency symbol, default payment method, and a fully editable reminder template.

---

## Project structure

```
car-washer-app/
├── src/
│   ├── app/
│   │   ├── (app)/                  # authenticated area (bottom nav layout)
│   │   │   ├── customers/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── vehicles/[vehicleId]/page.tsx   # payment history
│   │   │   │   │   └── page.tsx                        # customer profile
│   │   │   │   ├── new/page.tsx                        # add customer + vehicles
│   │   │   │   └── page.tsx                            # customer list
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── pending/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── error.tsx  loading.tsx  layout.tsx
│   │   ├── login/page.tsx
│   │   ├── error.tsx  not-found.tsx  layout.tsx  page.tsx  globals.css
│   ├── components/                 # UI components
│   ├── lib/
│   │   ├── actions/                # server actions (customers, vehicles, payments, settings)
│   │   ├── supabase/               # browser + server clients
│   │   ├── queries.ts              # all read queries
│   │   ├── types.ts  utils.ts  whatsapp.ts
│   └── middleware.ts               # route protection
├── supabase/
│   ├── migration.sql               # schema, indexes, RLS, triggers, functions
│   └── seed.sql                    # optional demo data
├── public/                         # manifest + PWA icons
├── package.json  tsconfig.json  tailwind.config.ts  next.config.js
└── .env.example
```

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the entire contents of `supabase/migration.sql`, and run it. This creates every table, index, unique constraint, RLS policy, trigger, and function.
3. Go to **Authentication → Users → Add user**. Create the owner account with an email and password, and tick "Auto Confirm User". This is the login for the car washer.
4. Copy that user's UUID.
5. *(Optional)* Open `supabase/seed.sql`, replace `YOUR_OWNER_UUID` with the UUID from step 4, and run it in the SQL Editor. This creates Green Valley Society, two customers, three vehicles, and a mix of paid and pending records so the dashboard has something to show immediately.
6. From **Project Settings → API**, copy the **Project URL** and the **anon public** key.

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Both are safe to expose to the browser — Row Level Security is what protects the data. The service-role key is never used anywhere in this app.

### 3. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and log in with the user created in step 3. For the best sense of the app, open your browser devtools and switch to a phone viewport — it's designed for a 390px screen first.

### 4. Deploy to Vercel

1. Push the project to GitHub.
2. In Vercel, **Add New → Project**, import the repo. The framework preset is detected automatically.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the same values as `.env.local`.
4. Deploy.
5. In Supabase, go to **Authentication → URL Configuration** and add your Vercel domain to the allowed redirect URLs.

### 5. Install on a phone

Open the deployed URL in Chrome or Safari and choose "Add to Home Screen". The manifest and icons are already configured, so it launches standalone with no browser chrome.

---

## How the monthly billing works

This is the part worth understanding before you change anything.

A payment row is the source of truth for one vehicle in one month. It stores its own `amount_due`, copied from the vehicle's price at the moment the row is created. That's what makes price changes safe: if you raise a Sedan from ₹500 to ₹600 in October, September's row still says ₹500 forever.

Rows get created two ways:

- `handle_new_vehicle()` — a trigger that creates the current month's row the instant a vehicle is added, so a new customer appears in the pending list right away.
- `generate_current_month_payments()` — a function called on every dashboard and pending-page load. It inserts a row for every active vehicle that doesn't already have one for the current month.

Both rely on `unique (vehicle_id, billing_month)` with `on conflict do nothing`. The function is safe to call as many times as you like; it will never double-bill anyone. There is no cron job to configure — the first time the washer opens the app in a new month, that month's rows appear.

Stopped and cancelled vehicles are skipped, which is why stopping a subscription genuinely stops the billing rather than just hiding it.

---

## Security

Every table has RLS enabled. The policies are all variations of `auth.uid() = owner_id`, so a logged-in user can only ever read or write their own customers, vehicles, and payments — and `subscriptions` is scoped through its parent vehicle. Server actions additionally filter on `owner_id` as a second layer, so a forged record ID can't reach another account's data.

The anon key is the only Supabase credential in the app. There is no service-role key anywhere in the source, and none is needed.

---

## Verification checklist

Worth walking through once after your first deploy:

1. `npm run build` completes with no TypeScript or ESLint errors
2. Logging in redirects to the dashboard; logging out returns to `/login`
3. Visiting any route while logged out redirects to `/login`
4. Creating a customer with two vehicles works, and both appear on the profile
5. The new vehicles immediately show as PENDING for the current month
6. Mark Paid updates the badge, and the dashboard totals change
7. A partial payment shows PARTIAL rather than PAID
8. The WhatsApp button opens `wa.me` with the template filled in
9. Stop Washing removes the vehicle from the pending list; Resume brings it back
10. Reports for the current month match the dashboard figures
11. Editing a vehicle's price leaves past payment history untouched
12. Everything is comfortable to tap on an actual phone

---

## Scope

This is deliberately an MVP. There is no accounting, GST, invoicing, payroll, inventory, payment gateway, WhatsApp Business API, or AI. Adding any of those would make the app worse at the one thing it's for: letting a car washer collect his money each month in a few taps.

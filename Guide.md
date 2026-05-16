# 🎹 The Piano Bar — Digital Ordering System
## Full Setup Guide

---

## What you received

| File | Purpose |
|---|---|
| `BarOrderingSystem.jsx` | Main React app (customer menu + bartender dashboard) |
| `supabase_schema.sql` | Database schema — run once in Supabase |
| `table_qr_codes.html` | Printable QR codes for every table |

---

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `piano-bar`) and a strong DB password
3. Select the closest region to Ghana (likely `eu-west-2` London or `us-east-1`)
4. Wait ~2 minutes for provisioning

---

## Step 2 — Run the database schema

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase_schema.sql`
3. Click **Run**

This creates:
- `orders` table with realtime enabled
- `staff` table with bcrypt-hashed PINs
- `order_status_history` audit log
- Row Level Security policies
- Two demo staff accounts (both PIN: **1234**)

---

## Step 3 — Scaffold the React app

```bash
npm create vite@latest piano-bar -- --template react
cd piano-bar
npm install
npm install @supabase/supabase-js bcryptjs
```

Replace `src/App.jsx` with `BarOrderingSystem.jsx`.

---

## Step 4 — Add your Supabase credentials

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Find these in Supabase → **Project Settings** → **API**.

> ⚠️ The anon key is safe to expose in the frontend — it is limited by Row Level Security. Never expose your `service_role` key.

---

## Step 5 — Run locally

```bash
npm run dev
```

Open `http://localhost:5173` — orders go to Supabase instantly.

---

## Step 6 — Deploy

### Vercel (recommended, free)
```bash
npm install -g vercel
vercel
# Follow prompts — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as env vars
```

### Netlify
```bash
npm run build
# Drag the `dist/` folder to netlify.com/drop
# Add env vars in Site Settings → Environment
```

Your live URL will be something like `https://piano-bar.vercel.app`.

---

## Step 7 — Generate and print QR codes

1. Open `table_qr_codes.html` in any browser (no server needed)
2. Set your live URL (e.g. `https://piano-bar.vercel.app/order`)
3. Set table range (e.g. 1 to 20)
4. Click **Generate QR codes** → **Print all**
5. Cut and laminate each card, or print on cardstock

Each QR code encodes a URL like:
```
https://piano-bar.vercel.app/order?table=5
```
When a customer scans it, the app opens with **Table 5 pre-filled** automatically.

---

## Step 8 — Add/manage staff PINs

To add a new staff member with their own PIN:

```js
// Run this in Node.js once to get the hash
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('5678', 10)); // replace 5678 with their PIN
```

Then in Supabase SQL Editor:
```sql
INSERT INTO staff (name, role, pin_hash)
VALUES ('Kwame', 'bartender', '<paste hash here>');
```

To deactivate a staff member (blocks login without deleting history):
```sql
UPDATE staff SET active = false WHERE name = 'Kwame';
```

---

## How realtime works

```
Customer submits order
      ↓
Supabase INSERT (orders table)
      ↓
Supabase Realtime broadcasts to subscribers
      ↓
Bartender dashboard receives event via WebSocket
      ↓
New order appears instantly — no refresh needed
```

---

## Architecture overview

```
[Customer phone]        [Bartender phone/tablet]
      |                         |
  React app               React app
      |                         |
      └────── Supabase ─────────┘
              PostgreSQL
              Realtime (WebSockets)
              Row Level Security
```

---

## Customising the menu

Edit the `MENU` array at the top of `BarOrderingSystem.jsx`:

```js
{ id: "c5", name: "My New Drink", price: 60, description: "Description", customizable: true, options: ["Option A", "Option B"] }
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Orders not appearing in real time | Check Supabase Dashboard → Database → Replication — `orders` table must be enabled |
| PIN login fails | Verify the hash was generated with bcryptjs (not bcrypt) — they are compatible but confirm the import |
| `VITE_SUPABASE_URL` not found | Restart `npm run dev` after editing `.env` |
| QR code won't scan | Increase QR size to 240px and ensure good print contrast |
| Table number not auto-filling | Confirm URL uses `?table=5` not `#table=5` |

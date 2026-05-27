# VoxPath — Voice AI Agent Panel

## Deploy to Vercel (5 minutes)

### Step 1 — Run SQL in Supabase
Go to Supabase → SQL Editor → paste contents of `schema.sql` → Run

### Step 2 — Deploy to Vercel
1. Go to vercel.com → New Project
2. Import from GitHub (push this folder to a GitHub repo first)
3. Or use Vercel CLI: `npx vercel --prod`

### Step 3 — Set Environment Variables in Vercel
In Vercel dashboard → Settings → Environment Variables → add:
- `SUPABASE_URL` = `https://cfhygetbxshaxtzcezid.supabase.co`
- `SUPABASE_ANON_KEY` = your anon key

### Step 4 — Set Vapi Webhook
In Vapi Dashboard → Assistants → Siya → Advanced → Server URL:
`https://YOUR-VERCEL-URL.vercel.app/api/webhook`

That's it. Every call Siya makes will now save transcript + recording to Supabase and show in the panel.

## Architecture
- `public/index.html` — Full panel (React-free, loads fast)
- `api/webhook.js` — Receives Vapi end-of-call events → saves to Supabase  
- `api/calls.js` — Panel fetches calls from Supabase through this
- `schema.sql` — Run once in Supabase SQL editor

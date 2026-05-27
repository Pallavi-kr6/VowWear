# ShadiStyle Free Deployment Implementation README

This guide explains how to deploy ShadiStyle so other users can access it online while staying on free tiers as much as possible.

## Recommended Free Stack

| Need | Free service | Why |
| --- | --- | --- |
| Next.js hosting | Vercel Hobby | Native Next.js support, free public URL, automatic Git deployments |
| Database and auth | Supabase Free | Hosted Postgres, authentication, Row Level Security |
| AI recommendations | Groq Free | Free API access subject to Groq rate limits |
| Product search | Google Programmable Search free quota or SerpAPI free trial | Optional; the app has fallback store links when search APIs are unavailable |
| Source hosting | GitHub Free | Required for simple Vercel deploy flow |

Free tiers have limits. If many users start using the app, requests may fail or slow down when Vercel, Supabase, Groq, or search API quotas are reached.

## Project Summary

ShadiStyle is a Next.js app using:

- Next.js App Router
- React 19
- Supabase auth and database
- Groq for AI planning/ranking
- Optional SerpAPI or Google Custom Search for live product search

Important files:

- `package.json` - scripts and dependencies
- `supabase_complete_setup.sql` - complete database schema, indexes, grants, and RLS policies
- `src/lib/supabase/client.ts` - browser Supabase client
- `src/lib/supabase/server.ts` - server Supabase client
- `src/lib/groq/client.ts` - Groq SDK client
- `src/app/api/recommendations/search/route.ts` - AI shopping search endpoint

## Required Accounts

Create free accounts for:

1. GitHub: https://github.com
2. Vercel: https://vercel.com
3. Supabase: https://supabase.com
4. Groq Console: https://console.groq.com

Optional:

1. Google Programmable Search: https://programmablesearchengine.google.com
2. SerpAPI: https://serpapi.com

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` from the example file:

```bash
cp .env.local.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key

# Optional live product search providers
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_CUSTOM_SEARCH_KEY=your_google_custom_search_key
GOOGLE_CUSTOM_SEARCH_ID=your_google_custom_search_engine_id

# Optional Groq model override
GROQ_MODEL=llama-3.1-8b-instant
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase Free Setup

1. Create a new Supabase project.
2. Go to Project Settings > API.
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Go to SQL Editor.
6. Open `supabase_complete_setup.sql` from this repo.
7. Paste the full file into Supabase SQL Editor.
8. Run it once.

This creates:

- `users`
- `user_preferences`
- `outfits`
- `recommendations`
- `saved_outfits`
- `user_style_searches`
- `search_recommendations`
- `user_interactions`
- `outfit_reviews`

It also enables Row Level Security so users can only access their own private records.

## Supabase Auth Redirects

In Supabase, open Authentication > URL Configuration.

For local development:

```text
Site URL: http://localhost:3000
Redirect URL: http://localhost:3000/auth/callback
```

After Vercel deployment, add your Vercel production URL:

```text
Site URL: https://your-vercel-app.vercel.app
Redirect URL: https://your-vercel-app.vercel.app/auth/callback
```

If you later add a custom domain, add that domain here too.

## Groq Free Setup

1. Open https://console.groq.com/keys.
2. Create an API key.
3. Add it as `GROQ_API_KEY`.
4. Keep `GROQ_MODEL=llama-3.1-8b-instant` unless you intentionally choose another free-supported model.

The app uses Groq for:

- turning user outfit descriptions into search plans
- ranking product recommendations

## Optional Free Product Search

The app can run without search provider keys, but `/api/recommendations/search` will return better live products when one provider is configured.

### Option A: Google Programmable Search

Use this if you want a free daily quota.

Environment variables:

```env
GOOGLE_CUSTOM_SEARCH_KEY=your_google_api_key
GOOGLE_CUSTOM_SEARCH_ID=your_search_engine_id
```

Configure the search engine to search the web, or restrict it to shopping sites such as:

- myntra.com
- ajio.com
- nykaafashion.com
- amazon.in

### Option B: SerpAPI

Environment variable:

```env
SERPAPI_API_KEY=your_serpapi_key
```

SerpAPI is useful for Google Shopping results but has a limited free trial/quota. For a fully free long-term setup, Google Programmable Search is usually better.

## Deploy to Vercel Free

1. Push the project to GitHub.
2. Open Vercel.
3. Click Add New > Project.
4. Import the GitHub repository.
5. Vercel should detect Next.js automatically.
6. Use these settings:

```text
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: leave default
```

7. Add environment variables in Vercel Project Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

Optional:

```env
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_CUSTOM_SEARCH_KEY=your_google_custom_search_key
GOOGLE_CUSTOM_SEARCH_ID=your_google_custom_search_engine_id
```

8. Deploy.
9. Copy the Vercel production URL.
10. Update Supabase Authentication > URL Configuration with that URL.
11. Redeploy if you changed `NEXT_PUBLIC_SITE_URL`.

## Production Verification Checklist

After deployment, verify:

1. Home page loads at the Vercel URL.
2. Signup works.
3. Login works.
4. Supabase redirects back to `/auth/callback`.
5. Onboarding saves user preferences.
6. Dashboard loads after login.
7. Wishlist saves and removes items.
8. AI recommendation search works with Groq.
9. Product search returns live results or fallback store links.
10. `/api/health` returns a Supabase connection response.

Health check URL:

```text
https://your-vercel-app.vercel.app/api/health
```

## Keeping It Free

Use these practices to avoid unexpected costs:

- Keep Vercel on the Hobby plan.
- Keep Supabase on the Free plan.
- Keep Groq usage within free rate limits.
- Use Google Programmable Search free quota before paid search APIs.
- Do not add paid Supabase add-ons.
- Do not enable Vercel paid analytics or team features unless you accept charges.
- Watch usage dashboards weekly if real users are testing the app.

## Current Limitations on Free Services

- Supabase free projects can pause after inactivity.
- Groq free limits can throttle AI requests.
- Vercel Hobby has execution and bandwidth limits.
- Google/SerpAPI search quotas are limited.
- Email auth deliverability may be limited on default Supabase email settings.

For early testing and demos, this stack is enough. For production with many users, expect to upgrade at least Supabase and possibly search/AI providers.

## Troubleshooting

### Missing Supabase credentials

Check these variables in both `.env.local` and Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Login redirects to the wrong place

Check:

```env
NEXT_PUBLIC_SITE_URL
```

Then update Supabase Authentication > URL Configuration.

### AI search fails

Check:

```env
GROQ_API_KEY
GROQ_MODEL
```

Also confirm your Groq account has available free quota.

### Product search fails

Configure either:

```env
SERPAPI_API_KEY
```

or:

```env
GOOGLE_CUSTOM_SEARCH_KEY
GOOGLE_CUSTOM_SEARCH_ID
```

If no search provider is configured or quota is exhausted, the app can still return fallback shopping links.

### Database insert or select errors

Run `supabase_complete_setup.sql` again in the Supabase SQL Editor. The script uses `IF NOT EXISTS` and drops/recreates policies, so it is safe for setup repair.

## Deployment Architecture

```text
Users
  -> Vercel Hosted Next.js App
    -> Supabase Auth
    -> Supabase Postgres with RLS
    -> Groq API for AI planning/ranking
    -> Optional Google Custom Search or SerpAPI for product results
```


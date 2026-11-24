# Phoniquest

Update 1

A music discovery app where users can find random tracks by genre and year filters, listen to 30-second previews, and like or dislike them. Liked tracks are saved to the user's library.

Built with Next.js 13 (App Router), Prisma, PostgreSQL, Firebase Auth, and the Deezer API.

## Prerequisites

- Node.js (see `.nvmrc` for version)
- Docker (for local PostgreSQL)
- Google Chrome (used by the Juno scraper via Puppeteer)

## Environment Variables

Create a `.env` file in the project root:

```
POSTGRES_URL=postgresql://postgres@localhost:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres@localhost:5432/postgres

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

CRON_SECRET=local-dev-cron-secret

NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
NEXT_PUBLIC_SPOTIFY_SECRET=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the local database (one command)

Starts Colima, runs PostgreSQL in Docker, pushes the Prisma schema, seeds the database and opens Prisma Studio:

```bash
npm run setup:local
```

The database container runs in the background — use `docker ps` to see it and `docker stop <id>` when done. Data is lost when the container is stopped.

### Or do it step by step

Start the database in a separate terminal:

```bash
colima start
npm run runlocaldb
```

Push the schema (must be done every time the Docker container is restarted):

```bash
npx prisma db push
```

Seed the database (~500 tracks per genre from the scraped data in `scraping_tracks/`):

```bash
npx prisma db seed
```

```bash
npx prisma studio
```

### Reset the database (migrate + seed in one step)

To wipe the local database, re-run all migrations, and re-seed:

```bash
npx prisma migrate reset
```

### Create a new migration

After changing `prisma/schema.prisma`, generate and apply a migration:

```bash
npx prisma migrate dev --name describe-the-change
```

The seed reads from three data sources:
- `scraping_tracks/searchedTracks/deezerFrom7Digital/found/` (7digital tracks matched on Deezer)
- `scraping_tracks/searchedTracks/deezer/found/` (Juno tracks matched on Deezer)
- `scraping_tracks/searchedTracks/spotify/found/` (tracks matched on Spotify)

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing Stripe Subscription Locally

### 1. Install the Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

### 2. Add Stripe env vars to `.env`

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

Get these from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (use test mode). The price ID comes from Product catalog > your product's recurring price.

### 3. Start the webhook listener

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_failed
```

This prints a `whsec_...` signing secret — use it as `STRIPE_WEBHOOK_SECRET`.

### 4. Start the dev server

```bash
npm run dev
```

### 5. Trigger a checkout

Open the browser console on any page where you're logged in and run:

```js
fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({userId: 'nWDEiOWsMVQ7qOFVLzrZvGrEqdN2'})
}).then(r => r.json()).then(data => window.location.href = data.url)
```

Use test card `4242 4242 4242 4242` with any future expiry and any CVC.

After checkout, you'll be redirected to `/subscription/success` which polls until your user is updated to PRO, then redirects to `/explore`.

### 6. Verify

Check the `stripe listen` terminal for `<-- [200]` confirming the webhook was received. You can also check the user's `subscriptionTier` in Prisma Studio (`npx prisma studio`).

## Testing Spotify OAuth

The Spotify OAuth flow lets users connect their Spotify account for playlist export (Pro feature).

### Redirect URIs

The following redirect URIs are registered in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

- Local: `http://127.0.0.1:3000/spotify/callback`
- Dev: `https://track-preview.vercel.app/spotify/callback`
- Prod: `https://www.phoniquest.com/spotify/callback`

### Trigger the flow locally

With the dev server running, use curl to get the authorize URL:

```bash
curl -s -X POST http://127.0.0.1:3000/api/spotify/authorize \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_FIREBASE_UID"}' | jq .url
```

Open the returned URL in your browser. After approving on Spotify, you'll be redirected back to `127.0.0.1:3000/spotify/callback` which exchanges the code and stores the tokens.

### Trigger the flow on dev/prod

Open the browser console on any page where you're logged in and run:

```js
fetch('/api/spotify/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'YOUR_FIREBASE_UID' })
}).then(r => r.json()).then(d => window.location.href = d.url)
```

This redirects to Spotify for authorization, then back to `/spotify/callback` which exchanges the code for tokens and stores them on the user record.

### Verify

Check the user's `spotifyAccessToken`, `spotifyRefreshToken`, and `spotifyTokenExpiresAt` fields in Prisma Studio (`npx prisma studio`).

## How It Works

### Track Data Pipeline

Track data comes from three sources that complement each other:

1. **Vercel Deezer cron** (daily, automatic) — lightweight sweep of Deezer charts and genre searches
2. **Local Deezer deep crawl** (weekly, automatic via launchd) — walks artist graphs to build volume
3. **Local Juno scrape** (weekly, runs as part of the same launchd job) — scrapes new vinyl releases from Juno and matches them on Deezer/Spotify

All three insert tracks into the same production database. They overlap somewhat but each finds tracks the others wouldn't.

The scraped data and crawl state lives in `scraping_tracks/` (gitignored).

### 1. Vercel Deezer Cron (Daily)

Route: `/api/cron/syncDeezer` — runs daily at 3am UTC (configured in `vercel.json`).

- Fetches the top 100 Deezer chart tracks
- Rotates through 20 of the app's 89 genres per day, fetching genre charts and search results
- Covers all genres over several days
- Quick and lightweight — runs within Vercel function time limits
- Sends a Discord notification on success or failure

### 2. Local Deezer Deep Crawl (Weekly)

Script: `scraping_tracks/scrapeDeezer.js` — runs as part of `weeklySync.js`.

- Maintains a queue of Deezer artist IDs (persisted in `scraping_tracks/deezerCrawl/`)
- Each run: re-checks existing artists for new albums, then discovers 50 new artists from the queue
- For each artist, scrapes all albums and tracks with preview URLs
- Adds related artists to the queue, so the graph grows over time
- Takes ~10 minutes per run
- Cannot run on Vercel because it relies on persistent state files on disk and exceeds function time limits

### 3. Local Juno Scrape (Weekly)

Script: `scraping_tracks/weeklySync.js`

- Scrapes new vinyl releases from Juno (a record shop) using Puppeteer with a real Chrome browser
- Juno is behind Cloudflare bot protection, so headless mode doesn't work — a Chrome window will briefly appear
- Uses `puppeteer-extra` with the stealth plugin to bypass bot detection
- Cross-references each scraped track against Deezer to get preview URLs, with Spotify as a fallback
- Deezer match rate is ~50%
- Stores the latest scraped release URLs in `scraping_tracks/latestRelease.json` for incremental scraping
- Cannot run in CI or on Vercel due to the Cloudflare/headless restriction

### Preview URL Resolution

Deezer preview URLs expire after ~30 minutes (HMAC-signed tokens). Instead of serving stale URLs from the database, the app resolves a fresh preview URL at playback time:

1. User clicks play on a track
2. Frontend calls `/api/resolvePreviewUrl` with the track ID
3. The API fetches a fresh URL from Deezer (by track ID or search), with an iTunes fallback
4. The URL is proxied through `/api/proxyAudio` to bypass Deezer's CORS restrictions
5. The audio player receives the proxied stream

### Genre System

The app has 89 genres defined in `data/genres.ts`. The scraped data covers ~80 of these. The Vercel Deezer cron supplements with additional tracks for genres not covered by the scraped data.

## Running the Weekly Sync

The full local sync runs both the Juno scrape and Deezer deep crawl:

```bash
node scraping_tracks/weeklySync.js
```

To skip the Juno scrape and only run the Deezer deep crawl:

```bash
node scraping_tracks/weeklySync.js --skip-juno
```

### Retry failed inserts

If the enrichment completes but the DB insert fails, the enriched tracks are cached. Retry without re-scraping:

```bash
node scraping_tracks/weeklySync.js --retry-insert
```

### Automate with macOS launchd

The sync runs every Monday at 10am via a launchd agent. To install:

```bash
cp scraping_tracks/com.phoniquest.weeklysync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.phoniquest.weeklysync.plist
```

Check if it's loaded:

```bash
launchctl list | grep phoniquest
```

Check logs:

```bash
cat scraping_tracks/weeklysync.log
```

To uninstall:

```bash
launchctl unload ~/Library/LaunchAgents/com.phoniquest.weeklysync.plist
rm ~/Library/LaunchAgents/com.phoniquest.weeklysync.plist
```

**Note:** Your Mac must be awake and logged in at the scheduled time. If it's asleep, launchd will run it the next time you're logged in.

**Note:** The launchd plist uses absolute paths to Node and the project directory. If you move the project or update Node via nvm, update the plist accordingly.

### Discord Notifications

Both the Vercel cron and the local weekly sync send Discord notifications on success and failure. The Vercel cron reads `DISCORD_WEBHOOK_URL` from the Vercel environment. The local sync reads it from `.env.scraping`.

### Environment for local scraping

The local sync scripts read from `.env.scraping` (gitignored). It needs:

```
POSTGRES_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=...
NEXT_PUBLIC_SPOTIFY_SECRET=...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## Deployment

Deployed on Vercel via GitHub Actions CI. The pipeline runs on every push and PR to `main` and `develop`.

### CI checks (all pushes and PRs)

Every push and pull request runs: type check, lint, Prisma schema validation, and tests. PRs also get a bundle size report in the GitHub summary.

### Deploy to dev (preview)

1. Create a branch off `develop` and make your changes
2. Open a PR targeting `develop` — CI checks run but nothing is deployed
3. Merge the PR into `develop`
4. On push to `develop`, CI builds and deploys a **Vercel preview** deployment at https://track-preview.vercel.app/

The preview deployment uses **dev Firebase credentials** (secrets suffixed `_DEV`).

### Deploy to production

1. Open a PR from `develop` → `main`
2. CI checks run on the PR
3. Merge the PR into `main`
4. On push to `main`, CI builds with `--prod` and deploys to **Vercel production**
5. After a successful deploy, CI automatically merges `main` back into `develop` to keep it up to date

The production deployment uses **prod Firebase credentials** (secrets suffixed `_PROD`).

### Environment variables

CI sets shared env vars (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `DISCORD_WEBHOOK_URL`, `CRON_SECRET`) on both Vercel preview and production targets during the deploy step. Firebase and SMTP secrets are injected at build time and switch between dev/prod based on the branch.

All secrets are stored in the GitHub repo's **Settings → Secrets and variables → Actions**.

### Cron jobs

Two Vercel cron jobs run daily (configured in `vercel.json`):

- `/api/cron/syncDeezer` — 3am UTC (Deezer chart sync)
- `/api/cron/cleanupAnonymous` — 4am UTC (anonymous user cleanup)

## Key Files

| File | Description |
|---|---|
| `prisma/schema.prisma` | Database schema (Track, User, Review, Comment) |
| `prisma/seed.js` | Seeds DB from scraped data (~500 tracks per genre) |
| `data/genres.ts` | List of 89 app genres |
| `data/deezerGenreMap.ts` | Maps between Deezer and app genre names |
| `src/app/api/resolvePreviewUrl/route.ts` | Resolves fresh preview URLs at playback time |
| `src/app/api/proxyAudio/route.ts` | Proxies audio to bypass Deezer CORS |
| `src/app/api/cron/syncDeezer/route.ts` | Vercel cron job for Deezer chart sync |
| `src/app/api/getTracks/route.ts` | Main track query API (genre/year filters) |
| `scraping_tracks/weeklySync.js` | Weekly local sync script (Juno scrape + Deezer search) |
| `scraping_tracks/latestRelease.json` | Bookmark for incremental Juno scraping |
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/app/api/stripe/create-checkout-session/route.ts` | Creates Stripe Checkout session |
| `src/app/api/stripe/webhook/route.ts` | Handles Stripe webhook events |
| `src/app/api/stripe/create-portal-session/route.ts` | Creates Stripe Customer Portal session |
| `src/hooks/useSubscription.ts` | Client-side Pro subscription check |
| `src/lib/requireProSubscription.ts` | Server-side Pro subscription guard |
| `src/app/api/spotify/authorize/route.ts` | Generates Spotify OAuth authorize URL |
| `src/app/api/spotify/callback/route.ts` | Exchanges Spotify auth code for tokens |
| `src/app/spotify/callback/page.tsx` | Client-side Spotify OAuth redirect handler |
| `prisma/grandfather-pro.js` | One-time script to set existing users to PRO |

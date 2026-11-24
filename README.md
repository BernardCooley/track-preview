# Phoniquest

version: 0.1.0

A music discovery app where users can find random tracks by genre and year filters, listen to 30-second previews, and like or dislike them. Liked tracks are saved to the user's library.

Built with Next.js (App Router), Prisma, PostgreSQL, Firebase Auth, and the Deezer API.

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

## Quick Start

```bash
npm install
npm run setup:local   # starts DB, pushes schema, seeds, opens Prisma Studio
npm run dev           # http://localhost:3000
```

### Manual database setup

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

The seed reads from three data sources:
- `scraping_tracks/searchedTracks/deezerFrom7Digital/found/` (7digital tracks matched on Deezer)
- `scraping_tracks/searchedTracks/deezer/found/` (Juno tracks matched on Deezer)
- `scraping_tracks/searchedTracks/spotify/found/` (tracks matched on Spotify)

### Database management

Reset the database (migrate + seed in one step):

```bash
npx prisma migrate reset
```

Create a new migration after changing `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe-the-change
```

Open Prisma Studio:

```bash
npx prisma studio
```

## Documentation

- [Testing](docs/testing.md) — Stripe subscriptions, Spotify OAuth, playlist export
- [Data Pipeline](docs/data-pipeline.md) — Track sources, cron jobs, scraping, weekly sync
- [Deployment](docs/deployment.md) — CI/CD, Vercel, environment variables, cron config

## Key Files

| File | Description |
|---|---|
| `prisma/schema.prisma` | Database schema (Track, User, Review) |
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
| `src/app/api/spotify/export-playlist/route.ts` | Creates Spotify playlist from library |
| `src/lib/spotifyUserAuth.ts` | Spotify token refresh helper |
| `src/app/spotify/callback/page.tsx` | Client-side Spotify OAuth redirect handler |
| `prisma/grandfather-pro.js` | One-time script to set existing users to PRO |

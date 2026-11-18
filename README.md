# Phoniquest

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
```

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the local database

In a separate terminal (the container is ephemeral and data is lost when stopped):

```bash
npm run runlocaldb
```

### 3. Push the schema to the database

This must be done every time the Docker container is restarted:

```bash
npx prisma db push
```

### 4. Seed the database

Seeds ~500 tracks per genre from the scraped data in `scraping_tracks/`:

```bash
npx prisma db seed
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

## How It Works

### Track Data Pipeline

Track data comes from scraping vinyl record shops (Juno, 7digital), then cross-referencing each track against Deezer to get 30-second preview URLs, thumbnails, and metadata.

The scraped data lives in `scraping_tracks/` (gitignored) and contains ~2.8 million tracks across 80+ genres.

### Preview URL Resolution

Deezer preview URLs expire after ~30 minutes (HMAC-signed tokens). Instead of serving stale URLs from the database, the app resolves a fresh preview URL at playback time:

1. User clicks play on a track
2. Frontend calls `/api/resolvePreviewUrl` with the track ID
3. The API fetches a fresh URL from Deezer (by track ID or search), with an iTunes fallback
4. The URL is proxied through `/api/proxyAudio` to bypass Deezer's CORS restrictions
5. The audio player receives the proxied stream

### Genre System

The app has 89 genres defined in `data/genres.ts`. The scraped data covers ~80 of these. The Deezer cron job (`/api/cron/syncDeezer`) can supplement with additional tracks for genres not covered by the scraped data.

## Weekly Sync (New Releases)

A local script scrapes new vinyl releases from Juno and matches them on Deezer:

```bash
node scraping_tracks/weeklySync.js
```

This does three things:
1. Scrapes Juno's back catalogue sorted by release date (stops when it hits the last known release)
2. Searches each track on Deezer to get preview URLs and metadata
3. Inserts matched tracks into the database

The script stores the latest scraped release URLs in `scraping_tracks/latestRelease.json` so subsequent runs only pick up new releases.

### Retry failed inserts

If the Deezer search completes but the DB insert fails, the enriched tracks are cached. Retry without re-scraping:

```bash
node scraping_tracks/weeklySync.js --retry-insert
```

### Automate with macOS launchd

To run the sync every Monday at 10am, install the launch agent:

```bash
cp scraping_tracks/com.phoniquest.weeklysync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.phoniquest.weeklysync.plist
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

**Note:** The launchd plist uses absolute paths to Node and the project directory. If you move the project or update Node, update the plist accordingly.

### Important notes about scraping

- Juno is behind Cloudflare bot protection, so the scraper runs Chrome in non-headless mode (a browser window will briefly appear)
- Deezer search finds ~50% of tracks. Spotify no longer provides preview URLs via their API, so it is not a viable fallback
- The iTunes fallback in `resolvePreviewUrl` catches some tracks at playback time that weren't found during the sync
- The scraper uses `puppeteer-extra` with the stealth plugin to help bypass bot detection

## Deployment

Deployed on Vercel. The Deezer cron job runs daily at 3am UTC (configured in `vercel.json`).

For production, set the same environment variables in your Vercel project settings, using your production PostgreSQL connection strings for `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING`.

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

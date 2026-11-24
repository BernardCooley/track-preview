# Data Pipeline

## Track Data Pipeline

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

## Preview URL Resolution

Deezer preview URLs expire after ~30 minutes (HMAC-signed tokens). Instead of serving stale URLs from the database, the app resolves a fresh preview URL at playback time:

1. User clicks play on a track
2. Frontend calls `/api/resolvePreviewUrl` with the track ID
3. The API fetches a fresh URL from Deezer (by track ID or search), with an iTunes fallback
4. The URL is proxied through `/api/proxyAudio` to bypass Deezer's CORS restrictions
5. The audio player receives the proxied stream

## Genre System

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

# Testing

## Stripe Subscription

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

## Spotify OAuth

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

## Spotify Playlist Export

Requires a connected Spotify account (see above) and at least one track in your library (reviewStep 4).

Open the browser console on any page where you're logged in and run:

```js
fetch('/api/spotify/export-playlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'YOUR_FIREBASE_UID' })
}).then(r => r.json()).then(console.log)
```

This returns:

```json
{
  "playlistUrl": "https://open.spotify.com/playlist/...",
  "totalLibraryTracks": 20,
  "matchedTracks": 16
}
```

Open the `playlistUrl` in Spotify to verify the tracks were added. Note: this currently creates a new playlist each time — playlist reuse will be handled in the UI (3.3).

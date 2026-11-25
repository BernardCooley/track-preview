# Stripe Go-Live Checklist

Steps to switch from Stripe test mode to live payments.

## 1. Create live mode products

In the [Stripe Dashboard](https://dashboard.stripe.com), switch to **Live mode** (toggle in the top-right), then:

- Create a new **Product** (e.g. "Phoniquest Pro")
- Add a **Price** (e.g. $2.99/month recurring)
- Copy the live price ID (`price_live_...`)

## 2. Create a live webhook endpoint

Go to **Developers > Webhooks** in live mode:

- Add endpoint: `https://phoniquest.com/api/stripe/webhook`
- Select these events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the **Signing secret** (`whsec_...`)

## 3. Update Vercel environment variables

Replace the test values with live values for the **Production** environment:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` from Stripe Dashboard > Developers > API keys |
| `STRIPE_PRO_PRICE_ID` | `price_live_...` from step 1 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from step 2 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` from Stripe Dashboard > Developers > API keys |

You can set them via CLI:

```sh
npx vercel env add STRIPE_SECRET_KEY production
npx vercel env add STRIPE_PRO_PRICE_ID production
npx vercel env add STRIPE_WEBHOOK_SECRET production
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
```

Or via the Vercel dashboard: **Settings > Environment Variables**.

Keep the test values on the **Preview** environment for testing.

## 4. Update Stripe business details

In the Stripe Dashboard under **Settings > Business > Public details**:

- Set **Business name** to "Phoniquest" (shows in the Customer Portal header)
- Add a **Support email** and **Support URL**
- Upload a logo (shown on checkout and receipts)

## 5. Configure Stripe emails

Under **Settings > Emails** in live mode:

- Enable **Successful payment** receipts
- Enable **Failed payment** notifications
- Review and customise email branding

## 6. Redeploy

```sh
npx vercel --prod
```

Or push to your production branch to trigger a deploy.

## 7. Verify

- Visit the account page and click "Upgrade to Pro"
- Complete checkout with a real card
- Confirm the account page shows Pro / Active with the correct renewal date
- Test cancellation via "Manage subscription" and confirm the grace period message appears
- Check the Stripe Dashboard for the payment and subscription

## Rollback

To revert to test mode, restore the `sk_test_` / `pk_test_` / `price_test_` / `whsec_test_` values in the Production environment variables and redeploy. Existing live subscriptions will remain in Stripe but the app will stop creating new live checkouts.

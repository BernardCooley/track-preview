# Deployment

Deployed on Vercel via GitHub Actions CI. The pipeline runs on every push and PR to `main` and `develop`.

## CI checks (all pushes and PRs)

Every push and pull request runs: type check, lint, Prisma schema validation, and tests. PRs also get a bundle size report in the GitHub summary.

## Deploy to dev (preview)

1. Create a branch off `develop` and make your changes
2. Open a PR targeting `develop` — CI checks run but nothing is deployed
3. Merge the PR into `develop`
4. On push to `develop`, CI builds and deploys a **Vercel preview** deployment at https://track-preview.vercel.app/

The preview deployment uses **dev Firebase credentials** (secrets suffixed `_DEV`).

## Deploy to production

1. Open a PR from `develop` → `main`
2. CI checks run on the PR
3. Merge the PR into `main`
4. On push to `main`, CI builds with `--prod` and deploys to **Vercel production**
5. After a successful deploy, CI automatically merges `main` back into `develop` to keep it up to date

The production deployment uses **prod Firebase credentials** (secrets suffixed `_PROD`).

## Environment variables

CI sets shared env vars (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `DISCORD_WEBHOOK_URL`, `CRON_SECRET`) on both Vercel preview and production targets during the deploy step. Firebase and SMTP secrets are injected at build time and switch between dev/prod based on the branch.

All secrets are stored in the GitHub repo's **Settings → Secrets and variables → Actions**.

## Cron jobs

Two Vercel cron jobs run daily (configured in `vercel.json`):

- `/api/cron/syncDeezer` — 3am UTC (Deezer chart sync)
- `/api/cron/cleanupAnonymous` — 4am UTC (anonymous user cleanup)

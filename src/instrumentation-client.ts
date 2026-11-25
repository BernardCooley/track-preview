import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    integrations: [
        Sentry.replayIntegration(),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
        "Failed to fetch",
        "NetworkError",
        "Load failed",
        /Amplitude Logger/,
    ],
    denyUrls: [
        /amplitude\.com/,
    ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

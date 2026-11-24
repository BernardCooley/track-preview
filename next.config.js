const { withSentryConfig } = require("@sentry/nextjs/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["127.0.0.1"],
    serverExternalPackages: ["firebase-admin"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "e-cdns-images.dzcdn.net",
                port: "",
                pathname: "/images/**",
            },
        ],
    },
};

module.exports = withSentryConfig(nextConfig, {
    org: "phoniquest",
    project: "phoniquest",
    silent: !process.env.CI,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
});

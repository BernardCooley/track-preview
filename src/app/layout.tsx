import "./styles/globals.css";
import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/turbopack/react";
import { Providers } from "./providers";
import Amplitude from "./amplitude";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.phoniquest.com"),
    title: {
        default: "Phoniquest — Random Music Discovery",
        template: "%s | Phoniquest",
    },
    description:
        "Discover music you've never heard before. No algorithms, no rankings — just random tracks picked from 89 genres. Listen to previews, build your library, and find purchase links to support the artists.",
    openGraph: {
        type: "website",
        siteName: "Phoniquest",
        title: "Phoniquest — Random Music Discovery",
        description:
            "No algorithms, no rankings — just random tracks from 89 genres. Listen, like, and build your own music library.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Phoniquest — Random Music Discovery",
        description:
            "No algorithms, no rankings — just random tracks from 89 genres. Listen, like, and build your own music library.",
    },
    alternates: {
        canonical: "/",
    },
    keywords: [
        "music discovery",
        "random music",
        "discover new music",
        "music previews",
        "genre exploration",
        "find new tracks",
        "no algorithm music",
        "music library",
    ],
    robots: {
        index: true,
        follow: true,
    },
    applicationName: "Phoniquest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Phoniquest",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        apple: "/apple-touch-icon.png",
    },
};

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <SerwistProvider swUrl="/serwist/sw.js">
                    <Amplitude />
                    <Providers>{children}</Providers>
                </SerwistProvider>
            </body>
        </html>
    );
}

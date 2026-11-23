import "./styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

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
        images: [
            {
                url: "/logo_background_4x.png",
                width: 1060,
                height: 700,
                alt: "Phoniquest logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Phoniquest — Random Music Discovery",
        description:
            "No algorithms, no rankings — just random tracks from 89 genres. Listen, like, and build your own music library.",
        images: ["/logo_background_4x.png"],
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
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}

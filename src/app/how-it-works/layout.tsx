import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works",
    description:
        "Learn how Phoniquest works: discover random tracks, review your likes, and build a personal music library across 89 genres.",
    alternates: {
        canonical: "/how-it-works",
    },
    openGraph: {
        title: "How It Works — Phoniquest",
        description:
            "Learn how Phoniquest works: discover random tracks, review your likes, and build a personal music library.",
    },
};

export default function HowItWorksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

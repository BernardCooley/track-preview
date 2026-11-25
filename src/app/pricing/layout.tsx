import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing",
    description:
        "Compare Phoniquest Free and Pro plans. See what's included and subscribe to unlock genre alerts, Spotify export, library stats, and more.",
    alternates: {
        canonical: "/pricing",
    },
    openGraph: {
        title: "Pricing — Phoniquest",
        description:
            "Compare Phoniquest Free and Pro plans. Subscribe to unlock the full experience.",
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

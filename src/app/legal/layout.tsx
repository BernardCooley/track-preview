import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy & Terms of Service",
    description:
        "Phoniquest privacy policy and terms of service. Learn how we handle your data and the rules for using the service.",
    alternates: {
        canonical: "/legal",
    },
    openGraph: {
        title: "Privacy & Terms — Phoniquest",
        description:
            "Phoniquest privacy policy and terms of service.",
    },
};

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

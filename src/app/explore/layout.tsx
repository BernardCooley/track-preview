import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore",
    description:
        "Discover random music tracks across 89 genres. Listen to previews, like your favourites, and build your library.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

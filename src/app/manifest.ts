import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Phoniquest",
        short_name: "Phoniquest",
        description:
            "Discover music you've never heard before. No algorithms, no rankings — just random tracks from 89 genres.",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
            {
                src: "/logo_1x.png",
                sizes: "265x175",
                type: "image/png",
            },
        ],
    };
}

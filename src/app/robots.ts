import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/how-it-works", "/pricing", "/legal"],
            disallow: ["/api/", "/explore", "/account", "/settings"],
        },
        sitemap: "https://www.phoniquest.com/sitemap.xml",
    };
}

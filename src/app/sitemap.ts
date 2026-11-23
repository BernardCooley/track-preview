import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://www.phoniquest.com";

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/legal`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}

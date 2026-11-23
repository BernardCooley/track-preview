import HomeClient from "./HomeClient";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Phoniquest",
    url: "https://www.phoniquest.com",
    description:
        "Discover music you've never heard before. No algorithms, no rankings — just random tracks picked from 89 genres.",
    applicationCategory: "MusicApplication",
    operatingSystem: "Web",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
};

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient />
        </>
    );
}

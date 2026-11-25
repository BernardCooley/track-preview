import { Box, Flex, Text } from "@chakra-ui/react";
import BackHeader from "@/components/BackHeader";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import getStripe from "@/lib/stripe";
import { proFeatures } from "@/config/proFeatures";
import PricingClient from "./PricingClient";

const pricingJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Phoniquest",
    url: "https://www.phoniquest.com",
    applicationCategory: "MusicApplication",
    offers: [
        {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "USD",
            description:
                "Discover random tracks across 89 genres, build a personal music library, and find purchase links.",
        },
        {
            "@type": "Offer",
            name: "Pro",
            priceCurrency: "USD",
            description:
                "Everything in Free, plus genre alerts, Spotify export, library stats, and more.",
        },
    ],
};

const freeFeatures = [
    "Discover random tracks across 89 genres",
    "Build a personal music library",
    "Find purchase links for tracks you love",
    "Set genre and year preferences",
];

async function getProPrice() {
    try {
        const priceId = process.env.STRIPE_PRO_PRICE_ID;
        if (!priceId) return null;
        const price = await getStripe().prices.retrieve(priceId);
        if (!price.unit_amount || !price.currency) return null;
        const formatted = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: price.currency,
        }).format(price.unit_amount / 100);
        const interval = price.recurring?.interval ?? "month";
        return { formatted, interval };
    } catch {
        return null;
    }
}

export default async function PricingPage() {
    const proPrice = await getProPrice();

    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
            />
            <BackHeader title="Pricing" />

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
            >
                <Box w="full" maxW="640px">
                    <Box textAlign="center" mb={8}>
                        <Text
                            fontSize="2xl"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            mb={2}
                        >
                            Choose your plan
                        </Text>
                        <Text fontSize="sm" color="brand.textSecondary">
                            Start free, upgrade when you&apos;re ready.
                        </Text>
                    </Box>

                    <Flex direction={["column", "row"]} gap={4}>
                        {/* Free card */}
                        <Flex
                            flex={1}
                            direction="column"
                            bg="brand.cardBg"
                            border="1px solid"
                            borderColor="brand.border"
                            rounded="card"
                            p={[5, 6]}
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                mb={1}
                            >
                                Free
                            </Text>
                            <Text
                                fontSize="2xl"
                                fontWeight="bold"
                                color="brand.textPrimary"
                                mb={5}
                            >
                                $0
                            </Text>

                            <Box
                                h="1px"
                                bg="brand.divider"
                                mb={5}
                            />

                            <Flex direction="column" gap={3} flex={1} mb={6}>
                                {freeFeatures.map((feature) => (
                                    <Flex key={feature} gap={2.5} alignItems="flex-start">
                                        <Flex color="brand.primary" mt="2px" flexShrink={0}>
                                            <CheckCircleIcon style={{ fontSize: "16px" }} />
                                        </Flex>
                                        <Text fontSize="sm" color="brand.textSecondary">
                                            {feature}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>

                            <PricingClient variant="free" />
                        </Flex>

                        {/* Pro card */}
                        <Flex
                            flex={1}
                            direction="column"
                            bg="brand.cardBg"
                            border="1px solid"
                            borderColor="brand.primary"
                            rounded="card"
                            p={[5, 6]}
                            position="relative"
                        >
                            <Flex alignItems="center" gap={2} mb={1}>
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                >
                                    Pro
                                </Text>
                                <Flex
                                    alignItems="center"
                                    bg="brand.primarySubtle"
                                    color="brand.primary"
                                    rounded="full"
                                    px={1.5}
                                    py={0.5}
                                    gap={0.5}
                                >
                                    <StarIcon style={{ fontSize: "10px" }} />
                                    <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                                        PRO
                                    </Text>
                                </Flex>
                            </Flex>
                            <Flex alignItems="baseline" gap={1} mb={5}>
                                {proPrice ? (
                                    <>
                                        <Text
                                            fontSize="2xl"
                                            fontWeight="bold"
                                            color="brand.textPrimary"
                                        >
                                            {proPrice.formatted}
                                        </Text>
                                        <Text fontSize="sm" color="brand.textMuted">
                                            / {proPrice.interval}
                                        </Text>
                                    </>
                                ) : (
                                    <Text
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="brand.textPrimary"
                                    >
                                        Pro
                                    </Text>
                                )}
                            </Flex>

                            <Box
                                h="1px"
                                bg="brand.divider"
                                mb={5}
                            />

                            <Flex direction="column" gap={3} flex={1} mb={6}>
                                <Text fontSize="sm" color="brand.textSecondary" fontWeight="medium">
                                    Everything in Free, plus:
                                </Text>
                                {proFeatures.map((feature) => (
                                    <Flex key={feature.text} gap={2.5} alignItems="flex-start">
                                        <Flex color="brand.primary" mt="2px" flexShrink={0}>
                                            <CheckCircleIcon style={{ fontSize: "16px" }} />
                                        </Flex>
                                        <Text fontSize="sm" color="brand.textSecondary">
                                            {feature.text}
                                        </Text>
                                    </Flex>
                                ))}
                            </Flex>

                            <PricingClient variant="pro" />
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
}

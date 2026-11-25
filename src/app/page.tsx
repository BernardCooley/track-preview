import { Box, Flex, Link, Text, VStack } from "@chakra-ui/react";
import HomeClient from "./HomeClient";
import HomeActions from "./HomeActions";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

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

const features = [
    {
        icon: <HeadphonesIcon style={{ fontSize: "20px" }} />,
        text: "Tracks are picked completely at random — no algorithms deciding what you hear",
    },
    {
        icon: <ThumbUpAltIcon style={{ fontSize: "20px" }} />,
        text: "Like or skip each track. Your taste is the only filter",
    },
    {
        icon: <LibraryMusicIcon style={{ fontSize: "20px" }} />,
        text: "Build a library of tracks you genuinely discovered yourself",
    },
    {
        icon: <ShoppingCartIcon style={{ fontSize: "20px" }} />,
        text: "Find purchase links to support the artists you discover",
    },
];

export default function Home() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient>
                <Flex
                    flex={1}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    w="full"
                    maxW="520px"
                    gap={[10, 24]}
                >
                    <VStack as="header" gap={4}>
                        <Text
                            as="h1"
                            fontSize={["3xl", "4xl", "5xl"]}
                            fontFamily="brand"
                            color="brand.textPrimary"
                            letterSpacing="wider"
                            textAlign="center"
                        >
                            PHONIQUEST
                        </Text>
                        <Text
                            fontSize={["md", "lg"]}
                            color="brand.textSecondary"
                            textAlign="center"
                        >
                            No algorithms. No rankings. Just random music discovery.
                        </Text>
                    </VStack>

                    <VStack as="section" gap={6} w="full" alignItems="center">
                        <Box
                            as="ul"
                            w="full"
                            bg="brand.cardBg"
                            border="1px solid"
                            borderColor="brand.border"
                            rounded="card"
                            p={[5, 6]}
                            animation="fadeIn 0.4s ease-out"
                            css={{
                                "@keyframes fadeIn": {
                                    from: { opacity: 0, transform: "translateY(8px)" },
                                    to: { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                            listStyleType="none"
                        >
                            <VStack gap={4} align="stretch">
                                {features.map((feature, index) => (
                                    <Flex
                                        as="li"
                                        key={index}
                                        alignItems="center"
                                        gap={4}
                                    >
                                        <Flex
                                            w="40px"
                                            h="40px"
                                            minW="40px"
                                            alignItems="center"
                                            justifyContent="center"
                                            rounded="lg"
                                            bg="brand.primarySubtle"
                                            color="brand.primary"
                                            aria-hidden="true"
                                        >
                                            {feature.icon}
                                        </Flex>
                                        <Text
                                            fontSize={["sm", "md"]}
                                            color="brand.textSecondary"
                                            lineHeight="short"
                                        >
                                            {feature.text}
                                        </Text>
                                    </Flex>
                                ))}
                                <HomeActions variant="learn-more" />
                            </VStack>
                        </Box>

                        <HomeActions variant="auth-buttons" />
                    </VStack>
                </Flex>

                <Flex as="footer" gap={3} mt="auto" pb={4} pt={6} userSelect={["none", "auto"]}>
                    <HomeActions variant="footer-links" />
                    <Text fontSize="xs" color="brand.textMuted">·</Text>
                    <Link
                        href="mailto:info@phoniquest.com"
                        fontSize="xs"
                        color="brand.textMuted"
                        _hover={{ color: "brand.textSecondary", textDecoration: "none" }}
                    >
                        Contact
                    </Link>
                </Flex>
            </HomeClient>
        </>
    );
}

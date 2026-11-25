"use client";

import { Box, Button, Center, Flex, Link, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function HomeClient() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                router.push("/explore");
            } else {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, [router]);

    return (
        <>
            {loading && (
                <Center
                    position="fixed"
                    inset={0}
                    zIndex={50}
                    bg="brand.bg"
                    h="100dvh"
                    flexDirection="column"
                    gap={8}
                >
                    <Text
                        fontSize={["3xl", "4xl", "5xl"]}
                        fontFamily="brand"
                        color="brand.textPrimary"
                        letterSpacing="wider"
                    >
                        PHONIQUEST
                    </Text>
                    <BouncingDotsLoader />
                </Center>
            )}

            <Flex
                as="main"
                minH="100dvh"
                direction="column"
                alignItems="center"
                px={[6, 8]}
                style={loading ? { visibility: "hidden" } : undefined}
            >
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
                                <Flex
                                    as="li"
                                    alignItems="center"
                                    gap={4}
                                    cursor="pointer"
                                    userSelect={["none", "auto"]}
                                    onClick={() => router.push("/how-it-works")}
                                    _hover={{ "& p": { color: "brand.textPrimary" } }}
                                    transition="all 0.2s ease"
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
                                        →
                                    </Flex>
                                    <Text
                                        fontSize={["sm", "md"]}
                                        color="brand.primary"
                                        fontWeight="medium"
                                        lineHeight="short"
                                        transition="color 0.2s ease"
                                    >
                                        Learn more
                                    </Text>
                                </Flex>
                            </VStack>
                        </Box>

                        <Flex as="nav" direction="column" gap={5} w="full" maxW="320px" alignItems="center">
                        <Flex gap={3} w="full">
                            <Button
                                flex={1}
                                variant="primary"
                                size="lg"
                                onClick={() => router.push("/loginRegister?login=true")}
                            >
                                Sign in
                            </Button>
                            <Button
                                flex={1}
                                variant="outline"
                                size="lg"
                                onClick={() => router.push("/loginRegister?login=false")}
                            >
                                Register
                            </Button>
                        </Flex>
                    </Flex>
                    </VStack>
                </Flex>

                <Flex as="footer" gap={3} mt="auto" pb={4} pt={6} userSelect={["none", "auto"]}>
                    <Text
                        fontSize="xs"
                        color="brand.textMuted"
                        cursor="pointer"
                        _hover={{ color: "brand.textSecondary" }}
                        onClick={() => router.push("/legal")}
                    >
                        Legal
                    </Text>
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

            </Flex>
        </>
    );
}

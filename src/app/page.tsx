"use client";

import { Box, Button, Center, Dialog, Flex, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import { SignInAnonymously } from "../../firebase/utils";
import { createUser } from "@/bff/bff";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [startingTrial, setStartingTrial] = useState(false);
    const [showTrialDialog, setShowTrialDialog] = useState(false);
    const { user } = useAuthContext();
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

    const isUserLoggedIn = useCallback(async () => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                router.push("/explore");
            } else {
                setLoading(false);
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    if (loading) {
        return (
            <Center h="100dvh" flexDirection="column" gap={8}>
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
        );
    }

    return (
        <Flex
            minH="100dvh"
            direction="column"
            alignItems="center"
            px={[6, 8]}
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
                <VStack gap={4} mt="-46px">
                    <Text
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

                <Box
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
                >
                    <VStack gap={4} align="stretch">
                        {features.map((feature, index) => (
                            <Flex
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
                            alignItems="center"
                            gap={4}
                            cursor="pointer"
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
            </Flex>

            <Flex direction="column" gap={3} w="full" maxW="320px">
                <Button
                    w="full"
                    variant="primary"
                    size="lg"
                    loading={startingTrial}
                    onClick={() => {
                        if (user) {
                            router.push("/explore");
                            return;
                        }
                        setShowTrialDialog(true);
                    }}
                >
                    Get Started
                </Button>
                <Flex gap={3}>
                    <Button
                        flex={1}
                        variant="outline"
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

            <Flex gap={3} mt="auto" pb={4} pt={6}>
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
                <Text
                    as="a"
                    href="mailto:info@phoniquest.com"
                    fontSize="xs"
                    color="brand.textMuted"
                    cursor="pointer"
                    _hover={{ color: "brand.textSecondary" }}
                >
                    Contact
                </Text>
            </Flex>

            <Dialog.Root
                open={showTrialDialog}
                onOpenChange={(details) => {
                    if (!details.open) setShowTrialDialog(false);
                }}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        m={[3, 6]}
                        bg="brand.bg"
                        shadow="2xl"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="modal"
                        overflow="hidden"
                    >
                        <Flex direction="column">
                            <Flex
                                px={[4, 5]}
                                pt={[4, 5]}
                                pb={3}
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                    letterSpacing="-0.01em"
                                >
                                    Try without an account
                                </Text>
                                <Dialog.CloseTrigger
                                    position="relative"
                                    top="auto"
                                    right="auto"
                                    color="brand.textMuted"
                                    _hover={{ color: "brand.textPrimary" }}
                                />
                            </Flex>

                            <Box h="1px" bg="brand.divider" mx={[4, 5]} />

                            <Box px={[4, 5]} py={5}>
                                <Flex direction="column" gap={3}>
                                    <Text color="brand.textSecondary" fontSize="sm">
                                        You'll be able to discover and like tracks straight away as a guest. However:
                                    </Text>
                                    <VStack gap={2} align="stretch" pl={1}>
                                        <Text color="brand.textSecondary" fontSize="sm">
                                            • If you sign out or lose access to this device, your library cannot be recovered
                                        </Text>
                                        <Text color="brand.textSecondary" fontSize="sm">
                                            • Sign up at any time to secure your library to your account
                                        </Text>
                                    </VStack>
                                </Flex>
                            </Box>

                            <Flex
                                gap={3}
                                px={[4, 5]}
                                py={4}
                                justifyContent="flex-end"
                                css={{
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                    borderTop: "1px solid var(--chakra-colors-brand-divider)",
                                }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setShowTrialDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    loading={startingTrial}
                                    onClick={async () => {
                                        setStartingTrial(true);
                                        try {
                                            const result = await SignInAnonymously();
                                            if (result?.user) {
                                                try {
                                                    await createUser({
                                                        userId: result.user.uid,
                                                        isAnonymous: true,
                                                    });
                                                } catch {
                                                    // User already exists in DB
                                                }
                                                router.push("/explore");
                                            }
                                        } catch {
                                            router.push("/loginRegister?login=true");
                                        } finally {
                                            setStartingTrial(false);
                                        }
                                    }}
                                >
                                    Continue as guest
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
}

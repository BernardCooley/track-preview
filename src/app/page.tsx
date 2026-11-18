"use client";

import { Box, Button, Center, Flex, Text, VStack } from "@chakra-ui/react";
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
            h="100dvh"
            direction="column"
            alignItems="center"
            px={[6, 8]}
            pb={16}
        >
            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                justifyContent="center"
                w="full"
                maxW="520px"
                gap={[20, 24]}
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
                    </VStack>
                </Box>
            </Flex>

            <Flex direction="column" gap={3} w="full" maxW="320px">
                <Button
                    w="full"
                    variant="primary"
                    size="lg"
                    loading={startingTrial}
                    onClick={async () => {
                        if (user) {
                            router.push("/explore");
                            return;
                        }
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
                                    // User already exists in DB — that's fine
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
        </Flex>
    );
}

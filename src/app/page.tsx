"use client";

import { Box, Button, Center, Flex, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const { user } = useAuthContext();
    const router = useRouter();

    const features = [
        {
            icon: <HeadphonesIcon style={{ fontSize: "20px" }} />,
            text: "Listen to a random song",
        },
        {
            icon: <ThumbUpAltIcon style={{ fontSize: "20px" }} />,
            text: "Like or dislike each song",
        },
        {
            icon: <SkipNextIcon style={{ fontSize: "20px" }} />,
            text: "Dislikes are gone forever. Likes move to the next step",
        },
        {
            icon: <LibraryMusicIcon style={{ fontSize: "20px" }} />,
            text: "A new track loads after each like or dislike",
        },
        {
            icon: <ShoppingCartIcon style={{ fontSize: "20px" }} />,
            text: "Manage or buy your liked tracks from the library",
        },
    ];

    const isUserLoggedIn = useCallback(async () => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
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
            <Center h="100vh" flexDirection="column" gap={8}>
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
            minH="100vh"
            direction="column"
            alignItems="center"
            justifyContent="center"
            px={[6, 8]}
            py={[8, 12]}
        >
            <VStack gap={[8, 10, 12]} maxW="520px" w="full">
                <VStack gap={3}>
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
                        Discover music you love
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

                <Button
                    w="full"
                    variant="primary"
                    size="lg"
                    onClick={() => {
                        router.push(
                            user
                                ? "/explore"
                                : "/loginRegister?login=true"
                        );
                    }}
                >
                    Get Started
                </Button>
            </VStack>
        </Flex>
    );
}

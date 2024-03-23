"use client";

import {
    Box,
    Button,
    Center,
    ScaleFade,
    Flex,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const { user } = useAuthContext();
    const router = useRouter();
    const listItems = [
        "Listen to a random song",
        "Like or dislike each song",
        "Dislikes are never seen again. Likes are moved to the next step for later review",
        "A new track is loaded after each like or dislike",
        "Manage or buy your liked tracks from the library",
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

    return (
        <>
            {!loading ? (
                <Flex
                    h="full"
                    m={0}
                    px={[4, 8]}
                    direction="column"
                    alignItems="center"
                >
                    <Flex
                        mt={8}
                        mb={4}
                        w={["250px", "350px", "550px"]}
                        alignItems="center"
                        height={["80px", "110px", "140px"]}
                        fontSize={["3xl", "4xl", "5xl"]}
                        fontFamily="brand"
                        backgroundImage={"url(/logo_1x.png)"}
                        backgroundSize={["100% 100%"]}
                        backgroundRepeat="no-repeat"
                    >
                        <Text w="full" textAlign="center">
                            PHONIQUEST
                        </Text>
                    </Flex>
                    <ScaleFade initialScale={0.9} in={!loading}>
                        <Flex
                            direction="column"
                            alignItems="center"
                            gap={6}
                            p={6}
                            h="full"
                            w="full"
                        >
                            <Text fontSize={["2xl", "3xl"]}>
                                Welcome to Phoniquest
                            </Text>
                            <Flex w="full" maxW="500px" pb={10}>
                                <VStack gap={4}>
                                    {listItems.map((item) => (
                                        <Flex
                                            alignItems="center"
                                            key={item}
                                            gap={2}
                                            justifyContent="flex-start"
                                            w="full"
                                        >
                                            <Box
                                                w="30px"
                                                h="15px"
                                                minW="30px"
                                                backgroundImage={
                                                    "url(/logo_1x.png)"
                                                }
                                                backgroundSize="100% 100%"
                                                backgroundRepeat="no-repeat"
                                            ></Box>

                                            <Text
                                                fontSize={["lg", "xl"]}
                                                lineHeight={[8, 10]}
                                                p={0}
                                            >
                                                {item}
                                            </Text>
                                        </Flex>
                                    ))}
                                </VStack>
                            </Flex>
                            <Button
                                onClick={() => {
                                    router.push(
                                        user
                                            ? "/explore"
                                            : "/loginRegister?login=true"
                                    );
                                }}
                                variant="primary"
                            >
                                Get Started
                            </Button>
                        </Flex>
                    </ScaleFade>
                </Flex>
            ) : (
                <Center
                    h="50vh"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    <Flex
                        position="relative"
                        left={1}
                        mt={8}
                        mb={4}
                        w={["250px", "350px", "550px"]}
                        alignItems="center"
                        height={["80px", "110px", "140px"]}
                        fontSize={["3xl", "4xl", "5xl"]}
                        fontFamily="brand"
                        backgroundImage={"url(/logo_1x.png)"}
                        backgroundSize={["100% 100%"]}
                        backgroundRepeat="no-repeat"
                    >
                        <Text w="full" textAlign="center">
                            PHONIQUEST
                        </Text>
                    </Flex>
                    <BouncingDotsLoader />
                </Center>
            )}
        </>
    );
}

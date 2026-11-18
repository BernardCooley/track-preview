"use client";

import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import { useRouter } from "next/navigation";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import TuneIcon from "@mui/icons-material/Tune";

const steps = [
    {
        icon: <LooksOneIcon style={{ fontSize: "24px" }} />,
        title: "Discover",
        description:
            "Browse random tracks matched to your genre and year preferences. Like the ones you enjoy, skip the rest.",
    },
    {
        icon: <LooksTwoIcon style={{ fontSize: "24px" }} />,
        title: "Review",
        description:
            "Liked tracks land here for a second listen. This helps you filter out impulse likes.",
        curatedOnly: true,
    },
    {
        icon: <Looks3Icon style={{ fontSize: "24px" }} />,
        title: "Final check",
        description:
            "One last listen before a track earns a spot in your library. Only your favourites make it through.",
        curatedOnly: true,
    },
    {
        icon: <LibraryMusicIcon style={{ fontSize: "24px" }} />,
        title: "Library",
        description:
            "Your personal collection of tracks that made the cut. Browse, re-listen, and find purchase links.",
    },
];

const HowItWorks = () => {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthenticated(!!user);
        });
        return unsubscribe;
    }, []);

    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            {authenticated === false ? (
                <Box
                    w="full"
                    borderBottom="1px solid"
                    borderBottomColor="brand.divider"
                    bg="brand.bg"
                    position="sticky"
                    top={0}
                    zIndex={100}
                >
                    <Flex
                        maxW={["none", "none", "none", "1000px"]}
                        mx="auto"
                        alignItems="center"
                        px={[3, 4]}
                        py={1}
                    >
                        <IconButton
                            variant="tertiary"
                            onClick={() => router.back()}
                            aria-label="Go back"
                            color="brand.textSecondary"
                        >
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                        <Text
                            fontSize="md"
                            fontFamily="brand"
                            color="brand.textPrimary"
                            letterSpacing="wide"
                        >
                            How it works
                        </Text>
                    </Flex>
                </Box>
            ) : authenticated === true ? (
                <Header />
            ) : null}

                <Flex
                    flex={1}
                    direction="column"
                    alignItems="center"
                    px={[4, 6]}
                    py={[6, 8]}
                >
                    <Box w="full" maxW="520px">
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            mb={6}
                        >
                            How it works
                        </Text>

                        <Flex direction="column" gap={4}>
                            {steps.map((step) => (
                                <Flex
                                    key={step.title}
                                    gap={4}
                                    p={4}
                                    rounded="lg"
                                    bg="brand.cardBg"
                                    border="1px solid"
                                    borderColor="brand.border"
                                    alignItems="flex-start"
                                >
                                    <Flex
                                        color="brand.primary"
                                        mt="2px"
                                        flexShrink={0}
                                    >
                                        {step.icon}
                                    </Flex>
                                    <Flex direction="column" gap={1}>
                                        <Flex alignItems="center" gap={2}>
                                            <Text
                                                fontSize="md"
                                                fontWeight="semibold"
                                                color="brand.textPrimary"
                                            >
                                                {step.title}
                                            </Text>
                                            {step.curatedOnly && (
                                                <Text
                                                    fontSize="xs"
                                                    color="brand.textMuted"
                                                    bg="brand.surfaceHover"
                                                    px={2}
                                                    py={0.5}
                                                    rounded="full"
                                                >
                                                    Curated mode
                                                </Text>
                                            )}
                                        </Flex>
                                        <Text
                                            fontSize="sm"
                                            color="brand.textSecondary"
                                        >
                                            {step.description}
                                        </Text>
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>

                        <Flex
                            mt={6}
                            gap={4}
                            p={4}
                            rounded="lg"
                            bg="brand.cardBg"
                            border="1px solid"
                            borderColor="brand.border"
                            alignItems="flex-start"
                        >
                            <Flex
                                color="brand.primary"
                                mt="2px"
                                flexShrink={0}
                            >
                                <TuneIcon style={{ fontSize: "24px" }} />
                            </Flex>
                            <Flex direction="column" gap={1}>
                                <Text
                                    fontSize="md"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                >
                                    Curated mode
                                </Text>
                                <Text
                                    fontSize="sm"
                                    color="brand.textSecondary"
                                >
                                    Off by default. When enabled, liked tracks go through two extra review steps before reaching your library. Toggle it in the menu. Turning it off moves any in-progress tracks straight to your library.
                                </Text>
                            </Flex>
                        </Flex>
                    </Box>
                </Flex>
            </Flex>
    );
};

export default HowItWorks;

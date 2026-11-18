"use client";

import {
    Box,
    Button,
    Flex,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Library from "@/components/Library";
import MenuDrawer from "@/components/MenuDrawer";
import { getUserProfile } from "@/bff/bff";
import { useTrackContext } from "../../../context/TrackContext";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { GetCurrentUser, SignInAnonymously } from "../../../firebase/utils";
import { createUser } from "@/bff/bff";
import { auth } from "../../../firebase/firebaseInit";
import TrackReview from "@/components/TrackReview";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Link from "next/link";

function ExploreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser, user, updateUserProfile, userProfile, isAnonymous, setIsAnonymous } = useAuthContext();
    const reviewStep = searchParams?.get("reviewStep");
    const pageRef = useRef<HTMLDivElement>(null);
    const { open: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure();

    useEffect(() => {
        if (user?.uid) {
            (async () => {
                let userProf = await getUserProfile({ userId: user.uid });
                if (!userProf && isAnonymous) {
                    await createUser({ userId: user.uid, isAnonymous: true });
                    userProf = await getUserProfile({ userId: user.uid });
                }
                updateUserProfile(userProf);
            })();
        }
    }, [user]);

    const isUserLoggedIn = useCallback(async () => {
        const user = await GetCurrentUser();
        if (user?.uid) {
            updateUser({ email: user.email || "", uid: user.uid });
            setIsAnonymous(user.isAnonymous);
        }
        onAuthStateChanged(auth, async (user) => {
            if (user && user.uid && (user.isAnonymous || user.emailVerified)) {
                updateUser({ email: user.email || "", uid: user.uid });
                setIsAnonymous(user.isAnonymous);
                return router.push(`/explore/?reviewStep=${reviewStep || 1}`);
            } else if (user && user.uid && user.email && !user.emailVerified) {
                return router.push("/loginRegister?login=true&verifyEmail=true");
            } else {
                try {
                    const result = await SignInAnonymously();
                    if (result?.user) {
                        await createUser({
                            userId: result.user.uid,
                            isAnonymous: true,
                        });
                        updateUser({ email: "", uid: result.user.uid });
                        setIsAnonymous(true);
                        return router.push(`/explore/?reviewStep=${reviewStep || 1}`);
                    }
                } catch {
                    return router.push("/loginRegister?login=true");
                }
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    useEffect(() => {
        audioElement.current?.pause();
        updateCurrentlyPlaying(undefined);
    }, [currentStep]);

    useEffect(() => {
        return () => {
            audioElement.current?.pause();
        };
    }, []);

    useEffect(() => {
        const reviewStep = searchParams?.get("reviewStep");
        if (reviewStep) {
            const step = parseInt(reviewStep);
            if (!userProfile?.curatedMode && (step === 2 || step === 3)) {
                router.replace(`/explore?reviewStep=1`);
                return;
            }
            setCurrentStep(step);
        }
    }, [searchParams, userProfile?.curatedMode]);

    useEffect(() => {
        if (currentlyPlaying !== undefined) {
            audioElement.current?.play().catch(() => {});
        } else {
            audioElement.current?.pause();
        }
    }, [currentlyPlaying]);

    const allTabs = [
        { name: "Step 1", label: "Discover", icon: <LooksOneIcon style={{ fontSize: "24px" }} />, step: 1 },
        { name: "Step 2", label: "Review", icon: <LooksTwoIcon style={{ fontSize: "24px" }} />, step: 2 },
        { name: "Step 3", label: "Final", icon: <Looks3Icon style={{ fontSize: "24px" }} />, step: 3 },
        { name: "Step 4", label: "Library", icon: <LibraryMusicIcon style={{ fontSize: "24px" }} />, step: 4 },
    ];

    const tabButtons = userProfile?.curatedMode
        ? allTabs
        : allTabs.filter(t => t.step === 1 || t.step === 4);

    const showAudioPlayer =
        currentStep === 4 &&
        currentlyPlaying !== undefined &&
        currentlyPlaying.length > 0;

    return (
        <Flex direction="column" h="100dvh" ref={pageRef} bg="brand.bg">
            <MenuDrawer isOpen={isMenuOpen} onClose={onMenuClose} />
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
                gap={1}
            >
                <Link href="">
                    <Text
                        userSelect="none"
                        fontSize="md"
                        fontFamily="brand"
                        color="brand.textPrimary"
                        letterSpacing="wide"
                        _hover={{ color: "brand.primary" }}
                        transition="color 0.2s ease"
                        mr={1}
                    >
                        PHONIQUEST
                    </Text>
                </Link>

                <Flex flex={1} justifyContent="center" gap={1}>
                    {tabButtons.map((button) => (
                        <Button
                            key={button.name}
                            data-tab-step={button.step}
                            variant={currentStep === button.step ? "tabSelected" : "tabDeselected"}
                            onClick={() =>
                                router.push(`/explore?reviewStep=${button.step}`)
                            }
                            gap={1}
                            px={[3, 4]}
                            h="44px"
                            minW={0}
                        >
                            {button.icon}
                            <Text
                                display={["none", "inline"]}
                                fontSize="sm"
                            >
                                {button.label}
                            </Text>
                        </Button>
                    ))}
                </Flex>

                {isAnonymous && (
                    <Button
                        variant="outline"
                        size="xs"
                        onClick={() => router.push("/loginRegister")}
                        gap={1}
                        fontSize="xs"
                        color="brand.primary"
                        borderColor="brand.primary"
                    >
                        <PersonAddIcon style={{ fontSize: "14px" }} />
                        <Text display={["none", "inline"]}>Sign up</Text>
                    </Button>
                )}
                <IconButton
                    variant="tertiary"
                    onClick={onMenuOpen}
                    aria-label="Open menu"
                    color="brand.textSecondary"
                    size="sm"
                >
                    <MenuOpenIcon fontSize="small" />
                </IconButton>
            </Flex>
            </Box>

            <Box flex={1} overflow="hidden" position="relative">
            <Box maxW={["none", "none", "none", "1000px"]} mx="auto" h="full">
                {reviewStep &&
                    Number(reviewStep) >= 1 &&
                    Number(reviewStep) <= 3 && (
                        <TrackReview reviewStep={Number(reviewStep)} />
                    )}
                {reviewStep && Number(reviewStep) === 4 && <Library />}
            </Box>
            </Box>

            {showAudioPlayer && (
                <Box
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    zIndex={10}
                    bg="brand.bgSubtle"
                    borderTop="1px solid"
                    borderTopColor="brand.border"
                >
                    <Box p={3} maxW={["none", "none", "none", "1000px"]} mx="auto">
                        <AudioPlayer ref={audioElement} />
                    </Box>
                </Box>
            )}
        </Flex>
    );
}

export default function Explore() {
    return (
        <Suspense>
            <ExploreContent />
        </Suspense>
    );
}

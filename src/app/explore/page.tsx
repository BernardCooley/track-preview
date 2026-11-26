"use client";

import {
    Box,
    Button,
    Center,
    Dialog,
    Flex,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import AudioPlayer from "@/components/AudioPlayer";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Library from "@/components/Library";
import MenuDrawer from "@/components/MenuDrawer";
import { getUserProfile } from "@/bff/bff";
import { toaster } from "@/components/toaster";
import { useTrackContext } from "../../../context/TrackContext";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { GetCurrentUser } from "../../../firebase/utils";
import AuthGuard from "@/components/AuthGuard";
import { auth } from "../../../firebase/firebaseInit";
import ExploreSkeleton from "@/components/skeletons/ExploreSkeleton";
import TrackReview from "@/components/TrackReview";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import NewTracksTab from "@/components/NewTracksTab";
import { isMobile } from "react-device-detect";

function ExploreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentlyPlaying, updateCurrentlyPlaying, playingTrack, setPlayingTrack } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser, user, updateUserProfile, userProfile, profileError, setProfileError } = useAuthContext();
    const reviewStep = searchParams?.get("reviewStep");
    const pageRef = useRef<HTMLDivElement>(null);
    const { open: isMenuOpen, onOpen: onMenuOpenRaw, onClose: onMenuCloseRaw } = useDisclosure();
    const menuOpenRef = useRef(false);
    const { isPro, subscriptionsEnabled, requirePro, upgradeFeature, dismissUpgrade } = useSubscription();
    const [showExitGate, setShowExitGate] = useState(false);
    const showSkeleton = useDelayedLoading(!userProfile);
    const effectiveCuratedMode = userProfile?.curatedMode && isPro;

    const onMenuOpen = useCallback(() => {
        onMenuOpenRaw();
        menuOpenRef.current = true;
        window.history.pushState({ menuDrawer: true }, "");
    }, [onMenuOpenRaw]);

    const onMenuClose = useCallback(() => {
        onMenuCloseRaw();
        if (menuOpenRef.current) {
            menuOpenRef.current = false;
            if (window.history.state?.menuDrawer) {
                window.history.back();
            }
        }
    }, [onMenuCloseRaw]);

    useEffect(() => {
        if (!isMobile) return;

        window.history.pushState(null, "");

        const handlePopState = (e: PopStateEvent) => {
            if (menuOpenRef.current) {
                menuOpenRef.current = false;
                onMenuCloseRaw();
                return;
            }
            e.stopImmediatePropagation();
            window.history.pushState(null, "");
            setShowExitGate(true);
        };
        window.addEventListener("popstate", handlePopState, true);
        return () => window.removeEventListener("popstate", handlePopState, true);
    }, [onMenuCloseRaw]);

    useEffect(() => {
        if (user?.uid) {
            (async () => {
                try {
                    setProfileError(false);
                    const userProf = await getUserProfile({ userId: user.uid });
                    updateUserProfile(userProf);
                } catch {
                    setProfileError(true);
                    toaster.create({
                        title: "Unable to load your profile",
                        description: "Some features may be unavailable. Please try again later.",
                        type: "error",
                        duration: 8000,
                    });
                }
            })();
        }
    }, [user]);

    useEffect(() => {
        (async () => {
            const user = await GetCurrentUser();
            if (user?.uid) {
                updateUser({ email: user.email || "", uid: user.uid });
            }
        })();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.uid && user.emailVerified) {
                updateUser({ email: user.email || "", uid: user.uid });
                const params = new URLSearchParams(searchParams?.toString() || "");
                if (!params.has("reviewStep")) params.set("reviewStep", "1");
                return router.push(`/explore/?${params.toString()}`);
            } else if (user && user.uid && user.email && !user.emailVerified) {
                return router.push("/loginRegister?login=true&verifyEmail=true");
            } else {
                return router.push("/");
            }
        });
        return unsubscribe;
    }, [router]);

    useEffect(() => {
        audioElement.current?.pause();
        updateCurrentlyPlaying(undefined);
        setPlayingTrack(null);
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
            if (!effectiveCuratedMode && (step === 2 || step === 3)) {
                const p = new URLSearchParams(searchParams?.toString() || "");
                p.set("reviewStep", "1");
                router.replace(`/explore?${p.toString()}`);
                return;
            }
            if (step === 5 && !isPro) {
                const p = new URLSearchParams(searchParams?.toString() || "");
                p.set("reviewStep", "1");
                router.replace(`/explore?${p.toString()}`);
                return;
            }
            setCurrentStep(step);
        }
    }, [searchParams, effectiveCuratedMode, isPro]);

    useEffect(() => {
        if (currentlyPlaying !== undefined) {
            audioElement.current?.play().catch(() => {});
        } else {
            audioElement.current?.pause();
        }
    }, [currentlyPlaying]);

    const allTabs = [
        { name: "Step 1", label: "Discover", icon: <LooksOneIcon style={{ fontSize: "24px" }} />, step: 1, pro: false },
        { name: "Step 2", label: "Review", icon: <LooksTwoIcon style={{ fontSize: "24px" }} />, step: 2, pro: false },
        { name: "Step 3", label: "Final", icon: <Looks3Icon style={{ fontSize: "24px" }} />, step: 3, pro: false },
        { name: "Step 4", label: "Library", icon: <LibraryMusicIcon style={{ fontSize: "24px" }} />, step: 4, pro: false },
        { name: "New", label: "New", icon: <FiberNewIcon style={{ fontSize: "24px" }} />, step: 5, pro: true },
    ];

    const tabButtons = effectiveCuratedMode
        ? allTabs
        : allTabs.filter(t => t.step === 1 || t.step === 4 || t.step === 5);

    const showAudioPlayer =
        currentStep === 4 &&
        (playingTrack !== null ||
            (currentlyPlaying !== undefined && currentlyPlaying.length > 0));

    if (!userProfile) {
        return showSkeleton ? <ExploreSkeleton /> : null;
    }

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
                <Flex alignItems="center" gap={2}>
                    <Link href="">
                        <Text
                            userSelect="none"
                            fontSize="md"
                            fontFamily="brand"
                            color="brand.textPrimary"
                            letterSpacing="wide"
                            _hover={{ color: "brand.primary" }}
                            transition="color 0.2s ease"
                        >
                            PHONIQUEST
                        </Text>
                    </Link>
                    {subscriptionsEnabled && isPro && (
                        <Flex
                            display={["none", "flex"]}
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
                    )}
                </Flex>

                <Flex flex={1} justifyContent="center" gap={1}>
                    {tabButtons.map((button) => (
                        <Button
                            key={button.name}
                            data-tab-step={button.step}
                            variant={currentStep === button.step ? "tabSelected" : "tabDeselected"}
                            onClick={() => {
                                if (button.pro && !isPro) {
                                    requirePro("New Tracks");
                                    return;
                                }
                                const p = new URLSearchParams(searchParams?.toString() || "");
                                p.set("reviewStep", String(button.step));
                                if (button.step !== 4 && button.step !== 5) {
                                    p.delete("genres");
                                    p.delete("sort");
                                    p.delete("sortDir");
                                    p.delete("release");
                                }
                                router.push(`/explore?${p.toString()}`);
                            }}
                            gap={1}
                            px={[2, 4]}
                            h="44px"
                            minW={0}
                        >
                            <Box position="relative" display="inline-flex">
                                {button.icon}
                                {button.pro && !isPro && (
                                    <Box
                                        position="absolute"
                                        top="-6px"
                                        right="-4px"
                                        color="brand.primary"
                                    >
                                        <StarIcon style={{ fontSize: "10px" }} />
                                    </Box>
                                )}
                            </Box>
                            <Text
                                display={["none", "inline"]}
                                fontSize="sm"
                            >
                                {button.label}
                            </Text>
                        </Button>
                    ))}
                </Flex>

                {subscriptionsEnabled && !isPro && (
                    <Flex
                        as="button"
                        onClick={() => requirePro("Upgrade")}
                        alignItems="center"
                        bg="brand.primarySubtle"
                        color="brand.primary"
                        rounded="full"
                        px={2}
                        py={0.5}
                        gap={1}
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                        transition="opacity 0.2s ease"
                    >
                        <StarIcon style={{ fontSize: "10px" }} />
                        <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                            UPGRADE
                        </Text>
                    </Flex>
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

            {profileError && (
                <Box
                    bg="red.900"
                    color="red.200"
                    px={4}
                    py={3}
                    textAlign="center"
                    fontSize="sm"
                >
                    Unable to load your profile. Some features may be unavailable.{" "}
                    <Button
                        variant="plain"
                        size="xs"
                        color="red.200"
                        textDecoration="underline"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </Box>
            )}

            <Box flex={1} overflow="hidden" position="relative">
            <Box maxW={["none", "none", "none", "1000px"]} mx="auto" h="full">
                {reviewStep &&
                    Number(reviewStep) >= 1 &&
                    Number(reviewStep) <= 3 && (
                        <TrackReview reviewStep={Number(reviewStep)} />
                    )}
                {reviewStep && Number(reviewStep) === 4 && <Library />}
                {reviewStep && Number(reviewStep) === 5 && <NewTracksTab />}
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
            <UpgradePrompt featureName={upgradeFeature} onClose={dismissUpgrade} />

            <Dialog.Root
                open={showExitGate}
                onOpenChange={(details) => { if (!details.open) setShowExitGate(false); }}
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
                                    Leave Phoniquest?
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
                                <Text color="brand.textSecondary" fontSize="sm">
                                    Are you sure you want to exit?
                                </Text>
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
                                    onClick={() => setShowExitGate(false)}
                                >
                                    Stay
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => window.close()}
                                >
                                    Exit
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
}

export default function Explore() {
    return (
        <AuthGuard>
            <Suspense>
                <ExploreContent />
            </Suspense>
        </AuthGuard>
    );
}

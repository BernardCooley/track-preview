"use client";

import { Suspense, useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Text,
    VStack,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import { getUserProfile } from "@/bff/bff";
import { useAuthContext } from "../../../Contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import BackHeader from "@/components/BackHeader";
import TrackReviewCard from "@/components/TrackReviewCard";
import TrackTransition from "@/components/TrackTransition";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import RecordAnimation from "@/components/RecordAnimation";
import { useNewTrackReview } from "@/hooks/useNewTrackReview";
import { useRouter, useSearchParams } from "next/navigation";
import NotificationsIcon from "@mui/icons-material/Notifications";

function NewTracksContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromEmail = searchParams?.get("from") === "email";
    const { user, updateUser, updateUserProfile } = useAuthContext();
    const [profileLoaded, setProfileLoaded] = useState(false);

    const {
        tracks,
        currentTrack,
        setCurrentTrack,
        noTracks,
        loading,
        previewLoading,
        resolvedPreviewUrl,
        likeOrDislike,
        userProfile,
        isAnonymous,
    } = useNewTrackReview(fromEmail);

    const [animate, setAnimate] = useState<"like" | "dislike" | null>(null);
    const [animationImage, setAnimationImage] = useState("");
    const [animationStart, setAnimationStart] = useState<{ x: number; y: number } | null>(null);
    const [thumbnailRect, setThumbnailRect] = useState<DOMRect | null>(null);
    const [swipeTint, setSwipeTint] = useState<"like" | "dislike" | null>(null);
    const [playOnLoad, setPlayOnLoad] = useState(false);
    const animationDuration = 0.9;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser?.uid) {
                updateUser({ email: firebaseUser.email || "", uid: firebaseUser.uid });
                const profile = await getUserProfile({ userId: firebaseUser.uid });
                if (profile) {
                    updateUserProfile(profile);
                }
                setProfileLoaded(true);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (animate) {
            setTimeout(() => {
                setAnimate(null);
                setSwipeTint(null);
            }, 250 + animationDuration * 1000 + (animationDuration * 1000) / 2);
        }
    }, [animate]);

    if (!profileLoaded) {
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

    const emailsEnabled = userProfile?.genreEmailsEnabled ?? false;
    const frequencyLabel = fromEmail && emailsEnabled
        ? (userProfile?.genreAlertFrequency || "WEEKLY").toLowerCase()
        : "daily";
    const genreCount = userProfile?.genreAlerts?.length || 0;

    return (
        <Flex direction="column" h="100dvh" bg="brand.bg">
            {animate && (
                <RecordAnimation
                    animate={animate}
                    reviewStep={1}
                    animationDuration={animationDuration}
                    image={animationImage}
                    curatedMode={false}
                    targetStep={null}
                    startPosition={animationStart}
                    thumbnailRect={thumbnailRect}
                />
            )}

            <BackHeader title="New Tracks" href="/explore?reviewStep=1" />

            {genreCount > 0 && (
                <Box
                    px={[4, 6]}
                    py={3}
                    borderBottom="1px solid"
                    borderBottomColor="brand.divider"
                >
                    <Flex
                        maxW={["none", "none", "none", "1000px"]}
                        mx="auto"
                        alignItems="center"
                        gap={2}
                    >
                        <NotificationsIcon style={{ fontSize: "16px", color: "var(--chakra-colors-brand-primary)" }} />
                        <Text fontSize="sm" color="brand.textSecondary">
                            Showing new tracks from the past {frequencyLabel === "daily" ? "24 hours" : frequencyLabel === "weekly" ? "week" : "month"} in {genreCount} genre{genreCount !== 1 ? "s" : ""} you follow
                        </Text>
                    </Flex>
                </Box>
            )}

            <Box flex={1} overflow="hidden" position="relative">
                <Box maxW={["none", "none", "none", "1000px"]} mx="auto" h="full">
                    {swipeTint && (
                        <Box
                            position="absolute"
                            inset={0}
                            pointerEvents="none"
                            zIndex={0}
                            bg={swipeTint === "like"
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(239, 68, 68, 0.12)"
                            }
                        />
                    )}

                    {loading && !animate && !currentTrack && (
                        <Center position="absolute" inset={0} zIndex={150}>
                            <TrackTransition />
                        </Center>
                    )}

                    {noTracks && !loading && (
                        <Center flex={1} px={6} pt={24}>
                            <VStack gap={5} maxW="360px">
                                <VStack gap={2}>
                                    <Text
                                        textAlign="center"
                                        color="brand.textPrimary"
                                        fontSize="md"
                                        fontWeight="semibold"
                                    >
                                        {genreCount === 0 ? "No genre alerts set up" : "No new tracks"}
                                    </Text>
                                    <Text
                                        textAlign="center"
                                        color="brand.textSecondary"
                                        fontSize="sm"
                                    >
                                        {genreCount === 0
                                            ? "Set up genre alerts in Settings to get notified when new tracks are added."
                                            : "There are no new unreviewed tracks in your subscribed genres right now. Check back later!"}
                                    </Text>
                                </VStack>
                                <VStack gap={2} w="full">
                                    {genreCount === 0 && (
                                        <Button
                                            variant="primary"
                                            w="full"
                                            onClick={() => router.push("/settings")}
                                        >
                                            Go to Settings
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        w="full"
                                        onClick={() => router.push("/explore?reviewStep=1")}
                                    >
                                        Explore all tracks
                                    </Button>
                                </VStack>
                            </VStack>
                        </Center>
                    )}

                    {(previewLoading || loading) && !animate && currentTrack && (
                        <Flex flex={1} h="full">
                            <TrackTransition />
                        </Flex>
                    )}

                    <Flex
                        direction="column"
                        flex={1}
                        h="full"
                        display={!previewLoading && !loading && !animate ? "flex" : "none"}
                    >
                        {currentTrack && !previewLoading && !loading && (
                            <TrackReviewCard
                                swipeMode={userProfile?.swipeMode ?? true}
                                curatedMode={false}
                                noTracks={noTracks}
                                loading={loading}
                                reviewStep={1}
                                toggleTracklist={() => {}}
                                isShowingTracklist={false}
                                autoplayLoading={false}
                                onAutoPlayToggle={() => {}}
                                preferredAutoPlay={userProfile?.autoplay || false}
                                trackList={tracks}
                                setCurrentTrack={setCurrentTrack}
                                isOpen={true}
                                autoplay={userProfile?.autoplay || playOnLoad}
                                currentTrack={currentTrack}
                                previewUrl={resolvedPreviewUrl}
                                onLikeOrDislike={async (val) => {
                                    setSwipeTint(val ? "like" : "dislike");
                                    const trackInfo = document.querySelector("[data-track-info]");
                                    if (trackInfo) {
                                        const rect = trackInfo.getBoundingClientRect();
                                        setAnimationStart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                                    }
                                    const thumb = document.querySelector("[data-track-thumbnail]");
                                    if (thumb) {
                                        setThumbnailRect(thumb.getBoundingClientRect());
                                    }
                                    setAnimate(val ? "like" : "dislike");
                                    setAnimationImage(currentTrack?.thumbnail || "");
                                    const morphMs = 250;
                                    const animationMs = morphMs + animationDuration * 1000 + (animationDuration * 1000) / 2;
                                    await new Promise((r) => setTimeout(r, animationMs));
                                    await likeOrDislike(val);
                                }}
                                onSendToLibrary={() => {}}
                                onAudioPlay={() => {
                                    setPlayOnLoad(false);
                                }}
                            />
                        )}
                    </Flex>
                </Box>
            </Box>
        </Flex>
    );
}

export default function NewTracks() {
    return (
        <AuthGuard>
            <Suspense>
                <NewTracksContent />
            </Suspense>
        </AuthGuard>
    );
}

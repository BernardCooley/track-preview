import React, { memo, useCallback, useEffect, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { getCurrentYear } from "../../utils";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Text,
    VStack,
    useDisclosure,
} from "@chakra-ui/react";
import TrackCardSkeleton from "./skeletons/TrackCardSkeleton";
import YearModal from "./YearModal";
import GenreModal from "./GenreModal";
import FilterTags from "./FilterTags";
import TrackReviewCard from "./TrackReviewCard";
import { mutateUserProfile, sendToLibrary } from "@/bff/bff";
import { genres } from "../../data/genres";
import { useTrackReview } from "@/hooks/useTrackReview";
import { useTrackContext } from "../../context/TrackContext";
import RecordAnimation from "./RecordAnimation";
import TracklistTable from "./TracklistTable";
import { useRouter } from "next/navigation";

interface Props {
    reviewStep: number;
}

const TrackReview = memo(
    ({ reviewStep }: Props) => {
        const {
            reviewTracks,
            updateReviewTracks,
            recentGenres,
            setRecentGenres,
            user,
            userProfile,
            updateUserProfile,
            currentTrack,
            setCurrentTrack,
            noTracks,
            showYearSelector,
            setShowYearSelector,
            showGenreSelector,
            setShowGenreSelector,
            setIsPlaying,
            loading,
            loadMoreTracks,
            fetchAttempted,
            autoplayLoading,
            setAutoplayLoading,
            onGetTracks,
            likeOrDislike,
            onGenreApply,
            onYearConfirm,
            resolvedPreviewUrl,
            previewLoading,
            profileError,
        } = useTrackReview(reviewStep);

        const { updateChangesMade } = useTrackContext();
        const router = useRouter();

        const userGenres = userProfile?.genres;
        const hasGenreFilter = userGenres && userGenres.length > 0 && !userGenres.some((g: string) => g.toLowerCase() === "all");
        const hasYearFilter = (userProfile?.yearFrom && userProfile.yearFrom !== 1960) || (userProfile?.yearTo && userProfile.yearTo !== getCurrentYear());
        const hasActiveFilters = hasGenreFilter || hasYearFilter;
        const genreLabel = hasGenreFilter
            ? userGenres!.length === 1 ? userGenres![0] : `${userGenres!.length} genre`
            : "all";

        const resetFilters = useCallback(async () => {
            if (user?.uid) {
                const newProfile = await mutateUserProfile({
                    userId: user.uid,
                    genres: ["all"],
                    yearFrom: 1960,
                    yearTo: getCurrentYear(),
                });
                updateUserProfile(newProfile);
            }
        }, [user?.uid, updateUserProfile]);

        const [animationImage, setAnimationImage] = useState<string>("");
        const [animationStart, setAnimationStart] = useState<{ x: number; y: number } | null>(null);
        const [thumbnailRect, setThumbnailRect] = useState<DOMRect | null>(null);
        const [swipeTint, setSwipeTint] = useState<"like" | "dislike" | null>(null);
        const { open: isShowingTracklist, onToggle: toggleTracklist } =
            useDisclosure();
        const animationDuration = 0.9;
        const [animate, setAnimate] = useState<"like" | "dislike" | null>(null);
        const [animationTargetStep, setAnimationTargetStep] = useState<number | null>(null);
        const [playOnLoad, setPlayOnLoad] = useState(false);
        const showTrackSkeleton = useDelayedLoading(loading || previewLoading);

        useEffect(() => {
            if (currentTrack) {
                updateReviewTracks(
                    reviewStep,
                    reviewTracks[reviewStep].tracks,
                    reviewTracks[reviewStep].tracks.indexOf(currentTrack) || 0
                );
            }
        }, [currentTrack]);

        useEffect(() => {
            setAnimate(null);
        }, [reviewStep]);

        useEffect(() => {
            if (animate) {
                setTimeout(() => {
                    setAnimate(null);
                    setSwipeTint(null);
                }, 250 + animationDuration * 1000 + (animationDuration * 1000) / 2);
            }
        }, [animate]);

        return (
            <>
            {animate && (
                <RecordAnimation
                    animate={animate}
                    reviewStep={reviewStep}
                    animationDuration={animationDuration}
                    image={animationImage}
                    curatedMode={userProfile?.curatedMode ?? false}
                    targetStep={animationTargetStep}
                    startPosition={animationStart}
                    thumbnailRect={thumbnailRect}
                />
            )}
            <Flex direction="column" position="relative" h="full" overflow="auto">
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
                {!animate && reviewStep > 1 && reviewStep < 4 && (
                    <TracklistTable
                        noTracks={noTracks}
                        loading={loading}
                        reviewStep={reviewStep}
                        toggleTracklist={toggleTracklist}
                        isShowingTracklist={isShowingTracklist}
                        isOpen={isShowingTracklist}
                        tracklist={reviewTracks}
                        currentlyPlaying={currentTrack}
                        updateCurrentlyPlaying={(track) => {
                            setPlayOnLoad(true);
                            setCurrentTrack(track);
                            toggleTracklist();
                        }}
                    />
                )}
                {reviewStep === 1 && !(noTracks && !loading) && !profileError && (
                    <Box px={[4, 6]} py={3}>
                        {user?.uid && (
                            <FilterTags
                                reviewStep={reviewStep}
                                onYearClick={() =>
                                    setShowYearSelector((prev) => !prev)
                                }
                                onGenreClick={() =>
                                    setShowGenreSelector((prev) => !prev)
                                }
                                genres={userProfile?.genres}
                                yearRange={{
                                    from: userProfile?.yearFrom || 1960,
                                    to: userProfile?.yearTo || getCurrentYear(),
                                }}
                            />
                        )}
                    </Box>
                )}

                {loading && !animate && !currentTrack && showTrackSkeleton && (
                    <TrackCardSkeleton />
                )}

                {fetchAttempted && !noTracks && !loading && loadMoreTracks && (
                    <Center position="absolute" inset={0} zIndex={150} pt={24}>
                        <Button
                            onClick={() => onGetTracks(true)}
                            variant="primary"
                        >
                            Load a new track
                        </Button>
                    </Center>
                )}

                {noTracks && !loading && reviewStep > 1 && (
                    <Center pt={24}>
                        <Badge
                            variant="outline"
                            colorPalette="teal"
                            fontSize={["md", "lg"]}
                            px={4}
                            py={2}
                            rounded="lg"
                        >
                            All done on this step
                        </Badge>
                    </Center>
                )}

                {noTracks && !loading && reviewStep === 1 && (
                    <Center flex={1} px={6}>
                        <VStack gap={5} maxW="360px">
                            <VStack gap={2}>
                                <Text
                                    textAlign="center"
                                    color="brand.textPrimary"
                                    fontSize="md"
                                    fontWeight="semibold"
                                >
                                    No tracks found
                                </Text>
                                <Text
                                    textAlign="center"
                                    color="brand.textSecondary"
                                    fontSize="sm"
                                >
                                    {hasActiveFilters
                                        ? <>We don&apos;t currently have any <Text as="span" fontWeight="bold" color="brand.textPrimary">{genreLabel}</Text> tracks between <Text as="span" fontWeight="bold" color="brand.textPrimary">{userProfile?.yearFrom || 1960}</Text> and <Text as="span" fontWeight="bold" color="brand.textPrimary">{userProfile?.yearTo || getCurrentYear()}</Text>.<br />Try adjusting your filters or try again later.</>
                                        : <>We don&apos;t currently have any tracks matching your filters.<br />Try adjusting them or try again later.</>}
                                </Text>
                            </VStack>
                            {!profileError && (
                                <VStack gap={2} w="full">
                                    <Flex gap={2} w="full">
                                        <Button
                                            variant="subtle"
                                            size="sm"
                                            flex={1}
                                            onClick={() => setShowYearSelector(true)}
                                        >
                                            Change years
                                        </Button>
                                        <Button
                                            variant="subtle"
                                            size="sm"
                                            flex={1}
                                            onClick={() => setShowGenreSelector(true)}
                                        >
                                            Change genre
                                        </Button>
                                    </Flex>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            w="full"
                                            onClick={resetFilters}
                                        >
                                            Reset all filters
                                        </Button>
                                    )}
                                </VStack>
                            )}
                        </VStack>
                    </Center>
                )}

                <GenreModal
                    onCancel={() => setShowGenreSelector(false)}
                    showGenreSelector={showGenreSelector}
                    setShowGenreSelector={setShowGenreSelector}
                    selectedGenres={userProfile?.genres || ["all"]}
                    onApply={onGenreApply}
                    availableGenres={genres}
                    onFavouriteClearClick={() => {
                        setRecentGenres([]);
                    }}
                    recentGenres={recentGenres.filter((gen) => gen !== "all")}
                />
                <YearModal
                    showYearSelector={showYearSelector}
                    setShowYearSelector={setShowYearSelector}
                    yearRange={{
                        from: userProfile?.yearFrom || 1960,
                        to: userProfile?.yearTo || getCurrentYear(),
                    }}
                    onConfirm={(val) => onYearConfirm(val)}
                    onCancel={() => setShowYearSelector(false)}
                />

                {(previewLoading || loading) && !animate && currentTrack && showTrackSkeleton && (
                    <TrackCardSkeleton />
                )}

                <Flex
                    direction="column"
                    flex={1}
                    display={(!previewLoading && !loading) && !animate ? "flex" : "none"}
                >
                    {currentTrack && !previewLoading && !loading && (
                        <TrackReviewCard
                            swipeMode={userProfile?.swipeMode ?? true}
                            curatedMode={userProfile?.curatedMode ?? false}
                            noTracks={noTracks}
                            loading={loading}
                            reviewStep={reviewStep}
                            toggleTracklist={toggleTracklist}
                            isShowingTracklist={isShowingTracklist}

                            autoplayLoading={autoplayLoading}
                            onAutoPlayToggle={async () => {
                                const newProfile = await mutateUserProfile({
                                    userId: user?.uid || "",
                                    autoplay: !userProfile?.autoplay,
                                });
                                updateUserProfile(newProfile);
                            }}
                            preferredAutoPlay={userProfile?.autoplay || false}
                            trackList={reviewTracks[reviewStep].tracks}
                            setCurrentTrack={setCurrentTrack}
                            isOpen={reviewStep === 1 || !isShowingTracklist}
                            autoplay={userProfile?.autoplay || playOnLoad}
                            currentTrack={currentTrack}
                            previewUrl={resolvedPreviewUrl}
                            onLikeOrDislike={async (val) => {
                                setAnimationTargetStep(null);
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
                                setAnimationImage(
                                    currentTrack?.thumbnail || ""
                                );
                                const morphMs = 250;
                                const animationMs = morphMs + animationDuration * 1000 + (animationDuration * 1000) / 2;
                                await new Promise((r) => setTimeout(r, animationMs));
                                await likeOrDislike(val);
                            }}
                            onSendToLibrary={async () => {
                                if (!currentTrack || !user?.uid) return;
                                setAnimationTargetStep(4);
                                setSwipeTint("like");
                                const trackInfo = document.querySelector("[data-track-info]");
                                if (trackInfo) {
                                    const rect = trackInfo.getBoundingClientRect();
                                    setAnimationStart({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                                }
                                const thumb = document.querySelector("[data-track-thumbnail]");
                                if (thumb) {
                                    setThumbnailRect(thumb.getBoundingClientRect());
                                }
                                setAnimate("like");
                                setAnimationImage(currentTrack?.thumbnail || "");
                                const morphMs = 250;
                                const animationMs = morphMs + animationDuration * 1000 + (animationDuration * 1000) / 2;
                                await new Promise((r) => setTimeout(r, animationMs));
                                await sendToLibrary({
                                    trackId: currentTrack.id,
                                    userId: user.uid,
                                });
                                const remaining = reviewTracks[reviewStep].tracks.filter(
                                    (t) => t.id !== currentTrack.id
                                );
                                const currentIndex = reviewTracks[reviewStep].tracks.findIndex(
                                    (t) => t.id === currentTrack.id
                                );
                                const nextIndex = Math.min(currentIndex, remaining.length - 1);
                                updateReviewTracks(reviewStep, remaining, Math.max(nextIndex, 0));
                                updateChangesMade(4, true);
                            }}
                            onAudioPlay={() => {
                                setIsPlaying(true);
                                setPlayOnLoad(false);
                            }}
                        />
                    )}
                </Flex>
            </Flex>
            </>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.reviewStep === nextProps.reviewStep;
    }
);

TrackReview.displayName = "TrackReview";

export default TrackReview;

import React, { memo, useCallback, useEffect, useState } from "react";
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
import Loading from "./Loading";
import YearModal from "./YearModal";
import GenreModal from "./GenreModal";
import FilterTags from "./FilterTags";
import TrackReviewCard from "./TrackReviewCard";
import { mutateUserProfile } from "@/bff/bff";
import { genres } from "../../data/genres";
import { useTrackReview } from "@/hooks/useTrackReview";
import RecordAnimation from "./RecordAnimation";
import TracklistTable from "./TracklistTable";
import TrackTransition from "./TrackTransition";

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
        } = useTrackReview(reviewStep);

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
        const { open: isShowingTracklist, onToggle: toggleTracklist } =
            useDisclosure();
        const animationDuration = 0.9;
        const [animate, setAnimate] = useState<"like" | "dislike" | null>(null);

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
                    startPosition={animationStart}
                    thumbnailRect={thumbnailRect}
                />
            )}
            <Flex direction="column" position="relative" h="full" overflow="auto">
                {loading && !animate && !currentTrack && (
                    <Center position="absolute" inset={0} zIndex={150}>
                        <TrackTransition />
                    </Center>
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

                {reviewStep === 1 && !(noTracks && !loading) && (
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
                                profileLoaded={userProfile ? true : false}
                                genres={userProfile?.genres}
                                yearRange={{
                                    from: userProfile?.yearFrom || 1960,
                                    to: userProfile?.yearTo || getCurrentYear(),
                                }}
                            />
                        )}
                    </Box>
                )}

                {(previewLoading || loading) && !animate && currentTrack && (
                    <Flex flex={1}>
                        <TrackTransition />
                    </Flex>
                )}

                <Flex
                    direction="column"
                    flex={1}
                    display={(!previewLoading && !loading) && !animate ? "flex" : "none"}
                >
                    {currentTrack && !previewLoading && !loading && (
                        <TrackReviewCard
                            noTracks={noTracks}
                            loading={loading}
                            reviewStep={reviewStep}
                            toggleTracklist={toggleTracklist}
                            isShowingTracklist={isShowingTracklist}
                            profileLoaded={userProfile ? true : false}
                            autoplayLoading={autoplayLoading}
                            onAutoPlayToggle={async () => {
                                setAutoplayLoading(true);
                                const newProfile = await mutateUserProfile({
                                    userId: user?.uid || "",
                                    autoplay: !userProfile?.autoplay,
                                });
                                updateUserProfile(newProfile);
                                setAutoplayLoading(false);
                            }}
                            preferredAutoPlay={userProfile?.autoplay || false}
                            trackList={reviewTracks[reviewStep].tracks}
                            setCurrentTrack={setCurrentTrack}
                            isOpen={reviewStep === 1 || !isShowingTracklist}
                            autoplay={userProfile?.autoplay || false}
                            currentTrack={currentTrack}
                            previewUrl={resolvedPreviewUrl}
                            onLikeOrDislike={async (val) => {
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
                            onAudioPlay={() => {
                                setIsPlaying(true);
                            }}
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
                                setCurrentTrack(track);
                                toggleTracklist();
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

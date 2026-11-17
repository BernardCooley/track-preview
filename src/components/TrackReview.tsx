import React, { memo, useEffect, useState } from "react";
import { getCurrentYear } from "../../utils";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Text,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TracklistTable from "./TracklistTable";

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
        } = useTrackReview(reviewStep);

        const [animationImage, setAnimationImage] = useState<string>("");
        const { open: isShowingTracklist, onToggle: toggleTracklist } =
            useDisclosure();
        const [windowWidth, setWindowWidth] = useState(0);
        const animationDuration = 0.7;
        const [animate, setAnimate] = useState<"like" | "dislike" | null>(null);

        useEffect(() => {
            setWindowWidth(window.innerWidth);
            const handleResize = () => setWindowWidth(window.innerWidth);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

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
                }, animationDuration * 1000 + (animationDuration * 1000) / 2);
            }
        }, [animate]);

        return (
            <Box position="relative" h="full" overflow="auto">
                {loading && !animate && (
                    <Center position="absolute" inset={0} zIndex={150} pt={24}>
                        <Loading />
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
                    <Center pt={24} px={6}>
                        <Text
                            textAlign="center"
                            color="brand.textSecondary"
                            fontSize="md"
                        >
                            No tracks found. Please try again with different
                            filters.
                        </Text>
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

                {reviewStep === 1 && (
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

                {animate && (
                    <RecordAnimation
                        animate={animate}
                        leftPosition={(windowWidth / 4) * reviewStep}
                        animationDuration={animationDuration}
                        image={animationImage}
                    />
                )}

                {animate === "dislike" && (
                    <Flex
                        position="absolute"
                        top={300}
                        width="full"
                        justifyContent="center"
                        zIndex={100}
                    >
                        <Box color="brand.dislike" opacity={0.6}>
                            <DeleteOutlineIcon style={{ fontSize: "160px" }} />
                        </Box>
                    </Flex>
                )}

                <Flex
                    transition="opacity 0.4s ease"
                    opacity={animate ? 0 : 1}
                    direction="column"
                >
                    {currentTrack && !animate && (
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
                                await likeOrDislike(val);
                                setAnimate(val ? "like" : "dislike");
                                setAnimationImage(
                                    currentTrack?.thumbnail || ""
                                );
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
            </Box>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.reviewStep === nextProps.reviewStep;
    }
);

TrackReview.displayName = "TrackReview";

export default TrackReview;

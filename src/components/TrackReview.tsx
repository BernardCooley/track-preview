import React from "react";
import { getCurrentYear } from "../../utils";
import { Badge, Box, Button, Center, Flex, Text } from "@chakra-ui/react";
import Loading from "./Loading";
import YearModal from "./YearModal";
import GenreModal from "./GenreModal";
import FilterTags from "./FilterTags";
import TrackReviewCard from "./TrackReviewCard";
import { mutateUserProfile } from "@/bff/bff";
import { genres } from "../../data/genres";
import { useTrackReview } from "@/hooks/useTrackReview";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const {
        recentGenres,
        setRecentGenres,
        user,
        userProfile,
        updateUserProfile,
        currentTrack,
        noTracks,
        showYearSelector,
        setShowYearSelector,
        showGenreSelector,
        setShowGenreSelector,
        listened,
        setListened,
        isPlaying,
        setIsPlaying,
        loading,
        loadMoreTracks,
        fetchAttempted,
        autoplayLoading,
        setAutoplayLoading,
        onGetTracks,
        likeOrDislike,
        onGenreSelect,
        onYearConfirm,
    } = useTrackReview(reviewStep);

    return (
        <Box px={[4, 8]} position="relative">
            {fetchAttempted && !noTracks && !loading && loadMoreTracks && (
                <Center
                    zIndex={150}
                    top="200px"
                    right="50%"
                    transform={`translate(50%, 0)`}
                    position="absolute"
                    px={4}
                >
                    <Button onClick={() => onGetTracks(true)} variant="primary">
                        Load a new track
                    </Button>
                </Center>
            )}
            {noTracks && !loading && reviewStep > 1 && (
                <Center>
                    <Badge
                        zIndex={150}
                        top="200px"
                        position="absolute"
                        variant="outline"
                        colorScheme="teal"
                        fontSize={["24px", "36px"]}
                        px={4}
                    >
                        All done on this step
                    </Badge>
                </Center>
            )}

            {noTracks && !loading && reviewStep === 1 && (
                <Text
                    textAlign="center"
                    mt={20}
                    gap={4}
                    top="100%"
                    transform="translate(50%, 0)"
                    right="50%"
                    p={6}
                    position="absolute"
                >
                    No tracks found. Please try again with different filters.
                </Text>
            )}
            <GenreModal
                onCancel={() => setShowGenreSelector(false)}
                showGenreSelector={showGenreSelector}
                setShowGenreSelector={() => setShowGenreSelector(false)}
                genre={userProfile?.genre || "all"}
                onGenreSelect={onGenreSelect}
                availableGenres={genres}
                onFavouriteClearClick={() => {
                    setRecentGenres([userProfile?.genre || "all"]);
                }}
                recentGenres={recentGenres.filter((gen) => gen !== "all")}
            />
            <YearModal
                showYearSelector={showYearSelector}
                setShowYearSelector={setShowYearSelector}
                yearRange={
                    {
                        from: userProfile?.yearFrom || 1960,
                        to: userProfile?.yearTo || getCurrentYear(),
                    } || { from: 1960, to: getCurrentYear() }
                }
                onConfirm={(val) => onYearConfirm(val)}
                onCancel={() => setShowYearSelector(false)}
            />
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                px={0}
                pt={2}
                gap={2}
                zIndex={200}
                minH="66px"
            >
                {user?.uid && (
                    <FilterTags
                        autoplayLoading={autoplayLoading}
                        onYearClick={() => setShowYearSelector((prev) => !prev)}
                        onGenreClick={() =>
                            setShowGenreSelector((prev) => !prev)
                        }
                        onAutoPlayToggle={async () => {
                            setAutoplayLoading(true);
                            const newProfile = await mutateUserProfile({
                                userId: user.uid,
                                autoplay: !userProfile?.autoplay,
                            });
                            updateUserProfile(newProfile);
                            setAutoplayLoading(false);
                        }}
                        showDates={reviewStep === 1 ? true : false}
                        showGenre={reviewStep === 1 ? true : false}
                        profileLoaded={userProfile ? true : false}
                        genre={userProfile?.genre}
                        yearRange={
                            {
                                from: userProfile?.yearFrom || 1960,
                                to: userProfile?.yearTo || getCurrentYear(),
                            } || { from: 1960, to: getCurrentYear() }
                        }
                        preferredAutoPlay={userProfile?.autoplay || false}
                    />
                )}
            </Flex>
            <Flex direction="column" position="relative">
                {currentTrack && (
                    <TrackReviewCard
                        autoplay={userProfile?.autoplay || false}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        listened={listened}
                        onLikeOrDislike={async (val) =>
                            await likeOrDislike(val)
                        }
                        onAudioPlay={() => {
                            setIsPlaying(true);
                        }}
                        onListenedToggle={(val) => setListened(val)}
                    />
                )}
            </Flex>
        </Box>
    );
};

export default TrackReview;

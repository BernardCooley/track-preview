import React, { memo, useEffect, useState } from "react";
import { getCurrentYear } from "../../utils";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Icon,
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

        const { isOpen: isShowingTracklist, onToggle: toggleTracklist } =
            useDisclosure();
        const [windowWidth, setWindowWidth] = useState(window.innerWidth);

        useEffect(() => {
            const handleResize = () => {
                setWindowWidth(window.innerWidth);
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }, []);

        const animationDuration = 0.6;
        const [animate, setAnimate] = useState<"like" | "dislike" | null>(null);

        useEffect(() => {
            setAnimate(null);
            if (isShowingTracklist) {
                toggleTracklist();
            }
        }, [reviewStep]);

        useEffect(() => {
            if (animate) {
                setTimeout(() => {
                    setAnimate(null);
                }, animationDuration * 1000 + (animationDuration * 1000) / 2);
            }
        }, [animate]);

        return (
            <Box px={[0, 8]} position="relative" height="full">
                {loading && !animate && (
                    <Center
                        zIndex={150}
                        top="200px"
                        right="50%"
                        transform={`translate(50%, 0)`}
                        position="absolute"
                        px={4}
                    >
                        <Loading />
                    </Center>
                )}
                {fetchAttempted && !noTracks && !loading && loadMoreTracks && (
                    <Center
                        zIndex={150}
                        top="200px"
                        right="50%"
                        transform={`translate(50%, 0)`}
                        position="absolute"
                        px={4}
                    >
                        <Button
                            onClick={() => onGetTracks(true)}
                            variant="primary"
                        >
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
                        No tracks found. Please try again with different
                        filters.
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
                    px={[4, 0]}
                    w="full"
                    alignItems="baseline"
                    justifyContent="space-between"
                    direction="column"
                    pb={4}
                    gap={2}
                    zIndex={200}
                >
                    {user?.uid && (
                        <FilterTags
                            onYearClick={() =>
                                setShowYearSelector((prev) => !prev)
                            }
                            onGenreClick={() =>
                                setShowGenreSelector((prev) => !prev)
                            }
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
                        />
                    )}
                </Flex>

                {!noTracks && !loading && reviewStep > 1 && reviewStep < 4 && (
                    <Button
                        onClick={toggleTracklist}
                        variant="ghost"
                        position="absolute"
                        right={[1, 4]}
                        top={2}
                        fontSize="md"
                        colorScheme="teal"
                        _hover={{
                            bg: "transparent",
                            color: "brand.primary",
                        }}
                        shadow="none"
                    >
                        {isShowingTracklist ? "Hide" : "Show"} tracklist
                    </Button>
                )}

                {animate && (
                    <RecordAnimation
                        animate={animate}
                        leftPosition={(windowWidth / 4) * reviewStep}
                        animationDuration={animationDuration}
                        image={currentTrack?.thumbnail || ""}
                    />
                )}

                {animate === "dislike" && (
                    <Flex
                        position="absolute"
                        top={300}
                        width="full"
                        justifyContent="center"
                    >
                        <Icon
                            fontSize={["100px", "200px"]}
                            as={DeleteOutlineIcon}
                        />
                    </Flex>
                )}

                <Flex
                    transition={"all 0.5s ease"}
                    opacity={animate ? 0 : 1}
                    position="relative"
                    gap={4}
                    direction="column"
                >
                    {currentTrack && !animate && (
                        <TrackReviewCard
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
                            trackList={reviewTracks[reviewStep]}
                            setCurrentTrack={setCurrentTrack}
                            isOpen={reviewStep === 1 || !isShowingTracklist}
                            autoplay={userProfile?.autoplay || false}
                            currentTrack={currentTrack}
                            isPlaying={isPlaying}
                            listened={listened}
                            onLikeOrDislike={async (val) => {
                                await likeOrDislike(val);
                                setAnimate(val ? "like" : "dislike");
                            }}
                            onAudioPlay={() => {
                                setIsPlaying(true);
                            }}
                            onListenedToggle={(val) => setListened(val)}
                        />
                    )}
                    {!animate && reviewStep > 1 && reviewStep < 4 && (
                        <TracklistTable
                            isOpen={isShowingTracklist}
                            reviewStep={reviewStep}
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

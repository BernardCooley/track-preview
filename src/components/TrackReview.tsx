import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getCurrentYear } from "../../utils";
import { Track } from "../../types";
import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    Text,
    ToastProps,
    useToast,
} from "@chakra-ui/react";
import Loading from "./Loading";
import YearModal from "./YearModal";
import GenreModal from "./GenreModal";
import FilterTags from "./FilterTags";
import TrackReviewCard from "./TrackReviewCard";
import {
    mutateUserProfile,
    fetchTracks,
    updateTrackReviewStep,
} from "@/bff/bff";
import { useLocalStorage } from "usehooks-ts";
import { genres } from "../../data/genres";
import { useTrackContext } from "../../context/TrackContext";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const { reviewTracks, updateReviewTracks, changesMade, updateChangesMade } =
        useTrackContext();
    const [recentGenres, setRecentGenres] = useLocalStorage<string[]>(
        "recentGenres",
        []
    );
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const [showYearSelector, setShowYearSelector] = useState<boolean>(false);
    const [showGenreSelector, setShowGenreSelector] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const toast = useToast();
    const id = "review-toast";
    const [loading, setLoading] = useState<boolean>(true);
    const [loadMoreTracks, setLoadMoreTracks] = useState<boolean>(false);
    const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);
    const [autoplayLoading, setAutoplayLoading] = useState<boolean>(false);

    useEffect(() => {
        if (currentTrack) {
            setListened(false);
            setIsPlaying(false);
        }
    }, [currentTrack]);

    const getTracks = useCallback(async () => {
        setCurrentTrack(null);
        if (userProfile?.genre && user?.uid) {
            setLoading(true);
            return await fetchTracks({
                genre:
                    userProfile?.genre && reviewStep === 1
                        ? userProfile?.genre
                        : "all",
                startYear: Number(userProfile?.yearFrom || 1960),
                endYear: Number(userProfile?.yearTo || getCurrentYear()),
                userId: user.uid,
                reviewStep,
                limit: reviewStep === 1 ? 100 : null,
            });
        }

        return null;
    }, [
        userProfile?.genre,
        user?.uid,
        userProfile?.yearFrom,
        userProfile?.yearTo,
        reviewStep,
    ]);

    useEffect(() => {
        setCurrentTrack(null);
        setLoading(true);
        setNoTracks(false);
    }, [reviewStep]);

    const onGetTracks = useCallback(
        async (forceFetch: boolean = false) => {
            if (forceFetch) {
                const tracks = await getTracks();
                setFetchAttempted(true);
                if (tracks && tracks.length > 0) {
                    updateReviewTracks(reviewStep, tracks);
                    setLoading(false);
                    setNoTracks(false);
                    setLoadMoreTracks(false);
                } else {
                    setCurrentTrack(null);
                    setNoTracks(true);
                    setLoading(false);
                }
                updateChangesMade(reviewStep, false);
            }
        },
        [getTracks]
    );

    useEffect(() => {
        setLoadingMessage("");
        if (reviewTracks[reviewStep].length > 0) {
            setLoadingMessage("");
            setLoading(false);
            setCurrentTrack(reviewTracks[reviewStep][0]);
        } else {
            setCurrentTrack(null);
            setLoading(false);

            if (reviewStep === 1) {
                setLoadMoreTracks(true);
            } else {
                setNoTracks(true);
            }
        }
    }, [reviewTracks[reviewStep]]);

    useEffect(() => {
        if (
            userProfile?.genre &&
            userProfile?.yearFrom &&
            userProfile?.yearTo
        ) {
            onGetTracks(
                reviewStep === 1
                    ? changesMade[reviewStep as keyof typeof changesMade] ||
                          reviewTracks[reviewStep].length === 0
                    : reviewTracks[reviewStep].length === 0 &&
                          changesMade[reviewStep as keyof typeof changesMade]
            );
        }
    }, [reviewStep]);

    useEffect(() => {
        if (
            userProfile?.genre &&
            userProfile?.yearFrom &&
            userProfile?.yearTo
        ) {
            onGetTracks(true);
        }
    }, [userProfile?.genre, user, userProfile?.yearFrom, userProfile?.yearTo]);

    const showToast = useCallback(
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
    );

    const likeOrDislike = async (like: boolean) => {
        try {
            if (currentTrack && user?.uid) {
                setLoading(true);
                setLoadingMessage("");
                const track = { ...currentTrack };
                setCurrentTrack(null);

                if (reviewTracks[reviewStep].length > 0) {
                    if (reviewTracks[reviewStep].length === 1) {
                        onGetTracks(
                            changesMade[reviewStep as keyof typeof changesMade]
                        );
                        await updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                        });
                    } else {
                        updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                        });
                    }

                    updateReviewTracks(
                        reviewStep,
                        reviewTracks[reviewStep].slice(1)
                    );
                }
                updateChangesMade(reviewStep + 1, true);
            }
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
    };

    return (
        <Box position="relative">
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
            {loading && loadingMessage.length === 0 && (
                <Loading
                    showLoadingBar={
                        userProfile?.genre &&
                        userProfile?.yearFrom &&
                        userProfile?.yearTo
                            ? true
                            : false
                    }
                    loadingText={
                        userProfile?.genre &&
                        userProfile?.yearFrom &&
                        userProfile?.yearTo
                            ? "Loading new track"
                            : "Loading user profile"
                    }
                />
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
                onGenreSelect={async (gen: string) => {
                    if (user?.uid && gen !== userProfile?.genre) {
                        const newProfile = await mutateUserProfile({
                            userId: user.uid,
                            genre: gen,
                        });
                        setRecentGenres((prev) =>
                            Array.from(new Set([...prev, gen]))
                        );
                        updateUserProfile(newProfile);
                        setCurrentTrack(null);
                        setListened(false);
                        setIsPlaying(false);
                    }
                    setShowGenreSelector(false);
                }}
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
                onConfirm={async (val) => {
                    const newProfile = await mutateUserProfile({
                        userId: user?.uid || "",
                        yearFrom: Number(val.from),
                        yearTo: Number(val.to),
                    });
                    updateUserProfile(newProfile);
                    setCurrentTrack(null);
                    setListened(false);
                    setIsPlaying(false);
                    setShowYearSelector(false);
                    onGetTracks(true);
                }}
                onCancel={() => setShowYearSelector(false)}
            />
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
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
                        loadingMessage={loadingMessage}
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

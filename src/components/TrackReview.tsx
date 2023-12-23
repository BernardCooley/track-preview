import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getCurrentYear } from "../../utils";
import { Track } from "../../types";
import {
    Badge,
    Box,
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

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
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
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [triggerGetTracks, setTriggerGetTracks] = useState<boolean>(false);
    const toast = useToast();
    const id = "review-toast";
    const [loading, setLoading] = useState<boolean>(true);
    const [tracks, setTracks] = useState<Track[]>([]);

    const getTracks = useCallback(async () => {
        if (userProfile?.genre && user?.uid) {
            return await fetchTracks({
                genre:
                    userProfile?.genre && reviewStep === 1
                        ? userProfile?.genre
                        : "all",
                startYear: Number(userProfile?.yearFrom || 1960),
                endYear: Number(userProfile?.yearTo || getCurrentYear()),
                userId: user.uid,
                reviewStep,
                limit: reviewStep === 1 ? 1 : null,
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

    const onGetTracks = useCallback(async () => {
        const tracks = await getTracks();
        if (tracks && tracks.length > 0) {
            setTracks(tracks);
            setLoading(false);
        } else {
            setCurrentTrack(null);
            setNoTracks(true);
            setLoading(false);
        }
    }, [getTracks]);

    useEffect(() => {
        setLoadingMessage("");
        if (tracks.length > 0) {
            setLoadingMessage("");
            setLoading(false);
            setCurrentTrack(tracks[0]);
        } else {
            setCurrentTrack(null);
            setNoTracks(true);
            setLoading(true);
        }
    }, [tracks]);

    useEffect(() => {
        if (
            userProfile?.genre &&
            userProfile?.yearFrom &&
            userProfile?.yearTo
        ) {
            onGetTracks();
        }
    }, [
        userProfile?.genre,
        user,
        userProfile?.yearFrom,
        userProfile?.yearTo,
        reviewStep,
        triggerGetTracks,
        onGetTracks,
    ]);

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
        setLoadingMessage("Saving track...");
        try {
            if (currentTrack && user?.uid) {
                const track = { ...currentTrack };
                await updateTrackReviewStep({
                    trackId: track.id,
                    reviewStep,
                    like,
                    userId: user.uid,
                });

                if (reviewStep === 1) {
                    setTriggerGetTracks((prev) => !prev);
                } else {
                    setTracks((prev) => prev.slice(1));
                }
            }
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
        setListened(false);
        setIsPlaying(false);
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box position="relative">
            {loading && (
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
            {noTracks && reviewStep > 1 && (
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

            {noTracks && reviewStep === 1 && (
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
                }}
                onCancel={() => setShowYearSelector(false)}
            />
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
                recentGenres={recentGenres}
            />
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pt={2}
                gap={2}
                rounded="3xl"
                zIndex={200}
                minH="66px"
            >
                {user?.uid && (
                    <FilterTags
                        onYearClick={() => setShowYearSelector((prev) => !prev)}
                        onGenreClick={() =>
                            setShowGenreSelector((prev) => !prev)
                        }
                        onAutoPlayToggle={async () => {
                            const newProfile = await mutateUserProfile({
                                userId: user.uid,
                                autoplay: !userProfile?.autoplay,
                            });

                            updateUserProfile(newProfile);
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
                        loadingMessage={loadingMessage}
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        listened={listened}
                        onLikeOrDislike={async (val) =>
                            await likeOrDislike(val)
                        }
                        onPlayButtonClicked={() => play()}
                        onAudioPlay={() => {
                            setIsPlaying(true);
                        }}
                        onListenedToggle={(val) => setListened(val)}
                        ref={audioElementRef}
                    />
                )}
            </Flex>
        </Box>
    );
};

export default TrackReview;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getCurrentYear } from "../../utils";
import { Track } from "../../types";
import { Box, Flex, Text, ToastProps, useToast } from "@chakra-ui/react";
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

    useEffect(() => {
        (async () => {
            const track = await getTracks();
            if (track) {
                setCurrentTrack(track[0]);
            }
        })();
    }, [
        userProfile?.genre,
        user,
        userProfile?.yearFrom,
        userProfile?.yearTo,
        reviewStep,
        triggerGetTracks,
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

    const getTracks = async () => {
        if (userProfile?.genre && user?.uid) {
            setNoTracks(false);
            return await fetchTracks({
                genre: userProfile?.genre || "all",
                startYear: Number(userProfile?.yearFrom || 1960),
                endYear: Number(userProfile?.yearTo || getCurrentYear()),
                userId: user.uid,
                reviewStep,
            });
        }

        return null;
    };

    const likeOrDislike = async (like: boolean) => {
        try {
            if (currentTrack && user?.uid) {
                const track = { ...currentTrack };
                await updateTrackReviewStep({
                    trackId: track.id,
                    reviewStep,
                    like,
                    userId: user.uid,
                });

                setTriggerGetTracks((prev) => !prev);
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
            {!currentTrack && (
                <Loading
                    showLoadingBar={
                        userProfile?.genre &&
                        userProfile.yearFrom &&
                        userProfile.yearTo
                            ? true
                            : false
                    }
                    loadingText={
                        userProfile?.genre &&
                        userProfile.yearFrom &&
                        userProfile.yearTo
                            ? "Loading new track"
                            : "Loading user profile"
                    }
                />
            )}

            {noTracks && (
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
                        showDates={true}
                        showGenre={true}
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

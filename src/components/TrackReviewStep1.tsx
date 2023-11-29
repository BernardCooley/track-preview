import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import { Box, Flex, useToast } from "@chakra-ui/react";
import { useLocalStorage } from "usehooks-ts";
import { StoredTrack, SearchedTrack, Track } from "../../types";
import {
    deleteStoredTrack,
    fetchDeezerTrack,
    fetchITunesTrack,
    fetchSpotifyTrack,
    fetchStoredTracks,
    saveNewTrack,
    mutateUserProfile,
} from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewCard from "./TrackReviewCard";
import Loading from "./Loading";
import FilterTags from "./FilterTags";
import { getCurrentYear } from "../../utils";
import GenreModal from "./GenreModal";
import { useTrackContext } from "../../context/TrackContext";

const TrackReviewStep1 = () => {
    const {
        step1Tracks,
        updateStep1Tracks,
        step1CurrentTrack,
        updateStep1CurrentTrack,
        step1QueuedTrack,
        updateStep1QueuedTrack,
    } = useTrackContext();
    const [genre, setGenre] = useState<string>("all");
    const [recentGenres, setRecentGenres] = useLocalStorage<string[]>(
        "recentGenres",
        []
    );
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const [availableGenres, setAvailableGenres] = useState<string[]>(genres);
    const [loading, setLoading] = useState<boolean>(false);
    const [preferredYearRange, setPreferredYearRange] = useLocalStorage<{
        from: number;
        to: number;
    }>("preferredYearRange", {
        from: 0,
        to: getCurrentYear(),
    });
    const toast = useToast();
    const id = "step1-toast";
    const [autoplay, setAutoplay] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [initCounter, setInitCounter] = useState<number>(0);
    const [showGenreSelect, setShowGenreSelect] = useState<boolean>(false);

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

    useEffect(() => {
        if (initCounter < 10) {
            init();
        } else {
            showToast({ status: "error" });
            throw new Error("No tracks found");
        }
    }, [genre, user]);

    useEffect(() => {
        if (user?.uid) {
            setAutoplay(userProfile?.autoplay || false);
            setGenre(userProfile?.genre || "all");
        }
    }, [user, userProfile]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const init = useCallback(async () => {
        setInitCounter((prev) => prev + 1);
        if (genre && user?.uid && step1Tracks.length === 0) {
            setAvailableGenres(genres);
            setLoading(true);
            updateStep1CurrentTrack(null);
            updateStep1QueuedTrack(null);

            try {
                const storedTracks = await fetchStoredTracks({
                    genre,
                    startYear: Number(preferredYearRange.from),
                    endYear: Number(preferredYearRange.to),
                    userId: user.uid,
                });

                setListened(false);
                updateStep1Tracks(storedTracks);

                if (storedTracks && storedTracks.length > 1) {
                    setInitCounter(0);
                }
            } catch (error) {
                setLoading(false);
                showToast({ status: "error" });
            }
        }
    }, [genre, user, preferredYearRange]);

    useEffect(() => {
        if (step1Tracks?.length > 1) {
            if (!step1CurrentTrack) {
                handleSearchedTrack(step1Tracks[0], step1Tracks, true);
            } else if (!step1QueuedTrack) {
                handleSearchedTrack(step1Tracks[1], step1Tracks, false);
            }
        } else {
            updateStep1CurrentTrack(null);
            updateStep1QueuedTrack(null);
            if (initCounter < 10) {
                init();
            } else {
                showToast({ status: "error" });
                throw new Error("No tracks found");
            }
        }
    }, [step1Tracks, step1CurrentTrack, step1QueuedTrack]);

    useEffect(() => {
        if (step1CurrentTrack && autoplay && !isPlaying) {
            play();
        }
    }, [step1CurrentTrack]);

    const searchForTrack = async (
        track: StoredTrack
    ): Promise<Track | null> => {
        let searchedTrack: SearchedTrack | null = null;
        let notFound = false;

        try {
            searchedTrack = await fetchDeezerTrack({
                trackToSearch: `${track.artist} - ${track.title}`,
                releaseYear: track.releaseYear,
            });
            notFound = false;
        } catch (error: any) {
            if (error.statusCode === 404) {
                notFound = true;
            }
        }

        if (!searchedTrack) {
            try {
                searchedTrack = await fetchSpotifyTrack({
                    trackToSearch: {
                        artist: track.artist,
                        title: track.title,
                    },
                    releaseYear: track.releaseYear,
                });
                notFound = false;
            } catch (error: any) {
                if (error.statusCode === 404) {
                    notFound = true;
                }
            }
        }

        if (!searchedTrack) {
            try {
                searchedTrack = await fetchITunesTrack({
                    trackToSearch: `${track.artist} - ${track.title}`,
                    releaseYear: track.releaseYear,
                });
                notFound = false;
            } catch (error: any) {
                if (error.statusCode === 404) {
                    notFound = true;
                }
            }
        }

        if (notFound) {
            await deleteStoredTrack({ id: track.id });
        }

        if (searchedTrack) {
            searchedTrack.id = searchedTrack.id.toString();
            return {
                searchedTrack,
                artist: track.artist,
                furthestReviewStep: 1,
                currentReviewStep: 1,
                genre: track.genre,
                title: track.title,
                userId: user!.uid,
                id: track.id,
                purchaseUrl: track.purchaseUrl,
            };
        }

        return null;
    };

    const handleSearchedTrack = async (
        track: StoredTrack,
        storedTracks: StoredTrack[],
        isCurrentTrack: boolean
    ) => {
        const searchedTrack = await searchForTrack(track);

        if (searchedTrack) {
            if (isCurrentTrack) {
                updateStep1CurrentTrack(searchedTrack);
                setLoading(false);
                handleSearchedTrack(storedTracks[1], storedTracks, false);
            } else {
                updateStep1QueuedTrack(searchedTrack);
            }
        } else {
            const newTracksList = step1Tracks.filter((t) => t.id !== track.id);
            updateStep1Tracks(newTracksList);
        }
    };

    const storeTrack = async (like: boolean) => {
        if (user?.uid && step1CurrentTrack && step1Tracks) {
            await saveNewTrack({
                id: step1CurrentTrack.id,
                genre,
                userId: user.uid,
                artist: step1CurrentTrack.artist,
                title: step1CurrentTrack.title,
                currentReviewStep: (step1CurrentTrack.currentReviewStep = like
                    ? 2
                    : 0),
                furthestReviewStep: (step1CurrentTrack.furthestReviewStep = like
                    ? 2
                    : 1),
                purchaseUrl: step1CurrentTrack.purchaseUrl,
                searchedTrack: step1CurrentTrack.searchedTrack,
            });
        }
    };

    const likeOrDislike = async (like: boolean) => {
        setIsPlaying(false);
        try {
            storeTrack(like);
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
        setListened(false);

        if (step1CurrentTrack) {
            const filteredTracks = step1Tracks.filter(
                (t) => t.id !== step1CurrentTrack.id
            );

            if (filteredTracks.length < 2) {
                if (initCounter < 10) {
                    init();
                } else {
                    showToast({ status: "error" });
                    throw new Error("No tracks found");
                }
            } else {
                updateStep1Tracks(filteredTracks);
                updateStep1CurrentTrack(step1QueuedTrack);
                updateStep1QueuedTrack(null);
                handleSearchedTrack(filteredTracks[1], step1Tracks, false);
            }
        }
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box position="relative">
            {loading && <Loading imageSrc="/logo_1x.png" />}
            <GenreModal
                showGenreSelect={showGenreSelect}
                setShowGenreSelect={() => setShowGenreSelect(false)}
                genre={genre}
                onGenreSelect={async (gen: string) => {
                    if (user?.uid && gen !== genre) {
                        const newProfile = await mutateUserProfile({
                            userId: user.uid,
                            genre: gen,
                        });
                        setRecentGenres((prev) =>
                            Array.from(new Set([...prev, gen]))
                        );
                        updateUserProfile(newProfile);
                        updateStep1Tracks([]);
                        updateStep1CurrentTrack(null);
                        updateStep1QueuedTrack(null);
                        setListened(false);
                        setIsPlaying(false);
                    }
                    setShowGenreSelect(false);
                }}
                availableGenres={availableGenres}
                onFavouriteClearClick={() => {
                    setRecentGenres([genre]);
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
                transition="ease-in-out 200ms"
                rounded="3xl"
                zIndex={200}
            >
                {user?.uid && (
                    <FilterTags
                        onGenreClick={() => setShowGenreSelect((prev) => !prev)}
                        onAutoPlayToggle={async () => {
                            const newProfile = await mutateUserProfile({
                                userId: user.uid,
                                autoplay: !autoplay,
                            });

                            updateUserProfile(newProfile);
                        }}
                        showDates={true}
                        genre={genre}
                        preferredYearRange={preferredYearRange}
                        preferredAutoPlay={autoplay}
                    />
                )}
            </Flex>
            <Flex direction="column" position="relative">
                {step1CurrentTrack && (
                    <TrackReviewCard
                        currentTrack={step1CurrentTrack.searchedTrack}
                        queueTrack={step1QueuedTrack?.searchedTrack || null}
                        ignoreQueuedTrack={false}
                        loading={loading}
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

export default TrackReviewStep1;

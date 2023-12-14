import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
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
import YearModal from "./YearModal";

const TrackReviewStep1NoQueuedTrack = () => {
    const {
        step1Tracks: tracks,
        updateStep1Tracks: setTracks,
        step1CurrentTrack: currentTrack,
        updateStep1CurrentTrack: setCurrentTrack,
        yearRange,
        updateYearRange,
        genre,
        updateGenre,
    } = useTrackContext();
    const [recentGenres, setRecentGenres] = useLocalStorage<string[]>(
        "recentGenres",
        []
    );
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const [availableGenres, setAvailableGenres] = useState<string[]>(genres);
    const toast = useToast();
    const id = "step1-toast";
    const [autoplay, setAutoplay] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [initCounter, setInitCounter] = useState<number>(0);
    const [showGenreSelector, setShowGenreSelector] = useState<boolean>(false);
    const [showYearSelector, setShowYearSelector] = useState<boolean>(false);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const [allowInit, setAllowInit] = useState<boolean>(false);

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
            showToast({
                status: "error",
                title: "Error loading tracks",
                description: "Please try refreshing the page.",
            });
        }
    }, [genre, user, yearRange]);

    useEffect(() => {
        if (userProfile) {
            setAutoplay(userProfile?.autoplay || false);
            updateGenre(userProfile?.genre || "all");
            updateYearRange({
                from: userProfile?.yearFrom || 1960,
                to: userProfile?.yearTo || getCurrentYear(),
            });
        }
    }, [userProfile]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const init = useCallback(async () => {
        setInitCounter((prev) => prev + 1);
        if (genre && user?.uid && (tracks?.length === 0 || allowInit)) {
            setNoTracks(false);
            setAvailableGenres(genres);
            setCurrentTrack(null);

            try {
                const storedTracks = await fetchStoredTracks({
                    genre,
                    startYear: Number(yearRange?.from || 1960),
                    endYear: Number(yearRange?.to || getCurrentYear()),
                    userId: user.uid,
                });

                setListened(false);
                setTracks(storedTracks);

                if (storedTracks && storedTracks.length > 1) {
                    setInitCounter(0);
                }
            } catch (error) {
                showToast({ status: "error" });
            }
            setAllowInit(false);
        }
    }, [genre, user]);

    useEffect(() => {
        handleSearchedTrack();
    }, [tracks]);

    useEffect(() => {
        if (currentTrack && autoplay && !isPlaying) {
            play();
        }
    }, [currentTrack]);

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

    const handleSearchedTrack = useCallback(async () => {
        setCurrentTrack(null);
        if (tracks && tracks.length > 0) {
            const searchedTrack = await searchForTrack(tracks[0]);

            if (searchedTrack) {
                setCurrentTrack(searchedTrack);
            } else {
                setTracks(tracks?.slice(1) || []);
            }
        } else {
            if (initCounter < 10) {
                init();
            } else {
                setNoTracks(true);
                showToast({ status: "error" });
            }
        }
    }, [tracks]);

    const storeTrack = async (like: boolean) => {
        if (user?.uid && currentTrack && tracks) {
            await saveNewTrack({
                id: currentTrack.id,
                genre: genre || "all",
                userId: user.uid,
                artist: currentTrack.artist,
                title: currentTrack.title,
                currentReviewStep: (currentTrack.currentReviewStep = like
                    ? 2
                    : 0),
                furthestReviewStep: (currentTrack.furthestReviewStep = like
                    ? 2
                    : 1),
                purchaseUrl: currentTrack.purchaseUrl,
                searchedTrack: currentTrack.searchedTrack,
            });
        }
    };

    const likeOrDislike = async (like: boolean) => {
        try {
            await storeTrack(like);
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
        setListened(false);
        setCurrentTrack(null);
        setIsPlaying(false);

        setTracks(tracks?.slice(1) || []);
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box position="relative">
            {!currentTrack && <Loading imageSrc="/logo_1x.png" />}
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
                yearRange={yearRange || { from: 1960, to: getCurrentYear() }}
                onConfirm={async (val) => {
                    const newProfile = await mutateUserProfile({
                        userId: user?.uid || "",
                        yearFrom: Number(val.from),
                        yearTo: Number(val.to),
                    });
                    setAllowInit(true);
                    updateUserProfile(newProfile);
                    setShowYearSelector(false);
                }}
                onCancel={() => setShowYearSelector(false)}
            />
            <GenreModal
                showGenreSelector={showGenreSelector}
                setShowGenreSelector={() => setShowGenreSelector(false)}
                genre={genre || "all"}
                onGenreSelect={async (gen: string) => {
                    if (user?.uid && gen !== genre) {
                        const newProfile = await mutateUserProfile({
                            userId: user.uid,
                            genre: gen,
                        });
                        setAllowInit(true);
                        setRecentGenres((prev) =>
                            Array.from(new Set([...prev, gen]))
                        );
                        updateUserProfile(newProfile);
                        setTracks([]);
                        setCurrentTrack(null);
                        setListened(false);
                        setIsPlaying(false);
                    }
                    setShowGenreSelector(false);
                }}
                availableGenres={availableGenres}
                onFavouriteClearClick={() => {
                    setRecentGenres([genre || "all"]);
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
                        onYearClick={() => setShowYearSelector((prev) => !prev)}
                        onGenreClick={() =>
                            setShowGenreSelector((prev) => !prev)
                        }
                        onAutoPlayToggle={async () => {
                            const newProfile = await mutateUserProfile({
                                userId: user.uid,
                                autoplay: !autoplay,
                            });

                            updateUserProfile(newProfile);
                        }}
                        showDates={true}
                        genre={genre}
                        yearRange={yearRange}
                        preferredAutoPlay={autoplay}
                    />
                )}
            </Flex>
            <Flex direction="column" position="relative">
                {currentTrack && (
                    <TrackReviewCard
                        currentTrack={currentTrack.searchedTrack}
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

export default TrackReviewStep1NoQueuedTrack;

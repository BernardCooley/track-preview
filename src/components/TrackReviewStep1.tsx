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
    const [allowGetTracks, setAllowGetTracks] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [loadingMessage, setLoadingMessage] = useState<string>("");

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
            getTracks();
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
        }
    }, [userProfile?.autoplay]);

    useEffect(() => {
        if (userProfile) {
            updateGenre(userProfile?.genre || "all");
        }
    }, [userProfile?.genre]);

    useEffect(() => {
        if (userProfile) {
            updateYearRange({
                from: userProfile?.yearFrom || 1960,
                to: userProfile?.yearTo || getCurrentYear(),
            });
        }
    }, [userProfile?.yearFrom, userProfile?.yearTo]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const allProgress = (proms: any, progress_cb: any) => {
        let d = 0;
        progress_cb(0);
        for (const p of proms) {
            p.then(() => {
                d++;
                progress_cb((d * 100) / proms.length);
            });
        }
        return Promise.all(proms);
    };

    const getTracks = useCallback(async () => {
        setInitCounter((prev) => prev + 1);
        if (genre && user?.uid && (tracks?.length === 0 || allowGetTracks)) {
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

                const searchTrackPromises = storedTracks.map(async (track) => {
                    return searchForTrack(track);
                });

                const newTracks = await allProgress(
                    searchTrackPromises,
                    (progress: any) => {
                        setLoadingProgress(progress);
                    }
                );

                setTracks(
                    newTracks.filter((track) => track !== null) as Track[]
                );

                setLoadingProgress(0);

                if (storedTracks && storedTracks.length > 1) {
                    setInitCounter(0);
                }
            } catch (error) {
                showToast({ status: "error" });
            }
            setAllowGetTracks(false);
        }
    }, [genre, user]);

    useEffect(() => {
        if (tracks.length > 0) {
            setCurrentTrack(tracks[0]);
            setLoadingMessage("");
        } else {
            getTracks();
        }
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

    const storeTrack = async (track: Track, like: boolean) => {
        if (user?.uid) {
            await saveNewTrack({
                id: track.id,
                genre: genre || "all",
                userId: user.uid,
                artist: track.artist,
                title: track.title,
                currentReviewStep: (track.currentReviewStep = like ? 2 : 0),
                furthestReviewStep: (track.furthestReviewStep = like ? 2 : 1),
                purchaseUrl: track.purchaseUrl,
                searchedTrack: track.searchedTrack,
            });
        }
    };

    const likeOrDislike = async (like: boolean) => {
        setLoadingMessage(like ? "Liking track" : "Disliking track");
        try {
            if (currentTrack) {
                const track = { ...currentTrack };
                await storeTrack(track, like);
            }
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
        setListened(false);
        setIsPlaying(false);

        setTracks(tracks?.slice(1) || []);
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box position="relative">
            {!currentTrack && (
                <Box
                    position="absolute"
                    top="100%"
                    transform="translate(50%, 0)"
                    right="50%"
                    bg="brand.backgroundTertiaryOpaque2"
                    p={10}
                    pt={6}
                    rounded="3xl"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.primary"
                >
                    <Loading progress={loadingProgress} />
                </Box>
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
                yearRange={yearRange || { from: 1960, to: getCurrentYear() }}
                onConfirm={async (val) => {
                    const newProfile = await mutateUserProfile({
                        userId: user?.uid || "",
                        yearFrom: Number(val.from),
                        yearTo: Number(val.to),
                    });
                    setAllowGetTracks(true);
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
                        setAllowGetTracks(true);
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
                        loadingMessage={loadingMessage}
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

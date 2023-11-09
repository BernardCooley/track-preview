import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import { Box, Flex, useToast } from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import { useLocalStorage } from "usehooks-ts";
import { ScrapeTrack, SearchedTrack, Track } from "../../types";
import {
    fetchDeezerTrack,
    fetchITunesTrack,
    fetchSpotifyTrack,
} from "@/bff/bff";
import {
    fetchStoredTracks,
    fetchUserTracks,
    saveNewTrack,
} from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewCard from "./TrackReviewCard";
import Loading from "./Loading";
import ApplyFiltersButton from "./ApplyFiltersButton";
import FilterTags from "./FilterTags";
import { getCurrentYear } from "../../utils";

const TrackReviewStep1 = () => {
    const [genre, setPreferredGenre] = useLocalStorage("genre", "All");
    const { user } = useAuthContext();
    const genreRef = useRef<HTMLSelectElement>(null);
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
    const [tracks, setTracks] = useState<ScrapeTrack[]>([]);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [filtersToApply, setSetFiltersToApply] = useState<boolean>(false);
    const [preferredAutoPlay, setPreferredAutoPlay] = useLocalStorage(
        "preferredAutoPlay",
        false
    );
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [oldValues, setOldValues] = useState<{
        genre: string;
        yearFrom: number;
        yearTo: number;
    }>({
        genre,
        yearFrom: preferredYearRange.from,
        yearTo: preferredYearRange.to,
    });
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queuedTrack, setQueuedTrack] = useState<Track | null>(null);

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

    const init = useCallback(async () => {
        if (genre && user?.uid) {
            genreRef.current!.value = genre;
            setAvailableGenres(genres);
            setLoading(true);

            try {
                const storedTracks = await fetchStoredTracks({
                    genre,
                    startYear: preferredYearRange.from,
                    endYear: preferredYearRange.to,
                });

                const userTracks =
                    (await fetchUserTracks({
                        genre,
                        userId: user.uid,
                    })) || [];

                if (storedTracks && storedTracks.length > 0) {
                    const uTrackIds = userTracks.map((t) => t.id);
                    const filteredStoredTracks = storedTracks.filter(
                        (t) => !uTrackIds.includes(t.id)
                    );

                    if (filteredStoredTracks.length > 2) {
                        setTracks(filteredStoredTracks);
                    } else {
                        init();
                    }
                } else {
                    init();
                }
            } catch (error) {
                setLoading(false);
                showToast({ status: "error" });
            }
        }

        setOldValues({
            genre,
            yearFrom: preferredYearRange.from,
            yearTo: preferredYearRange.to,
        });
    }, [genre, user, preferredYearRange, showToast]);

    useEffect(() => {
        init();
    }, [genre, preferredYearRange, user]);

    useEffect(() => {
        if (tracks.length > 1) {
            if (!currentTrack) {
                searchTrack(tracks[0], true);
            } else if (!queuedTrack) {
                searchTrack(tracks[1], false);
            }
        } else {
            init();
        }
    }, [tracks, currentTrack, queuedTrack]);

    useEffect(() => {
        if (currentTrack && preferredAutoPlay && !isPlaying) {
            play();
        }
    }, [currentTrack]);

    useEffect(() => {
        setSetFiltersToApply(
            oldValues.genre !== genre ||
                oldValues.yearFrom !== preferredYearRange.from ||
                oldValues.yearTo !== preferredYearRange.to
        );
    }, [genre, preferredYearRange, settingsOpen, oldValues]);

    useEffect(() => {
        if (!settingsOpen && filtersToApply) {
            init();
        }
    }, [settingsOpen, filtersToApply]);

    const searchTrack = async (track: ScrapeTrack, isCurrentTrack: boolean) => {
        let searchedTrack: SearchedTrack | null = null;

        searchedTrack = await fetchDeezerTrack({
            trackToSearch: `${track.artist} - ${track.title}`,
        });

        if (!searchedTrack) {
            searchedTrack = await fetchSpotifyTrack({
                trackToSearch: {
                    artist: track.artist,
                    title: track.title,
                },
            });
        }

        if (!searchedTrack) {
            searchedTrack = await fetchITunesTrack({
                trackToSearch: `${track.artist} - ${track.title}`,
            });
        }

        if (searchedTrack) {
            const newTrack: Track = {
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

            if (isCurrentTrack) {
                setCurrentTrack(newTrack);
                setLoading(false);
                searchTrack(tracks[1], false);
            } else {
                setQueuedTrack(newTrack);
            }
        } else {
            setTracks((prev) => prev.filter((t) => t.id !== track.id));
        }
    };

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const storeTrack = async (like: boolean) => {
        if (user?.uid && currentTrack && tracks) {
            currentTrack.currentReviewStep = like ? 2 : 0;
            currentTrack.furthestReviewStep = like ? 2 : 1;

            try {
                await saveNewTrack({
                    track: currentTrack,
                    id: currentTrack.id,
                });
            } catch (error) {
                showToast({
                    status: "error",
                    title: "Error saving track",
                });
                console.log(error);
            }
        }
    };

    const likeOrDislike = async (like: boolean) => {
        setIsPlaying(false);
        storeTrack(like);
        setListened(false);

        if (currentTrack) {
            const filteredTracks = tracks.filter(
                (t) => t.id !== currentTrack.id
            );

            if (filteredTracks.length < 2) {
                init();
            } else {
                setTracks(filteredTracks);
                setCurrentTrack(queuedTrack);
                setQueuedTrack(null);
                searchTrack(filteredTracks[1], false);
            }
        }
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box h="90vh" position="relative">
            {loading && <Loading genre={genre} />}
            <Flex
                w={[settingsOpen ? "auto" : "full", "full"]}
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pl={settingsOpen ? 4 : [4, 0]}
                gap={2}
                mx={settingsOpen ? [4, 0] : 0}
                transition="ease-in-out 200ms"
                backgroundColor={settingsOpen ? "gray.300" : "transparent"}
                shadow={settingsOpen ? "2xl" : "none"}
                rounded="3xl"
                position="absolute"
                zIndex={200}
            >
                <Flex
                    alignItems="center"
                    gap={6}
                    justifyContent="space-between"
                    w="full"
                >
                    <ApplyFiltersButton
                        settingsOpen={settingsOpen}
                        filtersToApply={filtersToApply}
                        onSetSettingsOpen={() =>
                            setSettingsOpen((prev) => !prev)
                        }
                    />

                    <FilterTags
                        settingsOpen={settingsOpen}
                        genre={genre}
                        preferredYearRange={preferredYearRange}
                        preferredAutoPlay={preferredAutoPlay}
                    />
                </Flex>
                <ReviewTracksFilters
                    showDates={false}
                    preferredYearRange={preferredYearRange}
                    isOpen={settingsOpen}
                    onGenreSelect={async (genre: string) => {
                        setPreferredGenre(genre);
                    }}
                    onYearFromSelect={async (year) => {
                        const y = Number(year);
                        setPreferredYearRange((prev) => ({
                            to:
                                y === 0 || y === getCurrentYear()
                                    ? getCurrentYear()
                                    : prev.to,
                            from: y,
                        }));
                    }}
                    onYearToSelect={async (year) => {
                        const y = Number(year);
                        setPreferredYearRange((prev) => ({
                            ...prev,
                            to: y,
                        }));
                    }}
                    selectedYearFrom={preferredYearRange.from}
                    selectedYearTo={preferredYearRange.to}
                    selectedGenre={genre}
                    genres={availableGenres}
                    autoPlay={preferredAutoPlay}
                    onAutoPlayChange={(value) => setPreferredAutoPlay(value)}
                    ref={genreRef}
                />
            </Flex>
            <Flex
                direction="column"
                position="relative"
                top={20}
                opacity={settingsOpen ? 0.3 : 1}
                pointerEvents={settingsOpen ? "none" : "auto"}
            >
                {currentTrack && (
                    <TrackReviewCard
                        currentTrack={currentTrack.searchedTrack}
                        queueTrack={queuedTrack?.searchedTrack || null}
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

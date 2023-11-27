import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import {
    Box,
    Collapse,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
    useToast,
} from "@chakra-ui/react";
import { useLocalStorage } from "usehooks-ts";
import { StoredTrack, SearchedTrack, Track } from "../../types";
import {
    fetchDeezerTrack,
    fetchITunesTrack,
    fetchSpotifyTrack,
    fetchStoredTracks,
    saveNewTrack,
} from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewCard from "./TrackReviewCard";
import Loading from "./Loading";
import FilterTags from "./FilterTags";
import { getCurrentYear } from "../../utils";
import GenreSelector from "./GenreSelector";

const TrackReviewStep1 = () => {
    const [genre, setGenre] = useLocalStorage("genre", "All");
    const [favouriteGenres, setFavouriteGenres] = useLocalStorage<string[]>(
        "favouriteGenres",
        []
    );
    const { user } = useAuthContext();
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
    const [tracks, setTracks] = useState<StoredTrack[]>([]);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [preferredAutoPlay, setPreferredAutoPlay] = useLocalStorage(
        "preferredAutoPlay",
        false
    );
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queuedTrack, setQueuedTrack] = useState<Track | null>(null);
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

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const init = useCallback(async () => {
        setInitCounter((prev) => prev + 1);
        if (genre && user?.uid) {
            setAvailableGenres(genres);
            setLoading(true);

            try {
                const storedTracks = await fetchStoredTracks({
                    genre,
                    startYear: Number(preferredYearRange.from),
                    endYear: Number(preferredYearRange.to),
                    userId: user.uid,
                });

                setListened(false);

                setTracks(storedTracks);

                if (storedTracks.length > 1) {
                    setInitCounter(0);
                }
            } catch (error) {
                setLoading(false);
                showToast({ status: "error" });
            }
        }
    }, [genre, user, preferredYearRange]);

    useEffect(() => {
        if (tracks?.length > 1) {
            if (!currentTrack) {
                handleSearchedTrack(tracks[0], tracks, true);
            } else if (!queuedTrack) {
                handleSearchedTrack(tracks[1], tracks, false);
            }
        } else {
            setCurrentTrack(null);
            setQueuedTrack(null);
            if (initCounter < 10) {
                init();
            } else {
                showToast({ status: "error" });
                throw new Error("No tracks found");
            }
        }
    }, [tracks, currentTrack, queuedTrack]);

    useEffect(() => {
        if (currentTrack && preferredAutoPlay && !isPlaying) {
            play();
        }
    }, [currentTrack]);

    const searchForTrack = async (
        track: StoredTrack
    ): Promise<Track | null> => {
        let searchedTrack: SearchedTrack | null = null;

        searchedTrack = await fetchDeezerTrack({
            trackToSearch: `${track.artist} - ${track.title}`,
            releaseYear: track.releaseYear,
        });

        if (!searchedTrack) {
            searchedTrack = await fetchSpotifyTrack({
                trackToSearch: {
                    artist: track.artist,
                    title: track.title,
                },
                releaseYear: track.releaseYear,
            });
        }

        if (!searchedTrack) {
            searchedTrack = await fetchITunesTrack({
                trackToSearch: `${track.artist} - ${track.title}`,
                releaseYear: track.releaseYear,
            });
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
                setCurrentTrack(searchedTrack);
                setLoading(false);
                handleSearchedTrack(storedTracks[1], storedTracks, false);
            } else {
                setQueuedTrack(searchedTrack);
            }
        } else {
            setTracks((prev) => prev.filter((t) => t.id !== track.id));
        }
    };

    const storeTrack = async (like: boolean) => {
        if (user?.uid && currentTrack && tracks) {
            await saveNewTrack({
                id: currentTrack.id,
                genre,
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

        if (currentTrack) {
            const filteredTracks = tracks.filter(
                (t) => t.id !== currentTrack.id
            );

            if (filteredTracks.length < 2) {
                if (initCounter < 10) {
                    init();
                } else {
                    showToast({ status: "error" });
                    throw new Error("No tracks found");
                }
            } else {
                setTracks(filteredTracks);
                setCurrentTrack(queuedTrack);
                setQueuedTrack(null);
                handleSearchedTrack(filteredTracks[1], tracks, false);
            }
        }
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box h="90vh" position="relative">
            {loading && <Loading imageSrc="/logo_1x.png" />}
            <Modal
                isCentered={true}
                isOpen={showGenreSelect}
                onClose={() => setShowGenreSelect(false)}
            >
                <ModalOverlay />
                <ModalContent rounded="3xl" mx={4}>
                    <Flex
                        h="full"
                        w="full"
                        bg="brand.backgroundSecondary"
                        rounded="3xl"
                        p={showGenreSelect ? 4 : 0}
                    >
                        <Collapse in={showGenreSelect} animateOpacity>
                            <GenreSelector
                                onFavouriteClearClick={() => {
                                    setFavouriteGenres([genre]);
                                }}
                                favouriteGenres={favouriteGenres}
                                genres={availableGenres}
                                selectedGenre={genre}
                                onClick={(gen) => {
                                    if (gen !== genre) {
                                        setFavouriteGenres((prev) =>
                                            Array.from(new Set([...prev, gen]))
                                        );
                                        setGenre(gen);
                                        setTracks([]);
                                        setCurrentTrack(null);
                                        setQueuedTrack(null);
                                        setListened(false);
                                        setIsPlaying(false);
                                    }
                                    setShowGenreSelect(false);
                                }}
                            />
                        </Collapse>
                    </Flex>
                </ModalContent>
            </Modal>
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pt={2}
                gap={2}
                mx={settingsOpen ? [4, 0] : 0}
                transition="ease-in-out 200ms"
                shadow={settingsOpen ? "2xl" : "none"}
                rounded="3xl"
                // position="absolute"
                zIndex={200}
            >
                <FilterTags
                    onGenreClick={() => setShowGenreSelect((prev) => !prev)}
                    onAutoPlayToggle={() =>
                        setPreferredAutoPlay((prev) => !prev)
                    }
                    showDates={true}
                    settingsOpen={settingsOpen}
                    genre={genre}
                    preferredYearRange={preferredYearRange}
                    preferredAutoPlay={preferredAutoPlay}
                />
            </Flex>
            <Flex
                direction="column"
                position="relative"
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

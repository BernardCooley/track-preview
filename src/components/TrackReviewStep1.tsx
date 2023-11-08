import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import {
    Badge,
    Box,
    Center,
    Flex,
    IconButton,
    Tag,
    Text,
    useToast,
} from "@chakra-ui/react";
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
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import { v4 as uuidv4 } from "uuid";

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
        to: new Date().getFullYear(),
    });
    const toast = useToast();
    const id = "test-toast";
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
    const [currentTrack, setCurrentTrack] = useState<SearchedTrack | null>(
        null
    );
    const [queuedTrack, setQueuedTrack] = useState<SearchedTrack | null>(null);

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
                        reviewStep: 1,
                        userId: user.uid,
                    })) || [];

                if (storedTracks && storedTracks.length > 0) {
                    const uTrackIds = userTracks.map((t) => t.storedTrackId);
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
    }, [genre, preferredYearRange, user, init]);

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
    }, [tracks, init, currentTrack]);

    useEffect(() => {
        setSetFiltersToApply(
            oldValues.genre !== genre ||
                oldValues.yearFrom !== preferredYearRange.from ||
                oldValues.yearTo !== preferredYearRange.to
        );
    }, [
        genre,
        preferredYearRange.from,
        preferredYearRange.to,
        settingsOpen,
        oldValues.genre,
        oldValues.yearFrom,
        oldValues.yearTo,
    ]);

    useEffect(() => {
        if (!settingsOpen && filtersToApply) {
            init();
        }
    }, [settingsOpen, filtersToApply, init]);

    const searchTrack = async (track: ScrapeTrack, isCurrentTrack: boolean) => {
        let searchedTrack: SearchedTrack | null = null;

        searchedTrack = await fetchDeezerTrack({
            trackToSearch: `${track.artist} - ${track.title}`,
        });

        if (!searchedTrack) {
            searchedTrack = await fetchITunesTrack({
                trackToSearch: `${track.artist} - ${track.title}`,
            });
        }

        if (!searchedTrack) {
            searchedTrack = await fetchSpotifyTrack({
                trackToSearch: {
                    artist: track.artist,
                    title: track.title,
                },
            });
        }

        if (searchedTrack) {
            if (isCurrentTrack) {
                setCurrentTrack(searchedTrack);
                setLoading(false);
                searchTrack(tracks[1], false);
            } else {
                setQueuedTrack(searchedTrack);
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
        const generatedId = uuidv4();
        if (user?.uid && currentTrack && tracks) {
            const newTrack: Track = {
                storedTrackId: tracks[0].id,
                artist: tracks[0].artist,
                furthestReviewStep: like ? 2 : 1,
                currentReviewStep: like ? 2 : 0,
                genre: tracks[0].genre,
                searchedTrack: currentTrack,
                title: tracks[0].title,
                userId: user.uid,
                id: generatedId,
                purchaseUrl: tracks[0].purchaseUrl,
            };

            try {
                await saveNewTrack({ track: newTrack, id: generatedId });
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
            const filteredTracks = tracks
                .slice(1)
                .filter((t) => t.id !== currentTrack.id);

            if (filteredTracks.length < 2) {
                init();
            } else {
                setTracks(filteredTracks);
                setCurrentTrack(queuedTrack);
                searchTrack(tracks[1], false);
            }
        }
    };

    const play = () => {
        audioElementRef.current?.play();
    };

    return (
        <Box h="90vh" position="relative">
            {loading && (
                <Center>
                    <Badge
                        zIndex={150}
                        top="50%"
                        position="absolute"
                        variant="outline"
                        colorScheme="green"
                        fontSize={["24px", "36px"]}
                        px={4}
                    >
                        {`Loading new ${genre} Track...`}
                    </Badge>
                </Center>
            )}
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
                    <IconButton
                        backgroundColor={settingsOpen ? "gray.500" : "white"}
                        height="40px"
                        width={
                            settingsOpen && filtersToApply ? "160px" : "40px"
                        }
                        transition="width 200ms"
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        aria-label="Search database"
                        _hover={{
                            backgroundColor: settingsOpen ? "none" : "gray.300",
                        }}
                        icon={
                            !settingsOpen || !filtersToApply ? (
                                <SettingsIcon
                                    fontSize="inherit"
                                    sx={{
                                        color: "gray.500",
                                    }}
                                />
                            ) : (
                                <Flex gap={2} alignItems="center">
                                    <Text color="gray.100">Apply & search</Text>
                                    <CheckIcon
                                        fontSize="inherit"
                                        sx={{
                                            color: "white",
                                        }}
                                    />
                                </Flex>
                            )
                        }
                    />

                    <Flex
                        opacity={settingsOpen ? 0 : 1}
                        transition="opacity 200ms"
                        h={8}
                    >
                        <Flex gap={2}>
                            <Tag colorScheme="teal" variant="solid">
                                {genre}
                            </Tag>
                            <Tag colorScheme="teal" variant="solid">
                                {preferredYearRange.from === 0
                                    ? "All"
                                    : `${preferredYearRange.from} -
                                ${preferredYearRange.to}`}
                            </Tag>
                            <Tag
                                colorScheme="teal"
                                variant={
                                    preferredAutoPlay ? "solid" : "outline"
                                }
                            >
                                AutoPlay
                            </Tag>
                        </Flex>
                    </Flex>
                </Flex>
                <ReviewTracksFilters
                    reviewStep={1}
                    preferredYearRange={preferredYearRange}
                    isOpen={settingsOpen}
                    onGenreSelect={async (genre: string) => {
                        setPreferredGenre(genre);
                    }}
                    onYearFromSelect={async (year) => {
                        const y = Number(year);
                        setPreferredYearRange((prev) => ({
                            to:
                                y === 0 || y === new Date().getFullYear()
                                    ? new Date().getFullYear()
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
                        currentTrack={currentTrack}
                        queueTrack={queuedTrack}
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
                {queuedTrack && (
                    <Center mt={[6, 16]}>
                        <Flex direction="column" alignItems="center" px={6}>
                            <Text>Up Next</Text>
                            <Text noOfLines={2} fontWeight="bold">
                                {queuedTrack.artist} - {queuedTrack.title}
                            </Text>
                        </Flex>
                    </Center>
                )}
            </Flex>
        </Box>
    );
};

export default TrackReviewStep1;

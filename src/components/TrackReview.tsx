/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import {
    Badge,
    Box,
    Center,
    Flex,
    IconButton,
    Text,
    useToast,
} from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import TrackList from "./TrackList";
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
    updateTrackReviewStep,
} from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewCard from "./TrackReviewCard";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const [preferredGenre, setPreferredGenre] = useLocalStorage(
        "preferredGenre",
        "All"
    );
    const [preferredYearRange, setPreferredYearRange] = useLocalStorage(
        "preferredYearRange",
        {
            from: "All",
            to: new Date().getFullYear().toString(),
        }
    );
    const [preferredAutoPlay, setPreferredAutoPlay] = useLocalStorage(
        "preferredAutoPlay",
        false
    );
    const [storedTracks, setStoredTracks] = useState<ScrapeTrack[] | null>(
        null
    );
    const toast = useToast();
    const [availableGenres] = useState<string[]>(genres);
    const [loading, setLoading] = useState<boolean>(false);
    const genreRef = useRef<HTMLSelectElement>(null);
    const [currentTrack, setCurrentTrack] = useState<SearchedTrack | null>();
    const [queuedTrack, setQueuedTrack] = useState<SearchedTrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const { user } = useAuthContext();
    const [trackPlayed, setTrackPlayed] = useState<boolean>(false);
    const [userTracks, setUserTracks] = useState<Track[] | null>(null);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [randomNumber, setRandomNumber] = useState<number>(0);

    useEffect(() => {
        init();
    }, [reviewStep, user]);

    const init = async () => {
        if (preferredGenre) {
            setCurrentTrack(null);
            setQueuedTrack(null);
            genreRef.current!.value = preferredGenre;

            if (reviewStep === 1) {
                setLoading(true);
                const from =
                    preferredYearRange.from === "All" ||
                    !preferredYearRange.from
                        ? 1950
                        : preferredYearRange.from;
                const to =
                    preferredYearRange.to === "" || !preferredYearRange.to
                        ? new Date().getFullYear()
                        : Number(preferredYearRange.to);

                try {
                    const tracks = await fetchStoredTracks({
                        genre: preferredGenre,
                        startDate: new Date(`${from}-01-01`),
                        endDate: new Date(`${to}-01-01`),
                    });
                    setStoredTracks(tracks);
                    setLoading(false);
                    if (!tracks) {
                        showToast({
                            status: "info",
                            title: `No more ${preferredGenre} tracks available`,
                            description: `Please try again with different filters.`,
                        });
                    }
                } catch (error) {
                    setLoading(false);
                    showToast({ status: "error" });
                    console.log(error);
                }
            } else if (reviewStep > 1 && reviewStep < 4) {
                setLoading(false);

                if (user?.uid) {
                    try {
                        const tracks = await fetchUserTracks({
                            genre: preferredGenre,
                            currentReviewStep: reviewStep,
                            userId: user.uid,
                        });
                        setUserTracks(tracks);
                    } catch (error) {
                        showToast({
                            status: "error",
                            title: "Error getting your tracks",
                        });
                        console.log(error);
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (trackPlayed || (storedTracks && storedTracks.length > 0)) {
            searchForTrack();
        }
    }, [trackPlayed, storedTracks]);

    useEffect(() => {
        if (!settingsOpen) {
            init();
        }
    }, [settingsOpen]);

    useEffect(() => {
        if (reviewStep > 1 && reviewStep < 4) {
            if (userTracks && userTracks.length > 0) {
                setCurrentTrack(userTracks[0].searchedTrack);
            } else {
                setCurrentTrack(null);
            }
        }
    }, [userTracks]);

    useEffect(() => {
        setIsPlaying(false);

        if (currentTrack) {
            setLoading(false);
            setListened(false);
            setTrackPlayed(false);
        }

        if (preferredAutoPlay && currentTrack) {
            play();
        }
    }, [currentTrack]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const showToast = ({ status, title, description }: ToastProps) => {
        toast({
            title: title || "An error has occured.",
            description: description || "Please try again later.",
            status: status,
            duration: 5000,
            isClosable: true,
        });
    };

    const searchForTrack = async () => {
        if (storedTracks && storedTracks.length > 0) {
            const rand = Math.floor(
                Math.floor(Math.random() * storedTracks.length)
            );
            setRandomNumber(rand);

            let searchedTrack;

            searchedTrack = await fetchITunesTrack({
                trackToSearch: `${storedTracks[rand].artist} - ${storedTracks[rand].title}`,
            });

            if (!searchedTrack) {
                searchedTrack = await fetchDeezerTrack({
                    trackToSearch: `${storedTracks[rand].artist} - ${storedTracks[rand].title}`,
                });
            }

            if (!searchedTrack) {
                searchedTrack = await fetchSpotifyTrack({
                    trackToSearch: {
                        artist: storedTracks[rand].artist,
                        title: storedTracks[rand].title,
                    },
                });
            }

            if (searchedTrack) {
                if (!currentTrack) {
                    setCurrentTrack(searchedTrack);
                    setLoading(false);
                } else if (!queuedTrack) {
                    setQueuedTrack(searchedTrack);
                }
            } else {
                const newStoredTracks = storedTracks.filter(
                    (track) => track !== storedTracks[rand]
                );
                setStoredTracks(newStoredTracks);
            }
        }
    };

    const play = () => {
        setTrackPlayed(true);
        audioElementRef.current?.play();
    };

    const storeTrack = async (like: boolean) => {
        if (user?.uid && currentTrack && storedTracks) {
            const newTrack: Track = {
                storedTrackId: storedTracks[randomNumber].id,
                artist: storedTracks[randomNumber].artist,
                furthestReviewStep: like ? reviewStep + 1 : reviewStep,
                currentReviewStep: like ? reviewStep + 1 : 0,
                genre: preferredGenre,
                searchedTrack: currentTrack,
                title: storedTracks[randomNumber].title,
                userId: user.uid,
                id: "",
            };

            try {
                await saveNewTrack({ track: newTrack });
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
        if (reviewStep === 1) {
            setCurrentTrack(queuedTrack);
            setQueuedTrack(null);
            storeTrack(like);

            if (storedTracks) {
                const newStoredTracks = storedTracks.filter(
                    (track) => track !== storedTracks[randomNumber]
                );
                setStoredTracks(newStoredTracks);
            }
        } else if (reviewStep > 1 && reviewStep < 4) {
            if (userTracks && userTracks.length > 0) {
                await updateTrackReviewStep({
                    trackId: userTracks[0].id,
                    newReviewStep: like ? reviewStep + 1 : 0,
                    furthestReviewStep: like ? reviewStep + 1 : reviewStep,
                });
            }
            setUserTracks((prev) => {
                if (prev) {
                    prev.splice(0, 1);
                    return [...prev];
                } else {
                    return null;
                }
            });
        }

        setListened(false);
    };

    return (
        <Box h="full" position="relative">
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
                        {`Loading new ${preferredGenre} Track...`}
                    </Badge>
                </Center>
            )}
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pl={settingsOpen ? 4 : 0}
                gap={2}
                transition="ease-in-out 200ms"
                backgroundColor={settingsOpen ? "gray.300" : "transparent"}
                shadow={settingsOpen ? "2xl" : "none"}
                rounded="3xl"
            >
                <Flex alignItems="center" gap={6}>
                    <IconButton
                        backgroundColor={settingsOpen ? "gray.500" : "white"}
                        height="40px"
                        width={settingsOpen ? "110px" : "40px"}
                        transition="width 200ms"
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        aria-label="Search database"
                        _hover={{
                            backgroundColor: settingsOpen ? "none" : "gray.300",
                        }}
                        icon={
                            !settingsOpen ? (
                                <SettingsIcon
                                    fontSize="inherit"
                                    sx={{
                                        color: "gray.500",
                                    }}
                                />
                            ) : (
                                <Flex gap={2} alignItems="center">
                                    <Text color="gray.100">Confirm</Text>
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
                        direction="row"
                        gap={[4, 10, 28]}
                        opacity={settingsOpen ? 0 : 1}
                        transition="opacity 200ms"
                    >
                        <Flex flexDirection="column" alignItems="center">
                            <Box fontWeight="bold">Genre</Box>
                            <Box>{preferredGenre}</Box>
                        </Flex>
                        <Flex flexDirection="column" alignItems="center">
                            <Box fontWeight="bold">Year range</Box>
                            {preferredYearRange.from === "All" ? (
                                <Box>{preferredYearRange.from || "All"}</Box>
                            ) : (
                                <Box>
                                    {preferredYearRange.from} -{" "}
                                    {preferredYearRange.to}
                                </Box>
                            )}
                        </Flex>
                        <Flex flexDirection="column" alignItems="center">
                            <Box fontWeight="bold">Autoplay</Box>
                            <Box>{preferredAutoPlay ? "On" : "Off"}</Box>
                        </Flex>
                    </Flex>
                </Flex>
                <ReviewTracksFilters
                    preferredYearRange={preferredYearRange}
                    onConfirm={() => {
                        setSettingsOpen(false);
                    }}
                    isOpen={settingsOpen}
                    onGenreSelect={async (genre: string) => {
                        setPreferredGenre(genre);
                    }}
                    onYearFromSelect={async (year) => {
                        setPreferredYearRange((prev) => ({
                            to:
                                year === "All" ||
                                year === new Date().getFullYear().toString()
                                    ? new Date().getFullYear().toString()
                                    : prev.to,
                            from: year,
                        }));
                    }}
                    onYearToSelect={async (year) => {
                        setPreferredYearRange((prev) => ({
                            ...prev,
                            to: year,
                        }));
                    }}
                    selectedYearFrom={preferredYearRange.from}
                    selectedYearTo={preferredYearRange.to}
                    selectedGenre={preferredGenre}
                    genres={availableGenres}
                    autoPlay={preferredAutoPlay}
                    onAutoPlayChange={(value) => setPreferredAutoPlay(value)}
                    ref={genreRef}
                />
            </Flex>
            {currentTrack && (
                <>
                    {reviewStep < 4 ? (
                        <TrackReviewCard
                            ignoreQueuedTrack={reviewStep > 1}
                            loading={loading}
                            currentTrack={currentTrack}
                            queuedTrack={queuedTrack}
                            isPlaying={isPlaying}
                            listened={listened}
                            onLikeOrDislike={async (val) =>
                                await likeOrDislike(val)
                            }
                            onPlayButtonClicked={() => play()}
                            onAudioPlay={() => {
                                setIsPlaying(true);
                            }}
                            onListened={() => setListened(true)}
                            ref={audioElementRef}
                        />
                    ) : (
                        <TrackList tracks={userTracks || []} />
                    )}
                </>
            )}
        </Box>
    );
};

export default TrackReview;

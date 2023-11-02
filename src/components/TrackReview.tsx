/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import {
    Badge,
    Box,
    Center,
    Flex,
    IconButton,
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
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import SettingsIcon from "@mui/icons-material/Settings";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const [preferredGenre, setPreferredGenre] = useLocalStorage(
        "preferredGenre",
        "all"
    );
    const [preferredYear, setPreferredYear] = useLocalStorage(
        "preferredYear",
        "all"
    );
    const [preferredAutoPlay, setPreferredAutoPlay] = useLocalStorage(
        "preferredAutoPlay",
        false
    );
    const [storedTracks, setStoredTracks] = useState<ScrapeTrack[] | null>(
        null
    );
    const toast = useToast();
    const router = useRouter();
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
        if (preferredGenre) {
            setCurrentTrack(null);
            setQueuedTrack(null);
            genreRef.current!.value = preferredGenre;

            if (reviewStep === 1) {
                setLoading(true);
                const from =
                    preferredYear === "all" || !preferredYear
                        ? 1950
                        : preferredYear;
                const to =
                    preferredYear === "all" || !preferredYear
                        ? 2090
                        : Number(preferredYear) + 1;

                (async () => {
                    try {
                        const tracks = await fetchStoredTracks({
                            genre: preferredGenre,
                            startDate: new Date(`${from}-01-01`),
                            endDate: new Date(`${to}-01-01`),
                        });
                        setStoredTracks(tracks);
                    } catch (error) {
                        setLoading(false);
                        showToast({ status: "error" });
                        console.log(error);
                    }
                })();
            } else if (reviewStep > 1 && reviewStep < 4) {
                setLoading(false);
                (async () => {
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
                })();
            }
        }
    }, [preferredGenre, reviewStep, preferredYear, user]);

    useEffect(() => {
        if (trackPlayed || (storedTracks && storedTracks.length > 0)) {
            searchForTrack();
        }
    }, [trackPlayed, storedTracks]);

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
                py={0}
                px={4}
                gap={2}
            >
                <Flex alignItems="center" gap={2}>
                    <IconButton
                        height="40px"
                        transition="height 200ms"
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        aria-label="Search database"
                        icon={
                            settingsOpen ? (
                                <ChevronUpIcon />
                            ) : (
                                <ChevronDownIcon />
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
                            <Box fontWeight="bold">Year</Box>
                            <Box>{preferredYear || "All"}</Box>
                        </Flex>
                        <Flex flexDirection="column" alignItems="center">
                            <Box fontWeight="bold">Autoplay</Box>
                            <Box>{preferredAutoPlay ? "On" : "Off"}</Box>
                        </Flex>
                    </Flex>
                </Flex>
                <ReviewTracksFilters
                    isOpen={settingsOpen}
                    onGenreSelect={async (genre: string) => {
                        setPreferredGenre(genre);
                    }}
                    onYearSelect={async (year) => {
                        setPreferredYear(year);
                    }}
                    selectedYear={preferredYear}
                    selectedGenre={preferredGenre}
                    genres={availableGenres}
                    autoPlay={preferredAutoPlay}
                    onAutoPlayChange={(value) => setPreferredAutoPlay(value)}
                    ref={genreRef}
                />
                <Box position="absolute" right={0}>
                    <IconButton
                        onClick={() => router.push("/settings")}
                        variant="ghost"
                        h={1 / 2}
                        colorScheme="teal"
                        aria-label="Show password"
                        fontSize="3xl"
                        icon={<SettingsIcon fontSize="inherit" />}
                    />
                </Box>
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

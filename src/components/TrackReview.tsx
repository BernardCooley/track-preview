/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
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
import { v4 as uuidv4 } from "uuid";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const [preferredGenre, setPreferredGenre] = useLocalStorage(
        "preferredGenre",
        "All"
    );
    const [preferredYearRange, setPreferredYearRange] = useLocalStorage<{
        from: number;
        to: number;
    }>("preferredYearRange", {
        from: 0,
        to: new Date().getFullYear(),
    });
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
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const { user } = useAuthContext();
    const [trackPlayed, setTrackPlayed] = useState<boolean>(false);
    const [userTracks, setUserTracks] = useState<Track[] | null>(null);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [randomNumber, setRandomNumber] = useState<number>(0);
    const id = "test-toast";
    const [oldValues, setOldValues] = useState<{
        genre: string;
        yearFrom: number;
        yearTo: number;
    }>({
        genre: preferredGenre,
        yearFrom: preferredYearRange.from,
        yearTo: preferredYearRange.to,
    });
    const [filtesToApply, setSetFiltersToApply] = useState<boolean>(false);
    const [trackList, setTrackList] = useState<SearchedTrack[]>([]);
    const trackListLimit = 2;

    useEffect(() => {
        init();
    }, [reviewStep, user]);

    useEffect(() => {
        if (isPlaying && trackList.length < trackListLimit) {
            searchForTrack();
        }
    }, [isPlaying]);

    useEffect(() => {
        setSetFiltersToApply(
            oldValues.genre !== preferredGenre ||
                oldValues.yearFrom !== preferredYearRange.from ||
                oldValues.yearTo !== preferredYearRange.to
        );
    }, [
        preferredGenre,
        preferredYearRange.from,
        preferredYearRange.to,
        settingsOpen,
    ]);

    const init = async () => {
        if (preferredGenre && user?.uid) {
            setTrackList([]);
            genreRef.current!.value = preferredGenre;

            if (reviewStep === 1) {
                setLoading(true);
                try {
                    const tracks = await fetchStoredTracks({
                        genre: preferredGenre,
                        startYear: preferredYearRange.from,
                        endYear: preferredYearRange.to,
                    });
                    setStoredTracks(tracks);

                    const userTracks = await fetchUserTracks({
                        genre: preferredGenre,
                        currentReviewStep: reviewStep,
                        userId: user.uid,
                    });
                    setUserTracks(userTracks);

                    if (!tracks) {
                        setLoading(false);
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
        setOldValues({
            genre: preferredGenre,
            yearFrom: preferredYearRange.from,
            yearTo: preferredYearRange.to,
        });
    };

    useEffect(() => {
        if (trackPlayed || (storedTracks && storedTracks.length > 0)) {
            searchForTrack();
        } else {
            setTrackList([]);
            setLoading(false);
        }
    }, [trackPlayed, storedTracks]);

    useEffect(() => {
        if (!settingsOpen && filtesToApply) {
            init();
        }
    }, [settingsOpen]);

    useEffect(() => {
        if (reviewStep > 1 && reviewStep < 4) {
            if (userTracks && userTracks.length > 0) {
                setTrackList([userTracks[0].searchedTrack]);
            } else {
                setTrackList([]);
            }
        }
    }, [userTracks]);

    useEffect(() => {
        if (trackList[0]) {
            setLoading(false);
            setTrackPlayed(false);
        }

        if (preferredAutoPlay && trackList[0]) {
            play();
            setIsPlaying(true);
        }
    }, [trackList]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

    const showToast = ({ status, title, description }: ToastProps) => {
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
    };

    const searchForTrack = async () => {
        if (storedTracks && storedTracks.length > 0) {
            const rand = Math.floor(
                Math.floor(Math.random() * storedTracks.length)
            );
            setRandomNumber(rand);

            if (
                !userTracks
                    ?.map((track) => track.storedTrackId)
                    .includes(storedTracks[rand].id)
            ) {
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

                if (searchedTrack && trackList.length < trackListLimit) {
                    const track = searchedTrack as SearchedTrack;

                    setTrackList((prev) => {
                        if (prev && prev.length < trackListLimit) {
                            return [...prev, track];
                        } else {
                            return prev;
                        }
                    });
                } else {
                    const newStoredTracks = storedTracks.filter(
                        (track) => track !== storedTracks[rand]
                    );
                    setStoredTracks(newStoredTracks);
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
        const generatedId = uuidv4();
        if (user?.uid && trackList[0] && storedTracks) {
            const newTrack: Track = {
                storedTrackId: storedTracks[randomNumber].id,
                artist: storedTracks[randomNumber].artist,
                furthestReviewStep: like ? reviewStep + 1 : reviewStep,
                currentReviewStep: like ? reviewStep + 1 : 0,
                genre: preferredGenre,
                searchedTrack: trackList[0],
                title: storedTracks[randomNumber].title,
                userId: user.uid,
                id: generatedId,
                purchaseUrl: storedTracks[randomNumber].purchaseUrl,
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
        if (reviewStep === 1) {
            setTrackList((prev) => {
                if (prev && prev.length > 0) {
                    prev.splice(0, 1);
                    return [...prev];
                } else {
                    return [];
                }
            });
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
                        {`Loading new ${preferredGenre} Track...`}
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
                        width={settingsOpen && filtesToApply ? "160px" : "40px"}
                        transition="width 200ms"
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        aria-label="Search database"
                        _hover={{
                            backgroundColor: settingsOpen ? "none" : "gray.300",
                        }}
                        icon={
                            !settingsOpen || !filtesToApply ? (
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
                                {preferredGenre}
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
                    preferredYearRange={preferredYearRange}
                    onConfirm={() => {
                        setSettingsOpen(false);
                    }}
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
                    selectedGenre={preferredGenre}
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
                {reviewStep < 4 ? (
                    <>
                        {trackList[0] && (
                            <TrackReviewCard
                                trackList={trackList}
                                ignoreQueuedTrack={reviewStep > 1}
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
                        {trackList[1] && (
                            <Center mt={[6, 16]}>
                                <Flex direction="column" alignItems="center">
                                    <Text>Up Next</Text>
                                    <Text noOfLines={1} fontWeight="bold">
                                        {trackList[1].artist} -{" "}
                                        {trackList[1].title}
                                    </Text>
                                </Flex>
                            </Center>
                        )}
                    </>
                ) : (
                    <TrackList tracks={(userTracks as Track[]) || []} />
                )}
            </Flex>
        </Box>
    );
};

export default TrackReview;

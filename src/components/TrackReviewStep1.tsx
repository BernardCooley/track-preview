import React, { useCallback, useEffect, useRef, useState } from "react";
import { genres } from "../../data/genres";
import { Box, Flex, IconButton, useToast } from "@chakra-ui/react";
import { useLocalStorage } from "usehooks-ts";
import { StoredTrack, SearchedTrack, Track } from "../../types";
import {
    fetchDeezerTrack,
    fetchITunesTrack,
    fetchSpotifyTrack,
} from "@/bff/bff";
import {
    fetchListenedTracks,
    fetchStoredTracks,
    fetchUserTracks,
} from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewCard from "./TrackReviewCard";
import Loading from "./Loading";
import FilterTags from "./FilterTags";
import { getCurrentYear } from "../../utils";
import { testTracks } from "@/data/testStoredTracks";
import { testUserTracks } from "@/data/testUserTracks";
import FiltersForm, { FormData } from "./FiltersForm";
import TuneIcon from "@mui/icons-material/Tune";
import { storeTrack } from "../../utilRequests";
import { getAllTrackIds } from "../../firebase/utils";

interface Props {
    reviewStep: number;
}

const TrackReviewStep1 = ({ reviewStep }: Props) => {
    const [genre, setPreferredGenre] = useLocalStorage("genre", "All");
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
    const testMode = true;

    useEffect(() => {
        getRandomTrackId();
        init();
    }, [genre, user]);

    interface ToastProps {
        status: "error" | "success" | "info";
        title?: string;
        description?: string;
    }

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

    const getRandomTrackId = async (): Promise<string | null> => {
        try {
            const ids = await getAllTrackIds();
            const randomNumber = Math.floor(
                Math.floor(Math.random() * ids.length)
            );
            return ids[randomNumber];
        } catch (error) {
            return null;
        }
    };

    const init = useCallback(async () => {
        if (genre && user?.uid) {
            setAvailableGenres(genres);
            setLoading(true);

            try {
                const randomId = await getRandomTrackId();

                const storedTracks = testMode
                    ? testTracks.filter((t) => t.genre === genre)
                    : await fetchStoredTracks({
                          genre,
                          startYear: preferredYearRange.from,
                          endYear: preferredYearRange.to,
                          startFromId: randomId,
                      });

                const userTracks = testMode
                    ? testUserTracks
                    : (await fetchUserTracks({
                          genre,
                          userId: user.uid,
                      })) || [];

                // const listenedTracks =
                //     (await fetchListenedTracks({
                //         userId: user.uid,
                //         genre,
                //     })) || [];

                // const reviewStepTracks = listenedTracks?.filter((t) =>
                //     t.reviewSteps.filter(
                //         (s) =>
                //             s.currentReviewStep === reviewStep &&
                //             s.userId === user.uid
                //     )
                // );

                // TODO uncomment when listened tracks is working
                // if (storedTracks && storedTracks.length > 0) {
                //     const uTrackIds = reviewStepTracks.map((t) => t.id);
                //     const filteredStoredTracks = storedTracks.filter(
                //         (t) => !uTrackIds.includes(t.id)
                //     );

                //     if (filteredStoredTracks.length > 2) {
                //         setTracks(filteredStoredTracks);
                //     } else {
                //         init();
                //     }
                // } else {
                //     init();
                // }

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
    }, [genre, user, preferredYearRange, testMode]);

    useEffect(() => {
        if (tracks.length > 1) {
            if (!currentTrack) {
                searchTrack(tracks[0], true);
            } else if (!queuedTrack) {
                searchTrack(tracks[1], false);
            }
        } else {
            setCurrentTrack(null);
            setQueuedTrack(null);
            init();
        }
    }, [tracks, currentTrack, queuedTrack]);

    useEffect(() => {
        if (currentTrack && preferredAutoPlay && !isPlaying) {
            play();
        }
    }, [currentTrack]);

    const searchTrack = async (track: StoredTrack, isCurrentTrack: boolean) => {
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

    const likeOrDislike = async (like: boolean) => {
        setIsPlaying(false);
        try {
            storeTrack(like, reviewStep, user, currentTrack, tracks);
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

    const applyFilters = async (formData: FormData) => {
        setCurrentTrack(null);
        setTracks([]);
        setQueuedTrack(null);
        setSettingsOpen(false);
        setPreferredGenre(formData.genre);
        setPreferredYearRange({
            from: formData.yearFrom,
            to: formData.yearTo,
        });
        setPreferredAutoPlay(formData.autoplay);
    };

    return (
        <Box h="90vh" position="relative">
            {loading && <Loading />}
            <Flex
                w={[settingsOpen ? "auto" : "full", "full"]}
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pt={2}
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
                    {!settingsOpen && (
                        <IconButton
                            rounded="full"
                            onClick={() => setSettingsOpen((prev) => !prev)}
                            variant="ghost"
                            colorScheme="teal"
                            aria-label="settings page"
                            fontSize="3xl"
                            icon={<TuneIcon fontSize="inherit" />}
                        />
                    )}

                    {!settingsOpen && (
                        <FilterTags
                            settingsOpen={settingsOpen}
                            genre={genre}
                            preferredYearRange={preferredYearRange}
                            preferredAutoPlay={preferredAutoPlay}
                        />
                    )}
                </Flex>
                <FiltersForm
                    onSettingsToggle={() => setSettingsOpen((prev) => !prev)}
                    settingsOpen={settingsOpen}
                    autoplay={preferredAutoPlay}
                    showDates={true}
                    isOpen={settingsOpen}
                    genre={genre}
                    genres={availableGenres}
                    preferredYearRange={preferredYearRange}
                    onApplyFilters={(formData) => applyFilters(formData)}
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

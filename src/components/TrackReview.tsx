/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { styles } from "../../data/genres";
import { Badge, Box, Center } from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import TrackList from "./TrackList";
import { useLocalStorage } from "usehooks-ts";
import { SearchedTrack, Track } from "../../types";
import { useTracksContext } from "../../Contexts/TracksContext";
import {
    fetchDeezerTrack,
    fetchDiscogsReleaseIds,
    fetchITunesTrack,
} from "@/bff/bff";
import {
    getStoredTracks,
    saveNewTrack,
    searchStoredTracks,
    updateTrackReviewStep,
} from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getReleaseTrack, getSpotifyTrack } from "../../functions";
import TrackReviewCard from "./TrackReviewCard";
import { removeBracketedText } from "../../utils";

interface Props {
    reviewStep: number;
}

const TrackReview = ({ reviewStep }: Props) => {
    const { tracks } = useTracksContext();
    const [availableGenres] = useState<string[]>(styles);
    const [loading, setLoading] = useState<boolean>(false);
    const [preferredGenre, setPreferredGenre] = useLocalStorage(
        "preferredGenre",
        "all"
    );
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const genreRef = useRef<HTMLSelectElement>(null);
    const [currentTrack, setCurrentTrack] = useState<SearchedTrack | null>();
    const [queuedTrack, setQueuedTrack] = useState<SearchedTrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [releaseIds, setReleaseIds] = useState<number[] | null>([]);
    const { userId } = useAuthContext();
    const [trackPlayed, setTrackPlayed] = useState<boolean>(false);
    const [spinnerProgress, setSpinnerProgress] = useState<number>(0);
    const [interval, updateInterval] = useState<NodeJS.Timeout | null>(null);
    let directionUp = true;
    const [currentReleaseId, setCurrentReleaseId] = useState<number | null>(
        null
    );
    const [userTracks, setUserTracks] = useState<Track[] | null>(null);

    useEffect(() => {
        if (reviewStep === 1) {
            const interval = setInterval(
                () =>
                    setSpinnerProgress((prev) => {
                        if (directionUp) {
                            if (prev === 100) {
                                directionUp = false;
                                return 100;
                            } else {
                                return prev + 1;
                            }
                        } else {
                            if (prev === 0) {
                                directionUp = true;
                                return 0;
                            } else {
                                return prev - 1;
                            }
                        }
                    }),
                5
            );
            updateInterval(interval);
        }

        if (preferredGenre) {
            setLoading(true);
            setCurrentTrack(null);
            setQueuedTrack(null);
            genreRef.current!.value = preferredGenre;

            if (reviewStep === 1) {
                getDiscogsReleaseIds(preferredGenre);
            } else if (reviewStep > 1 && reviewStep < 4) {
                (async () => {
                    if (userId) {
                        const tracks = await getStoredTracks({
                            genre: preferredGenre,
                            currentReviewStep: reviewStep,
                            userId,
                        });
                        setUserTracks(tracks);
                    }
                })();
            }
        }
    }, [preferredGenre, reviewStep]);

    useEffect(() => {
        if (releaseIds && releaseIds.length > 0) {
            getDiscogsReleaseTrack(releaseIds);
        }
    }, [releaseIds]);

    useEffect(() => {
        if (trackPlayed && releaseIds && releaseIds.length > 0) {
            getDiscogsReleaseTrack(releaseIds);
        }
    }, [trackPlayed]);

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
            clearInterval(interval as NodeJS.Timeout);
            setLoading(false);
            setListened(false);
        }

        if (autoPlay && currentTrack) {
            play();
        }
    }, [currentTrack]);

    const play = () => {
        setTrackPlayed(true);
        audioElementRef.current?.play();
    };

    const getDiscogsReleaseIds = async (genre: string | null) => {
        const ids = await fetchDiscogsReleaseIds({
            selectedGenre: genre,
            pageNumber: Math.floor(Math.random() * 200),
        });

        setReleaseIds(ids);

        if (ids && ids.length > 0) {
            getDiscogsReleaseTrack(ids);
        } else {
            // TODO: get releaseIds again
            console.error(`Cant find any releaseIds for genre: ${genre}`);
        }
    };

    const getDiscogsReleaseTrack = async (releaseIds: number[]) => {
        getReleaseTrack({
            releaseIds,
            onSuccess: async (val) => {
                setCurrentReleaseId(val.releaseTrack.releaseId);
                const storedTrack = await searchStoredTracks({
                    track: val.releaseTrack,
                });

                if (storedTrack?.userId === userId) {
                    setReleaseIds(
                        releaseIds.filter(
                            (id) => id !== val.releaseTrack.releaseId
                        )
                    );
                } else {
                    let searchedTrack;

                    searchedTrack = await fetchITunesTrack({
                        trackToSearch: `${removeBracketedText(
                            val.releaseTrack.artist
                        )} - ${val.releaseTrack.title}`,
                    });

                    if (!searchedTrack) {
                        searchedTrack = await fetchDeezerTrack({
                            trackToSearch: `${val.releaseTrack.artist} - ${val.releaseTrack.title}`,
                        });
                    }

                    if (!searchedTrack) {
                        searchedTrack = await getSpotifyTrack({
                            trackToSearch: val.releaseTrack,
                            onTrackFound: () => {},
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
                        setReleaseIds(
                            releaseIds.filter(
                                (id) => id !== val.releaseTrack.releaseId
                            )
                        );
                    }
                }
            },
            onFail: (releaseId) => {
                setReleaseIds(releaseIds.filter((item) => item !== releaseId));
            },
        });
    };

    const storeTrack = async (like: boolean) => {
        if (userId && currentTrack) {
            const newTrack: Track = {
                artist: currentTrack.artist,
                discogsReleaseId: currentReleaseId!,
                furthestReviewStep: like ? reviewStep + 1 : reviewStep,
                currentReviewStep: like ? reviewStep + 1 : 0,
                genre: preferredGenre,
                searchedTrack: currentTrack,
                title: currentTrack.title,
                userId: userId,
                id: "",
            };

            await saveNewTrack({ track: newTrack });
        }
    };

    const likeOrDislike = async (like: boolean) => {
        setTrackPlayed(false);

        if (reviewStep === 1) {
            setCurrentTrack(queuedTrack);
            setQueuedTrack(null);
            storeTrack(like);

            if (releaseIds) {
                setReleaseIds(
                    releaseIds.filter((id) => id !== currentReleaseId)
                );
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
                        opacity={spinnerProgress / 100}
                        variant="outline"
                        colorScheme="green"
                        fontSize={["24px", "36px"]}
                        px={4}
                    >
                        {`Loading new ${preferredGenre} Track...`}
                    </Badge>
                </Center>
            )}
            <ReviewTracksFilters
                onGenreSelect={async (genre) => {
                    setPreferredGenre(genre);
                }}
                selectedGenre={preferredGenre}
                genres={availableGenres}
                autoPlay={autoPlay}
                onAutoPlayChange={(value) => setAutoPlay(value)}
                ref={genreRef}
            />
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
                        <TrackList tracks={tracks || []} />
                    )}
                </>
            )}
        </Box>
    );
};

export default TrackReview;

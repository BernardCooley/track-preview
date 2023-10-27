/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { styles } from "../../data/genres";
import { Badge, Box, Center } from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import TrackList from "./TrackList";
import { useLocalStorage } from "usehooks-ts";
import { ReleaseTrack, SpotifyTrack, UserTrack } from "../../types";
import { useTracksContext } from "../../Contexts/TracksContext";
import { fetchDiscogsReleaseIds } from "@/bff/bff";
import { fetchUserData, addUserTrack } from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getReleaseTrack, getSpotifyTrack } from "../../functions";
import TrackReviewCard from "./TrackReviewCard";

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
    const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>();
    const [queuedTrack, setQueuedTrack] = useState<SpotifyTrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const [releaseIds, setReleaseIds] = useState<number[] | null>([]);
    const [userTracks, setUserTracks] = useState<UserTrack[] | null>([]);
    const { userId } = useAuthContext();
    const [trackPlayed, setTrackPlayed] = useState<boolean>(false);
    const [spinnerProgress, setSpinnerProgress] = useState<number>(0);
    const [interval, updateInterval] = useState<NodeJS.Timeout | null>(null);
    let directionUp = true;
    const [releaseTrack, setReleaseTrack] = useState<ReleaseTrack | null>(null);

    useEffect(() => {
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

        if (preferredGenre) {
            setLoading(true);
            setCurrentTrack(null);
            setQueuedTrack(null);
            genreRef.current!.value = preferredGenre;
            getDiscogsReleaseIds(preferredGenre);
        }
    }, [preferredGenre]);

    useEffect(() => {
        if (releaseIds && releaseIds.length > 0) {
            getDiscogsReleaseTrack(userTracks, releaseIds);
        }
    }, [releaseIds]);

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

    useEffect(() => {
        if (trackPlayed && releaseIds && releaseIds.length > 0) {
            getDiscogsReleaseTrack(userTracks, releaseIds);
        }
    }, [trackPlayed]);

    const getDiscogsReleaseIds = async (genre: string | null) => {
        const ids = await fetchDiscogsReleaseIds({
            selectedGenre: genre,
            pageNumber: Math.floor(Math.random() * 200),
        });

        setReleaseIds(ids);
        const uTracks = await getUserTracks();
        setUserTracks(uTracks);

        if (ids && ids.length > 0) {
            getDiscogsReleaseTrack(uTracks, ids);
        } else {
            // TODO: get releaseIds again
            console.error(`Cant find any releaseIds for genre: ${genre}`);
        }
    };

    const getUserTracks = async () => {
        const uData = await fetchUserData({ userId: userId });
        if (uData && uData.tracks) return uData.tracks;
        return [];
    };

    const getDiscogsReleaseTrack = async (
        userTracks: UserTrack[] | null,
        releaseIds: number[]
    ) => {
        getReleaseTrack({
            releaseIds,
            onSuccess: async (val) => {
                setReleaseTrack(val.releaseTrack);
                const alreadyHeardTrack =
                    userTracks &&
                    userTracks.filter(
                        (t) =>
                            t.artist === val.releaseTrack.artist &&
                            t.title === val.releaseTrack.title
                    ).length > 0;

                if (alreadyHeardTrack) {
                    setReleaseIds(
                        releaseIds.filter(
                            (id) => id !== val.releaseTrack.releaseId
                        )
                    );
                } else {
                    const spotifyTrack = await getSpotifyTrack({
                        trackToSearch: val.releaseTrack,
                        selectedGenre: preferredGenre,
                        onTrackFound: () => setLoading(false),
                    });

                    if (spotifyTrack) {
                        if (!currentTrack) {
                            setCurrentTrack(spotifyTrack);
                        } else if (!queuedTrack) {
                            setQueuedTrack(spotifyTrack);
                        }
                    } else {
                        storeTrack(false);
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
        if (userId && currentTrack && releaseTrack) {
            const newTrack: UserTrack = {
                id: currentTrack.id,
                step: like ? reviewStep + 1 : 0,
                furthestStep: like ? reviewStep + 1 : reviewStep,
                genre: currentTrack.genre,
                artist: releaseTrack.artist,
                title: releaseTrack.title,
                discogsReleaseId: releaseTrack.releaseId,
            };

            await addUserTrack({
                collection: "users",
                docId: userId,
                track: newTrack,
            });

            return newTrack;
        }

        return null;
    };

    const likeOrDislike = async (like: boolean) => {
        setTrackPlayed(false);

        const newTrack = await storeTrack(like);

        if (userTracks && newTrack) {
            const updatedUserTracks = [...userTracks, newTrack];
            setUserTracks(updatedUserTracks);
        }

        setCurrentTrack(queuedTrack);
        setQueuedTrack(null);
        setListened(false);

        if (releaseIds) {
            setReleaseIds(
                releaseIds.filter(
                    (id) => id !== currentTrack?.release.discogsReleaseId
                )
            );
        }
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

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { styles } from "../../data/genres";
import {
    Badge,
    Box,
    Card,
    CardBody,
    CardHeader,
    Center,
    Flex,
    Heading,
    IconButton,
    Link,
    Text,
} from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TrackList from "./TrackList";
import { useLocalStorage } from "usehooks-ts";
import { ReleaseTrack, SpotifyTrack, UserTrack } from "../../types";
import { useTracksContext } from "../../Contexts/TracksContext";
import { fetchDiscogsReleaseIds } from "@/bff/bff";
import { fetchUserData, addUserTrack } from "../../firebase/firebaseRequests";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getReleaseTrack, getSpotifyTrack } from "../../functions";

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
    const audioElement = useRef<HTMLAudioElement>(null);
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
    }, []);

    useEffect(() => {
        if (preferredGenre) {
            setLoading(true);
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
        audioElement.current?.play();
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
                        {`Loading new Track...`}
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
                        <Card
                            size="md"
                            h="full"
                            opacity={loading ? "0.4" : "1"}
                            mt="35px"
                        >
                            <CardHeader>
                                <Heading size="md">
                                    <Link
                                        href={currentTrack.release.url}
                                        isExternal
                                    >
                                        <Flex
                                            alignItems="center"
                                            direction="column"
                                            position="relative"
                                        >
                                            <Text
                                                fontSize="3xl"
                                                fontWeight="bold"
                                            >
                                                {currentTrack.artist}
                                            </Text>
                                            <Flex gap={1}>
                                                <Text fontSize="xl">
                                                    {currentTrack.title}
                                                </Text>
                                                <OpenInNewIcon />
                                            </Flex>
                                        </Flex>
                                    </Link>
                                </Heading>
                            </CardHeader>
                            <CardBody
                                w="full"
                                h="full"
                                bgImage={currentTrack.thumbnail}
                                bgSize="cover"
                            >
                                <Flex
                                    direction="column"
                                    h="full"
                                    justifyContent="space-between"
                                >
                                    <Flex w="full" pb={10} h="full">
                                        {isPlaying ? (
                                            <>
                                                <IconButton
                                                    isDisabled={!listened}
                                                    onClick={async () =>
                                                        likeOrDislike(false)
                                                    }
                                                    variant="ghost"
                                                    w="full"
                                                    h="full"
                                                    colorScheme="red"
                                                    aria-label="Call Segun"
                                                    fontSize={[
                                                        "100px",
                                                        "200px",
                                                    ]}
                                                    icon={
                                                        <ThumbDownIcon fontSize="inherit" />
                                                    }
                                                />
                                                <IconButton
                                                    isDisabled={!listened}
                                                    onClick={async () =>
                                                        likeOrDislike(true)
                                                    }
                                                    variant="ghost"
                                                    w="full"
                                                    h="full"
                                                    colorScheme="green"
                                                    aria-label="Call Segun"
                                                    fontSize={[
                                                        "100px",
                                                        "200px",
                                                    ]}
                                                    icon={
                                                        <ThumbUpIcon fontSize="inherit" />
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <IconButton
                                                onClick={play}
                                                variant="ghost"
                                                w="full"
                                                h="full"
                                                colorScheme="black"
                                                aria-label="Call Segun"
                                                fontSize={["100px", "200px"]}
                                                icon={
                                                    <PlayArrowIcon fontSize="inherit" />
                                                }
                                            />
                                        )}
                                    </Flex>

                                    <Flex direction="column" h="auto">
                                        <Flex w="full">
                                            <audio
                                                onPlay={() =>
                                                    setIsPlaying(true)
                                                }
                                                onTimeUpdate={(e) => {
                                                    if (
                                                        e.currentTarget
                                                            .currentTime > 2 &&
                                                        queuedTrack
                                                    ) {
                                                        setListened(true);
                                                    }
                                                }}
                                                ref={audioElement}
                                                style={{
                                                    width: "100%",
                                                }}
                                                src={currentTrack.previewUrl}
                                                controls
                                            />
                                        </Flex>
                                    </Flex>
                                </Flex>
                            </CardBody>
                        </Card>
                    ) : (
                        <TrackList tracks={tracks || []} />
                    )}
                </>
            )}
        </Box>
    );
};

export default TrackReview;

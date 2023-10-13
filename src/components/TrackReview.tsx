/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { styles } from "../../data/genres";
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Link,
    Spinner,
    Text,
} from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TrackList from "./TrackList";
import { useLocalStorage } from "usehooks-ts";
import { ITrack, UserTrack } from "../../types";
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
        "N/A"
    );
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const genreRef = useRef<HTMLSelectElement>(null);
    const [currentTrack, setCurrentTrack] = useState<ITrack | null>();
    const [queuedTrack, setQueuedTrack] = useState<ITrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const audioElement = useRef<HTMLAudioElement>(null);
    const [releaseIds, setReleaseIds] = useState<number[]>([]);
    const [userTracks, setUserTracks] = useState<UserTrack[] | null>(null);
    const { userId } = useAuthContext();
    const [trackPlayed, setTrackPlayed] = useState<boolean>(false);

    useEffect(() => {
        if (preferredGenre) {
            setLoading(true);
            setUserTracks(null);
            genreRef.current!.value = preferredGenre;
            getDiscogsReleaseIds(preferredGenre);
        }
    }, [preferredGenre]);

    useEffect(() => {
        if (releaseIds && releaseIds.length > 0) {
            if (userTracks) {
                getDiscogsReleaseTrack();
            } else {
                getUserTracks();
            }
        } else {
            getDiscogsReleaseIds(preferredGenre);
        }
    }, [releaseIds]);

    useEffect(() => {
        setIsPlaying(false);

        if (currentTrack) {
            setTrackPlayed(false);
            setLoading(false);
            setListened(false);
        }

        if (autoPlay && currentTrack) {
            play();
        }
    }, [currentTrack]);

    useEffect(() => {
        if (trackPlayed) {
            getDiscogsReleaseTrack();
        }
    }, [trackPlayed]);

    const getDiscogsReleaseTrack = async () => {
        if (userTracks) {
            if (releaseIds && releaseIds.length > 0) {
                getReleaseTrack({
                    releaseIds,
                    onSuccess: async (val) => {
                        const spotifyTrack = await getSpotifyTrack({
                            trackToSearch: val,
                            selectedGenre: preferredGenre || "N/A",
                            onTrackFound: () => setLoading(false),
                        });

                        if (spotifyTrack) {
                            if (!currentTrack) {
                                setCurrentTrack(spotifyTrack);
                            } else if (!queuedTrack) {
                                setQueuedTrack(spotifyTrack);
                            }
                        } else {
                            spliceReleaseIds();
                        }
                    },
                    onFail: (val) => setReleaseIds(val),
                });
            } else {
                getDiscogsReleaseIds(preferredGenre);
            }
        }
    };

    const spliceReleaseIds = () => {
        setReleaseIds((prev) => prev.splice(1));
    };

    const getUserTracks = async () => {
        const uData = await fetchUserData({ userId: userId });
        if (uData) {
            setUserTracks(uData.tracks || []);
        }
    };

    const getDiscogsReleaseIds = async (genre: string) => {
        setReleaseIds(
            (await fetchDiscogsReleaseIds({
                selectedGenre: genre,
                pageNumber: Math.floor(Math.random() * 200),
            })) || []
        );
    };

    const play = () => {
        audioElement.current?.play();
        setTrackPlayed(true);
    };

    const likeOrDislike = async (like: boolean) => {
        setTrackPlayed(false);
        if (userId && currentTrack) {
            const newTrack = {
                id: currentTrack.id,
                step: like ? reviewStep + 1 : 0,
                furthestStep: like ? reviewStep + 1 : reviewStep,
                genre: currentTrack.genre,
                artist: currentTrack.artist,
                title: currentTrack.title,
            };

            await addUserTrack({
                collection: "users",
                docId: userId,
                data: newTrack,
            });

            if (userTracks) {
                const updatedUserTracks = [...userTracks, newTrack];
                setUserTracks(updatedUserTracks);
            } else {
                setUserTracks([newTrack]);
            }

            setCurrentTrack(queuedTrack);
            setQueuedTrack(null);
            setListened(false);
        }
    };

    return (
        <Box h="full" position="relative">
            {loading && (
                <Spinner
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    position="absolute"
                    zIndex="100"
                    thickness="6px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                />
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

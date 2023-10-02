/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Text,
    IconButton,
    Box,
    Spinner,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { ITrack, ReleaseTrack } from "../../types";
import { Link } from "@chakra-ui/react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { styles } from "../../data/genres";
import {
    getUserData,
    saveNewDocument,
    updateDocument,
    updateNestedArray,
} from "../../firebase/firebaseRequests";
import {
    fetchDiscogsReleaseIds,
    fetchDiscogsReleaseTracks,
    fetchSpotifyTrack,
} from "@/bff/bff";
import ReviewTracksFilters from "./ReviewTracksFilters";
import { reviewStepMap } from "../../const";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Props {
    reviewStep: number;
}

const TrackReviewCard = ({ reviewStep }: Props) => {
    const [releaseIds, setReleaseIds] = useState<number[] | null>([]);
    const [releaseNumber, setReleaseNumber] = useState<number>(0);
    const [searchTracks, setSearchTracks] = useState<ReleaseTrack[] | null>(
        null
    );
    const audioElement = useRef<HTMLAudioElement>(null);
    const [track, setTrack] = useState<ITrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const genreDropdownRef = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        fetchReleaseIds();
        getPreferredGenre();
    }, []);

    useEffect(() => {
        setIsPlaying(false);

        if (track) {
            setListened(false);
        }

        if (autoPlay && track) {
            audioElement.current?.play();
        }
    }, [track]);

    useEffect(() => {
        setReleaseIds([]);
        fetchReleaseIds();
    }, [reviewStep, selectedGenre]);

    useEffect(() => {
        fetchReleaseTracks();
    }, [releaseNumber, releaseIds]);

    useEffect(() => {
        getSpotifyTrack();
    }, [searchTracks]);

    const getSpotifyTrack = async () => {
        if (searchTracks && searchTracks.length > 0) {
            const randomTrackNumber =
                Math.floor(Math.random() * searchTracks.length) *
                searchTracks.length;
            const spotifyTrack = await fetchSpotifyTrack({
                trackToSearch: searchTracks[randomTrackNumber],
                genre: selectedGenre || "N/A",
                discogsReleaseId: searchTracks[0].releaseId,
            });

            if (spotifyTrack) {
                setLoading(false);
                await saveNewDocument({
                    collection: "spotifyTracks",
                    docId: spotifyTrack.id.toString(),
                    data: spotifyTrack,
                });
                setTrack(spotifyTrack);
            } else {
                setReleaseNumber(releaseNumber + 1);
            }
        }
    };

    const fetchReleaseTracks = async () => {
        if (releaseIds && releaseIds.length > 0) {
            const releaseTracks = await fetchDiscogsReleaseTracks({
                releaseId: releaseIds[releaseNumber],
            });
            if (releaseTracks) {
                setSearchTracks(releaseTracks);
            } else {
                setReleaseNumber(releaseNumber + 1);
            }
        }
    };

    const fetchReleaseIds = async () => {
        setLoading(true);
        const randomPage = Math.floor(Math.random() * 200);
        const ids = await fetchDiscogsReleaseIds({
            selectedGenre: selectedGenre,
            pageNumber: randomPage,
        });
        setReleaseIds(ids);
    };

    const play = () => {
        audioElement.current?.play();
    };

    const likeDislike = async (like: boolean) => {
        if (track) {
            await updateNestedArray({
                collection: "users",
                docId: "bernard_cooley",
                field: like
                    ? reviewStepMap[reviewStep as keyof typeof reviewStepMap]
                          .liked
                    : reviewStepMap[reviewStep as keyof typeof reviewStepMap]
                          .disliked,
                data: track.id,
            });

            fetchReleaseIds();
        }
    };

    const updateGenre = async (genre: string) => {
        setSelectedGenre(genre);
        await updateDocument({
            collection: "users",
            docId: "bernard_cooley",
            field: "preferredGenre",
            data: genre,
        });
    };

    const getPreferredGenre = async () => {
        const user = await getUserData({ userId: "bernard_cooley" });
        if (!user) return;

        if (user.preferredGenre) {
            setSelectedGenre(user.preferredGenre);
            genreDropdownRef.current!.value = user.preferredGenre;
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
                onGenreSelect={(genre) => updateGenre(genre)}
                selectedGenre={selectedGenre}
                genres={styles}
                autoPlay={autoPlay}
                onAutoPlayChange={(value) => setAutoPlay(value)}
                ref={genreDropdownRef}
            />
            {track ? (
                <Card size="md" h="full" opacity={loading ? "0.4" : "1"}>
                    <CardHeader>
                        <Heading size="md">
                            <Link href={track.release.url} isExternal>
                                <Flex
                                    alignItems="center"
                                    direction="column"
                                    position="relative"
                                >
                                    <Text fontSize="3xl" fontWeight="bold">
                                        {track.artist}
                                    </Text>
                                    <Flex gap={1}>
                                        <Text fontSize="xl">{track.title}</Text>
                                        <OpenInNewIcon />
                                    </Flex>
                                </Flex>
                            </Link>
                        </Heading>
                    </CardHeader>
                    <CardBody
                        w="full"
                        h="full"
                        bgImage={track.thumbnail}
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
                                            onClick={() => likeDislike(false)}
                                            variant="ghost"
                                            w="full"
                                            h="full"
                                            colorScheme="red"
                                            aria-label="Call Segun"
                                            fontSize={["100px", "200px"]}
                                            icon={
                                                <ThumbDownIcon fontSize="inherit" />
                                            }
                                        />
                                        <IconButton
                                            isDisabled={!listened}
                                            onClick={() => likeDislike(true)}
                                            variant="ghost"
                                            w="full"
                                            h="full"
                                            colorScheme="green"
                                            aria-label="Call Segun"
                                            fontSize={["100px", "200px"]}
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
                                        onPlay={() => setIsPlaying(true)}
                                        onTimeUpdate={(e) => {
                                            if (
                                                (e.currentTarget.currentTime /
                                                    e.currentTarget.duration) *
                                                    100 >
                                                70
                                            ) {
                                                setListened(true);
                                            }
                                        }}
                                        ref={audioElement}
                                        style={{ width: "100%" }}
                                        src={track.previewUrl}
                                        controls
                                    />
                                </Flex>
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            ) : null}
        </Box>
    );
};

export default TrackReviewCard;

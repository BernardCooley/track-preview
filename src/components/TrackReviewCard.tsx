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
    Switch,
    Box,
    Spinner,
    Select,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { ITrack, ReleaseTrack } from "../../types";
import { Link } from "@chakra-ui/react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Discojs } from "discojs";
import { styles } from "../../data/genres";
import {
    saveNewDocument,
    updateNestedArray,
} from "../../firebase/firebaseRequests";
import {
    fetchDiscogsReleaseIds,
    fetchDiscogsReleaseTracks,
    fetchSpotifyTrack,
} from "@/bff/bff";

interface Props {
    reviewStep: number;
}

const TrackReviewCard = ({ reviewStep }: Props) => {
    const client = new Discojs({
        userToken: process.env.NEXT_PUBLIC_DISCOGS_API_TOKEN,
    });

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
    const [selectedGenre, setSelectedGenre] = useState<string>("Techno");

    useEffect(() => {
        fetchReleaseIds();
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
            const spotifyTrack = await fetchSpotifyTrack({
                trackToSearch: searchTracks[1],
                genre: selectedGenre,
                discogsReleaseId: searchTracks[1].releaseId,
            });

            if (spotifyTrack) {
                setLoading(false);
                await saveNewDocument(
                    "spotifyTracks",
                    spotifyTrack.id.toString(),
                    spotifyTrack
                );
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
        if (selectedGenre) {
            setLoading(true);
            const randomPage = Math.floor(Math.random() * 200);
            const ids = await fetchDiscogsReleaseIds({
                selectedGenre: selectedGenre,
                pageNumber: randomPage,
            });
            setReleaseIds(ids);
        }
    };

    const play = () => {
        audioElement.current?.play();
    };

    const likeDislike = async (like: boolean) => {
        const reviewStepMap = {
            1: {
                liked: "step2ReviewTracks",
                disliked: "step1DislikedTracks",
            },
            2: {
                liked: "step3ReviewTracks",
                disliked: "step2DislikedTracks",
            },
            3: {
                liked: "step4ReviewTracks",
                disliked: "step3DislikedTracks",
            },
        };

        if (track) {
            await updateNestedArray(
                "users",
                "bernard_cooley",
                like
                    ? reviewStepMap[reviewStep as keyof typeof reviewStepMap]
                          .liked
                    : reviewStepMap[reviewStep as keyof typeof reviewStepMap]
                          .disliked,
                track.id
            );

            fetchReleaseIds();
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
            <Flex
                gap={10}
                mb={4}
                position="relative"
                zIndex="100"
                justifyContent="space-between"
                mx={4}
                alignItems="center"
            >
                <Flex alignItems="center" gap={4}>
                    <Text>Style:</Text>
                    <Select
                        variant="outline"
                        placeholder="Select option"
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        defaultValue={selectedGenre}
                    >
                        {styles.map((style) => (
                            <option key={style} value={style}>
                                {style}
                            </option>
                        ))}
                    </Select>
                </Flex>
                <Flex direction="row" mt={4} gap={4}>
                    <Text>Autoplay </Text>
                    <Switch
                        isChecked={autoPlay}
                        onChange={(e) => {
                            setAutoPlay(e.target.checked);
                        }}
                        colorScheme="teal"
                        size="lg"
                    />
                </Flex>
            </Flex>
            {track ? (
                <Card size="md" h="full" opacity={loading ? "0.4" : "1"}>
                    <CardHeader>
                        <Heading size="md">
                            <Link href={track.previewUrl} isExternal>
                                <Flex alignItems="center" direction="column">
                                    <Text fontSize="3xl" fontWeight="bold">
                                        {track.artist}
                                    </Text>
                                    <Text fontSize="xl">{track.title}</Text>
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

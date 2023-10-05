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
import ReviewTracksFilters from "./ReviewTracksFilters";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { LikeDislikeProps, likeDislike } from "../../functions";
import {
    fetchStoredSpotifyTracks,
    fetchUserData,
    getReviewStepTracks,
    updateDocument,
} from "../../firebase/firebaseRequests";
import { DocumentData } from "firebase/firestore";
import { useAuthContext } from "../../Contexts/AuthContext";

interface Props {
    reviewStep: number;
}

const TrackReviewCard = ({ reviewStep }: Props) => {
    const { userData, updateUserData, userId } = useAuthContext();
    const [releaseIds, setReleaseIds] = useState<number[]>([]);
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
    const [spotifyNotFoundTracks, setSpotifyNotFoundTracks] = useState<
        ReleaseTrack[] | null
    >(null);
    const [storedSpotifyTracks, setStoredSpotifyTracks] = useState<
        ITrack[] | null
    >([]);
    const storedTracksLimit = 50;
    const [spotifyLastDoc, setSpotifyLastDoc] = useState<DocumentData | null>(
        null
    );

    useEffect(() => {
        (async () => {
            if (userData) {
                getPreferredGenre();
            }

            // setReleaseIds(
            //     (await getUninteractedTracks({
            //         userData: userData,
            //         onTracksNotFound: () =>
            //             getDiscogsReleaseIds({
            //                 onSearchStart: () => setLoading(true),
            //                 selectedGenre: genre || "N/A",
            //             }),
            //     })) || []
            // );
        })();
    }, [userData]);

    useEffect(() => {
        setLoading(true);
        if (selectedGenre) {
            if (reviewStep === 1) {
                refetchStoredSpotifyTracks();
            } else {
                (async () => {
                    setStoredSpotifyTracks(
                        (await getReviewStepTracks({ userId, reviewStep })) ||
                            []
                    );
                    setLoading(false);
                })();
            }
        }
    }, [reviewStep, selectedGenre]);

    useEffect(() => {
        if (storedSpotifyTracks) {
            setTrack(storedSpotifyTracks[0]);
        }
    }, [storedSpotifyTracks]);

    useEffect(() => {
        setIsPlaying(false);

        if (track) {
            setLoading(false);
            setListened(false);
        }

        if (autoPlay && track) {
            play();
        }
    }, [track]);

    const refetchStoredSpotifyTracks = async (lastDoc?: DocumentData) => {
        setLoading(true);

        const spTracks = await fetchStoredSpotifyTracks({
            lim: storedTracksLimit,
            genre: selectedGenre || "N/A",
            lastDoc: lastDoc || null,
            userId,
        });

        if (spTracks) {
            setStoredSpotifyTracks(spTracks.tracks);
            setSpotifyLastDoc(spTracks.lastDoc);

            setLoading(false);
            if (spTracks.tracks.length === 0) {
                refetchStoredSpotifyTracks(spTracks.lastDoc);
            }
        } else {
            setLoading(false);
            setStoredSpotifyTracks(null);
            setTrack(null);
            updateUserData(await fetchUserData({ userId: userId }));
            // Get discogs release ids here to search for more tracks
        }
    };

    // useEffect(() => {
    //     getReleaseTracks({
    //         releaseIds,
    //         releaseNumber,
    //         onSuccess: (val) => setSearchTracks(val),
    //         onFail: (val) => setReleaseNumber(val + 1),
    //     });
    // }, [releaseNumber, releaseIds]);

    // useEffect(() => {
    //     (async () => {
    //         setTrack(
    //             await getSpotifyTrack({
    //                 trackToSearch: searchTracks,
    //                 spotifyNotFoundTracks,
    //                 selectedGenre: selectedGenre || "N/A",
    //                 onTrackNotFound: () => setReleaseNumber(releaseNumber + 1),
    //                 onTrackFound: () => setLoading(false),
    //                 onStartSearch: () => setLoading(true),
    //             })
    //         );
    //     })();
    // }, [searchTracks]);

    const play = () => {
        audioElement.current?.play();
    };

    const getPreferredGenre = () => {
        if (userData?.preferredGenre) {
            setSelectedGenre(userData.preferredGenre);
            genreDropdownRef.current!.value = userData.preferredGenre;
        } else {
            setSelectedGenre("N/A");
        }
    };

    const getLikeDislikeProps = (likeOrDislike: boolean): LikeDislikeProps => {
        return {
            userId,
            track: track || null,
            like: likeOrDislike,
            reviewStep,
            storedSpotifyTracks,
            onMoreStoredTracks: (val: ITrack[]) => setStoredSpotifyTracks(val),
            onNoMoreStoredTracks: () =>
                refetchStoredSpotifyTracks(spotifyLastDoc || undefined),
        };
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
                    setSelectedGenre(genre);
                    if (userId) {
                        await updateDocument({
                            collection: "users",
                            docId: userId,
                            field: "preferredGenre",
                            data: genre,
                        });
                    }
                }}
                selectedGenre={selectedGenre}
                genres={styles}
                autoPlay={autoPlay}
                onAutoPlayChange={(value) => setAutoPlay(value)}
                ref={genreDropdownRef}
            />
            {track ? (
                <Card
                    size="md"
                    h="full"
                    opacity={loading ? "0.4" : "1"}
                    mt="35px"
                >
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
                                            onClick={() =>
                                                likeDislike(
                                                    getLikeDislikeProps(false)
                                                )
                                            }
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
                                            onClick={() =>
                                                likeDislike(
                                                    getLikeDislikeProps(true)
                                                )
                                            }
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
                                                e.currentTarget.currentTime > 2
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

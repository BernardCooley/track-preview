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
import { ITrack, ReleaseTrack, UserTrack } from "../../types";
import { Link } from "@chakra-ui/react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { styles } from "../../data/genres";
import ReviewTracksFilters from "./ReviewTracksFilters";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getSpotifyTrack } from "../../functions";
import { fetchUserData } from "../../firebase/firebaseRequests";
import { DocumentData } from "firebase/firestore";
import { useAuthContext } from "../../Contexts/AuthContext";
import { removeDuplicates } from "../../utils";
import { useTracksContext } from "../../Contexts/TracksContext";
import TrackList from "./TrackList";
import { useLocalStorage } from "usehooks-ts";

interface Props {
    reviewStep: number;
}

const TrackReviewCard = ({ reviewStep }: Props) => {
    const [preferredGenre, setPreferredGenre] = useLocalStorage(
        "preferredGenre",
        "N/A"
    );
    const { tracks, updateTracks } = useTracksContext();
    const { userData, updateUserData, userId } = useAuthContext();
    const [releaseIds, setReleaseIds] = useState<number[] | null>([]);
    const [releaseNumber, setReleaseNumber] = useState<number>(0);
    const [searchTracks, setSearchTracks] = useState<ReleaseTrack | null>(null);
    const audioElement = useRef<HTMLAudioElement>(null);
    const [track, setTrack] = useState<ITrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const genreRef = useRef<HTMLSelectElement>(null);
    const [spotifyNotFoundTracks, setSpotifyNotFoundTracks] = useState<
        ReleaseTrack[] | []
    >([]);
    const storedTracksLimit = 50;
    const [spotifyLastDoc, setSpotifyLastDoc] = useState<DocumentData | null>(
        null
    );
    const [userLastDoc, setUserLastDoc] = useState<DocumentData | null>(null);
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [searchingDiscogs, setSearchingDiscogs] = useState<boolean>(false);

    useEffect(() => {
        getAvailableGrnres();
    }, [reviewStep]);

    useEffect(() => {
        if (tracks) {
            setTrack(tracks[0]);
        }
    }, [tracks]);

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

    useEffect(() => {
        (async () => {
            setTrack(
                await getSpotifyTrack({
                    trackToSearch: searchTracks,
                    selectedGenre: selectedGenre || "N/A",
                    onTrackFound: () => setLoading(false),
                })
            );
        })();
    }, [searchTracks]);

    const getPreferredGenre = async (availableGenres: string[]) => {
        const currentGenre = availableGenres.includes(preferredGenre)
            ? preferredGenre
            : availableGenres[0];

        setTimeout(() => {
            setSelectedGenre(currentGenre);
            genreRef.current!.value = currentGenre;
        }, 100);
    };

    const getAvailableGrnres = async () => {
        // Other functions depend on getting user data from here - do not delete
        const uData = await fetchUserData({ userId: userId });
        updateUserData(uData);

        if (uData) {
            if (reviewStep === 1) {
                setAvailableGenres(styles);
                getPreferredGenre(styles);
            } else {
                const allGenres =
                    uData.tracks
                        ?.filter(
                            (track: UserTrack) => track.step === reviewStep
                        )
                        .map((t) => t.genre) || [];
                if (allGenres) {
                    setAvailableGenres(removeDuplicates(allGenres));
                    getPreferredGenre(removeDuplicates(allGenres));
                }
            }
        }
    };

    const play = () => {
        audioElement.current?.play();
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
                    setPreferredGenre(genre);
                }}
                selectedGenre={selectedGenre}
                genres={availableGenres}
                autoPlay={autoPlay}
                onAutoPlayChange={(value) => setAutoPlay(value)}
                ref={genreRef}
            />
            {track && (
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
                                    <Link href={track.release.url} isExternal>
                                        <Flex
                                            alignItems="center"
                                            direction="column"
                                            position="relative"
                                        >
                                            <Text
                                                fontSize="3xl"
                                                fontWeight="bold"
                                            >
                                                {track.artist}
                                            </Text>
                                            <Flex gap={1}>
                                                <Text fontSize="xl">
                                                    {track.title}
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
                                                    onClick={async () => {}}
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
                                                    onClick={async () => {}}
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
                                                            .currentTime > 2
                                                    ) {
                                                        setListened(true);
                                                    }
                                                }}
                                                ref={audioElement}
                                                style={{
                                                    width: "100%",
                                                }}
                                                src={track.previewUrl}
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

export default TrackReviewCard;

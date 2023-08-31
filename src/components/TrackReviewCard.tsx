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
    Stack,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { ITrack } from "../../types";
import { Link } from "@chakra-ui/react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import {
    collection,
    doc,
    limit,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseInit";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface Props {
    reviewStep: number;
}

const TrackReviewCard = ({ reviewStep }: Props) => {
    const audioElement = useRef<HTMLAudioElement>(null);
    const [track, setTrack] = useState<ITrack | null>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);

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
        let q = query(
            collection(db, "tracks"),
            where("reviewStep", "==", reviewStep),
            limit(1)
        );

        const unsubscribe: any = onSnapshot(q, (querySnapshot) => {
            const tracks: ITrack[] = [];
            querySnapshot.forEach((doc) => {
                const track = { ...doc.data(), id: doc.id } as ITrack;
                tracks.push(track);
            });
            setTrack(tracks[0]);
        });

        return () => {
            unsubscribe();
        };
    }, [reviewStep]);

    const play = () => {
        audioElement.current?.play();
    };

    const likeDislike = async (like: boolean) => {
        if (track) {
            const trackRef = doc(db, "tracks", track.id);
            await updateDoc(trackRef, {
                liked: like,
                reviewStep: like ? reviewStep + 1 : 0,
            });
        }
    };

    return (
        <>
            {track && (
                <Card size="md">
                    <CardHeader>
                        <Heading size="md">
                            <Link href={track.release.url} isExternal>
                                <Flex alignItems="center" direction="column">
                                    <Text fontSize="3xl" fontWeight="bold">
                                        {track.artist}
                                    </Text>
                                    <Text fontSize="xl">{track.title}</Text>
                                </Flex>
                            </Link>
                        </Heading>
                    </CardHeader>
                    <CardBody w="full">
                        <Flex w="full" pb={10}>
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
                                    icon={<PlayArrowIcon fontSize="inherit" />}
                                />
                            )}
                        </Flex>

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
                        <Stack direction="row" mt={4}>
                            <Text>Autoplay </Text>
                            <Switch
                                isChecked={autoPlay}
                                onChange={(e) => {
                                    setAutoPlay(e.target.checked);
                                }}
                                colorScheme="teal"
                                size="lg"
                            />
                        </Stack>
                    </CardBody>
                </Card>
            )}
        </>
    );
};

export default TrackReviewCard;

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardBody,
    Flex,
    IconButton,
    Stack,
    StackDivider,
    Text,
} from "@chakra-ui/react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Track } from "../../types";
import { useTrackContext } from "../../context/TrackContext";
import { doc, updateDoc } from "firebase/firestore";
import { fetchUserTracks } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";

const TrackList = () => {
    const { user } = useAuthContext();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [noTracks, setNoTracks] = useState<boolean>(false);

    useEffect(() => {
        init();
    }, [user]);

    const deleteTrack = async (id: string) => {
        // const trackRef = doc(db, "tracks", id);
        //     await updateDoc(trackRef, {
        //         reviewStep: 0,
        //     });
        // updateCurrentlyPlaying(undefined);
    };

    const init = async () => {
        setLoading(true);
        if (user) {
            try {
                const userTracks = await fetchUserTracks({
                    genre: "all",
                    userId: user.uid,
                    reviewStep: 4,
                });

                if (userTracks.length > 0) {
                    setTracks(userTracks);
                } else {
                    setNoTracks(true);
                }

                setLoading(false);
            } catch (error) {
                setNoTracks(true);
                setLoading(false);
            }
        }
    };

    return (
        <Stack
            p={[2, 4, 8]}
            h="full"
            overflowY="scroll"
            divider={<StackDivider />}
            spacing="4"
            css={{
                "&::-webkit-scrollbar": {
                    width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                    width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    background: "lightgray",
                    borderRadius: "24px",
                },
            }}
        >
            {/* {loading && (
                <Loading
                    message={
                        noTracks
                            ? "All done on this step"
                            : "Loading your tracks..."
                    }
                />
            )} */}
            {tracks.map((track) => (
                <Card
                    key={track.searchedTrack.previewUrl}
                    bg={
                        currentlyPlaying === track.searchedTrack.previewUrl
                            ? "lightgrey"
                            : "white"
                    }
                >
                    <CardBody>
                        <Flex
                            gap={8}
                            justifyContent={["center", "space-between"]}
                            direction={["column", "row"]}
                        >
                            <Box>
                                <Text
                                    fontSize={["2xl", "xl", "3xl"]}
                                    fontWeight="bold"
                                >
                                    {track.artist}
                                </Text>
                                <Text fontSize={["xl", "md", "xl"]}>
                                    {track.title}
                                </Text>
                            </Box>
                            <Flex gap={2}>
                                <IconButton
                                    onClick={() => deleteTrack("track.id")}
                                    variant="ghost"
                                    w="full"
                                    h="full"
                                    colorScheme="red"
                                    aria-label="Call Segun"
                                    fontSize={["3xl", "4xl", "5xl"]}
                                    icon={
                                        <DeleteForeverIcon fontSize="inherit" />
                                    }
                                />
                                <IconButton
                                    variant="ghost"
                                    w="full"
                                    h="full"
                                    colorScheme="green"
                                    aria-label="Call Segun"
                                    fontSize={["3xl", "4xl", "5xl"]}
                                    icon={
                                        <ShoppingCartIcon fontSize="inherit" />
                                    }
                                />
                                {currentlyPlaying !==
                                track.searchedTrack.previewUrl ? (
                                    <IconButton
                                        onClick={() =>
                                            updateCurrentlyPlaying(
                                                track.searchedTrack.previewUrl
                                            )
                                        }
                                        variant="ghost"
                                        w="full"
                                        h="full"
                                        colorScheme="black"
                                        aria-label="Call Segun"
                                        fontSize={["3xl", "4xl", "5xl"]}
                                        icon={
                                            <PlayArrowIcon fontSize="inherit" />
                                        }
                                    />
                                ) : (
                                    <IconButton
                                        onClick={() =>
                                            updateCurrentlyPlaying(undefined)
                                        }
                                        variant="ghost"
                                        w="full"
                                        h="full"
                                        colorScheme="black"
                                        aria-label="Call Segun"
                                        fontSize={["3xl", "4xl", "5xl"]}
                                        icon={<StopIcon fontSize="inherit" />}
                                    />
                                )}
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            ))}
        </Stack>
    );
};

export default TrackList;

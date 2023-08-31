import React from "react";
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
import { ITrack } from "../../types";
import { useTrackContext } from "../../context/TrackContext";

interface Props {
    tracks: ITrack[];
}

const TrackList = ({ tracks }: Props) => {
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();

    const deleteTrack = async (id: string) => {
        // await db.collection("tracks").doc(id).delete();
    };

    return (
        <Stack
            p={8}
            h="65vh"
            overflowY="scroll"
            divider={<StackDivider />}
            spacing="4"
        >
            {tracks.map((track) => (
                <Card
                    key={track.previewUrl}
                    bg={
                        currentlyPlaying === track.previewUrl
                            ? "lightgrey"
                            : "white"
                    }
                >
                    <CardBody>
                        <Flex gap={8} justifyContent={['center', "space-between"]} direction={['column', 'row']} >
                            <Box>
                                <Text fontSize={["2xl", "xl", "3xl"]} fontWeight="bold">
                                    {track.artist}
                                </Text>
                                <Text fontSize={["xl", "md", "xl"]}>{track.title}</Text>
                            </Box>
                            <Flex gap={2}>
                                <IconButton
                                    onClick={() => deleteTrack(track.id)}
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
                                    onClick={() =>
                                        updateCurrentlyPlaying(track.previewUrl)
                                    }
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
                                {currentlyPlaying !== track.previewUrl ? (
                                    <IconButton
                                        onClick={() =>
                                            updateCurrentlyPlaying(
                                                track.previewUrl
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

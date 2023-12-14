import {
    Box,
    Card,
    CardBody,
    Flex,
    IconButton,
    Link,
    Text,
} from "@chakra-ui/react";
import React from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Track } from "../../types";

interface Props {
    track: Track;
    currentlyPlaying: string | undefined;
    onTrackDelete: (index: number) => void;
    trackIndex: number;
    onCurrentlyPlayingUpdate: (url: string | undefined) => void;
}

const ListTrack = ({
    track,
    currentlyPlaying,
    onTrackDelete,
    trackIndex,
    onCurrentlyPlayingUpdate,
}: Props) => {
    console.log("🚀 ~ file: ListTrack.tsx:32 ~ track:", track);
    return (
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
                        <Text fontSize={["2xl", "xl", "3xl"]} fontWeight="bold">
                            {track.artist}
                        </Text>
                        <Text fontSize={["xl", "md", "xl"]}>{track.title}</Text>
                    </Box>
                    <Flex gap={2}>
                        <IconButton
                            onClick={() => onTrackDelete(trackIndex)}
                            variant="ghost"
                            w="full"
                            h="full"
                            colorScheme="red"
                            aria-label="Call Segun"
                            fontSize={["3xl", "4xl", "5xl"]}
                            icon={<DeleteForeverIcon fontSize="inherit" />}
                        />
                        <Link href={track.purchaseUrl} isExternal>
                            <IconButton
                                onClick={() => {}}
                                className={track.purchaseUrl}
                                variant="ghost"
                                w="full"
                                h="full"
                                colorScheme="green"
                                aria-label="Call Segun"
                                fontSize={["3xl", "4xl", "5xl"]}
                                icon={<ShoppingCartIcon fontSize="inherit" />}
                            />
                        </Link>
                        {currentlyPlaying !== track.searchedTrack.previewUrl ? (
                            <IconButton
                                onClick={() =>
                                    onCurrentlyPlayingUpdate(
                                        track.searchedTrack.previewUrl
                                    )
                                }
                                variant="ghost"
                                w="full"
                                h="full"
                                colorScheme="black"
                                aria-label="Call Segun"
                                fontSize={["3xl", "4xl", "5xl"]}
                                icon={<PlayArrowIcon fontSize="inherit" />}
                            />
                        ) : (
                            <IconButton
                                onClick={() =>
                                    onCurrentlyPlayingUpdate(undefined)
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
    );
};

export default ListTrack;

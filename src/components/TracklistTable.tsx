"use client";

import React from "react";
import {
    Box,
    Collapse,
    Flex,
    Image,
    Progress,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Tr,
} from "@chakra-ui/react";
import { ReviewTracks, Track } from "../../types";

interface Props {
    tracklist: ReviewTracks;
    currentlyPlaying: Track | null;
    updateCurrentlyPlaying: (track: Track | null) => void;
    reviewStep: number;
    isOpen: boolean;
    currentTrackProgress: number;
}

const TracklistTable = ({
    tracklist,
    currentlyPlaying,
    updateCurrentlyPlaying,
    reviewStep,
    isOpen,
    currentTrackProgress,
}: Props) => {
    const getTrProps = (
        track: Track,
        currentlyPlaying: Track | null,
        updateCurrentlyPlaying: (track: Track | null) => void
    ) => {
        return {
            fontSize: "md",
            outlineOffset: -2,
            outline:
                currentlyPlaying?.previewUrl === track.previewUrl
                    ? "1px solid"
                    : "none",
            outlineColor:
                currentlyPlaying?.previewUrl === track.previewUrl
                    ? "brand.primary"
                    : "transparent",
            color: "brand.textPrimaryLight",
            _hover: {
                cursor: "pointer",
                backgroundColor:
                    currentlyPlaying?.previewUrl === track.previewUrl
                        ? "brand.backgroundTertiaryOpaque"
                        : "brand.backgroundTertiaryOpaque2",
            },
            bg:
                currentlyPlaying?.previewUrl === track.previewUrl
                    ? "brand.backgroundTertiaryOpaque"
                    : "transparent",
            onClick: () => {
                if (currentlyPlaying?.previewUrl !== track.previewUrl) {
                    updateCurrentlyPlaying(track);
                }
            },
        };
    };

    return (
        <Collapse in={isOpen} animateOpacity>
            <TableContainer
                transition="padding 0.2s ease-in-out"
                maxH="68vh"
                overflowY="scroll"
                sx={{
                    "::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
                shadow="2xl"
                w="full"
            >
                <Table variant="primary">
                    <Tbody>
                        {tracklist[reviewStep].map((track, index) => (
                            <Tr
                                key={track.id}
                                {...getTrProps(
                                    track,
                                    currentlyPlaying,
                                    updateCurrentlyPlaying
                                )}
                            >
                                <Td pr={2}>
                                    <Flex
                                        alignItems="center"
                                        gap={3}
                                        justifyContent="flex-start"
                                        pl={2}
                                        mb={2}
                                    >
                                        <Image
                                            rounded="full"
                                            w={16}
                                            h={16}
                                            src={track.thumbnail}
                                            alt=""
                                        ></Image>
                                        <Flex
                                            w="full"
                                            direction="column"
                                            gap={2}
                                        >
                                            <Text
                                                noOfLines={3}
                                                fontSize={"md"}
                                                color={"brand.textPrimary"}
                                                sx={{
                                                    textWrap: "wrap",
                                                }}
                                                fontWeight={
                                                    currentlyPlaying?.previewUrl !==
                                                    track.previewUrl
                                                        ? "normal"
                                                        : "bold"
                                                }
                                            >
                                                {track.title}
                                            </Text>
                                            <Text
                                                fontSize="sm"
                                                maxW={32}
                                                sx={{
                                                    textWrap: "wrap",
                                                }}
                                                fontWeight={
                                                    currentlyPlaying?.previewUrl !==
                                                    track.previewUrl
                                                        ? "normal"
                                                        : "bold"
                                                }
                                            >
                                                {track.artist}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                    <Flex justifyContent="space-between">
                                        <Text
                                            px={2}
                                            noOfLines={2}
                                            sx={{ textWrap: "wrap" }}
                                        >
                                            {track.genre}
                                        </Text>
                                        <Text>{track.releaseYear}</Text>
                                    </Flex>
                                    {currentlyPlaying?.id === track.id && (
                                        <Box mt={2} ml={1} w="full" px={2}>
                                            <Progress
                                                value={currentTrackProgress}
                                                size="xs"
                                                colorScheme="teal"
                                            />
                                        </Box>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Collapse>
    );
};

export default TracklistTable;

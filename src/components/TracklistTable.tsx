"use client";

import React, { useEffect, useRef } from "react";
import {
    Box,
    Collapsible,
    Flex,
    Image,
    Table,
    Text,
} from "@chakra-ui/react";
import { ReviewTracks, Track } from "../../types";
import ToggleTracklist from "./ToggleTracklist";

interface Props {
    tracklist: ReviewTracks;
    currentlyPlaying: Track | null;
    updateCurrentlyPlaying: (track: Track | null) => void;
    reviewStep: number;
    isOpen: boolean;
    noTracks: boolean;
    loading: boolean;
    toggleTracklist: () => void;
    isShowingTracklist: boolean;
}

const TracklistTable = ({
    tracklist,
    currentlyPlaying,
    updateCurrentlyPlaying,
    isOpen,
    noTracks,
    loading,
    reviewStep,
    toggleTracklist,
    isShowingTracklist,
}: Props) => {
    const itemRef = useRef<HTMLTableRowElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            executeScroll();
        }
    }, [isOpen]);

    const executeScroll = () => {
        if (itemRef.current) {
            itemRef.current.scrollIntoView({
                block: "nearest",
                inline: "start",
            });
        }
    };

    const getTrProps = (
        track: Track,
        updateCurrentlyPlaying: (track: Track | null) => void,
        isCurrentTrack: boolean
    ) => {
        return {
            fontSize: "md",
            outlineOffset: -2,
            outline: isCurrentTrack ? "1px solid" : "none",
            outlineColor: isCurrentTrack ? "brand.primary" : "transparent",
            color: "brand.textPrimaryLight",
            _hover: {
                cursor: "pointer",
                backgroundColor: isCurrentTrack
                    ? "brand.backgroundTertiaryOpaque"
                    : "brand.backgroundTertiaryOpaque2",
            },
            bg: isCurrentTrack
                ? "brand.backgroundTertiaryOpaque"
                : "transparent",
            onClick: () => {
                if (!isCurrentTrack) {
                    updateCurrentlyPlaying(track);
                }
            },
        };
    };

    return (
        <Collapsible.Root open={isOpen}>
            <Collapsible.Content>
                <Flex direction="column" alignItems="flex-end">
                    {!noTracks && !loading && reviewStep > 1 && reviewStep < 4 && (
                        <ToggleTracklist
                            toggleTracklist={toggleTracklist}
                            isShowingTracklist={isShowingTracklist}
                        />
                    )}

                    <Box
                        transition="padding 0.2s ease-in-out"
                        maxH="68vh"
                        overflowY="scroll"
                        overflowX="auto"
                        css={{
                            "&::-webkit-scrollbar": {
                                display: "none",
                            },
                        }}
                        shadow="2xl"
                        w="full"
                    >
                        <Table.Root>
                            <Table.Body>
                                {tracklist[reviewStep].tracks.map((track) => {
                                    const isCurrentTrack =
                                        currentlyPlaying?.previewUrl ===
                                        track.previewUrl;
                                    const {
                                        id,
                                        thumbnail,
                                        title,
                                        artist,
                                        genre,
                                        releaseYear,
                                    } = track;
                                    return (
                                        <Table.Row
                                            ref={isCurrentTrack ? itemRef : null}
                                            key={id}
                                            {...getTrProps(
                                                track,
                                                updateCurrentlyPlaying,
                                                isCurrentTrack
                                            )}
                                            borderBottom="1px solid"
                                            borderBottomColor="brand.backgroundTertiary"
                                        >
                                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0" pr={2}>
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
                                                        src={thumbnail}
                                                        alt=""
                                                    ></Image>
                                                    <Flex
                                                        w="full"
                                                        direction="column"
                                                        gap={2}
                                                    >
                                                        <Text
                                                            lineClamp={3}
                                                            fontSize={"md"}
                                                            color={
                                                                "brand.textPrimary"
                                                            }
                                                            css={{
                                                                textWrap: "wrap",
                                                            }}
                                                            fontWeight={
                                                                !isCurrentTrack
                                                                    ? "normal"
                                                                    : "bold"
                                                            }
                                                        >
                                                            {title}
                                                        </Text>
                                                        <Text
                                                            fontSize="sm"
                                                            maxW={32}
                                                            css={{
                                                                textWrap: "wrap",
                                                            }}
                                                            fontWeight={
                                                                !isCurrentTrack
                                                                    ? "normal"
                                                                    : "bold"
                                                            }
                                                        >
                                                            {artist}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                                <Flex justifyContent="space-between">
                                                    <Text
                                                        px={2}
                                                        lineClamp={2}
                                                        css={{
                                                            textWrap: "wrap",
                                                        }}
                                                    >
                                                        {genre}
                                                    </Text>
                                                    <Text>{releaseYear}</Text>
                                                </Flex>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Flex>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export default TracklistTable;

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
            fontSize: "sm",
            transition: "all 0.15s ease",
            outline: isCurrentTrack ? "1px solid" : "none",
            outlineColor: isCurrentTrack ? "brand.primary" : "transparent",
            outlineOffset: -1,
            rounded: "lg",
            color: "brand.textSecondary",
            _hover: {
                cursor: "pointer",
                bg: isCurrentTrack
                    ? "brand.primarySubtle"
                    : "brand.surfaceHover",
            },
            bg: isCurrentTrack ? "brand.primarySubtle" : "transparent",
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
                        maxH="68vh"
                        overflowY="auto"
                        overflowX="auto"
                        w="full"
                        css={{
                            "&::-webkit-scrollbar": {
                                width: "4px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                                background: "var(--chakra-colors-brand-scrollbar-thumb)",
                                borderRadius: "4px",
                            },
                        }}
                    >
                        <Table.Root>
                            <Table.Body>
                                {tracklist[reviewStep].tracks.map((track) => {
                                    const isCurrentTrack =
                                        currentlyPlaying?.id ===
                                        track.id;
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
                                            borderBottomColor="brand.divider"
                                        >
                                            <Table.Cell py={2.5} px={2}>
                                                <Flex
                                                    alignItems="center"
                                                    gap={3}
                                                    pl={2}
                                                    mb={2}
                                                >
                                                    <Image
                                                        rounded="lg"
                                                        w={14}
                                                        h={14}
                                                        src={thumbnail}
                                                        alt=""
                                                        objectFit="cover"
                                                    />
                                                    <Flex
                                                        w="full"
                                                        direction="column"
                                                        gap={0.5}
                                                    >
                                                        <Text
                                                            lineClamp={2}
                                                            fontSize="sm"
                                                            color="brand.textPrimary"
                                                            css={{ textWrap: "wrap" }}
                                                            fontWeight={
                                                                isCurrentTrack
                                                                    ? "semibold"
                                                                    : "normal"
                                                            }
                                                        >
                                                            {title}
                                                        </Text>
                                                        <Text
                                                            fontSize="xs"
                                                            color="brand.textMuted"
                                                            maxW={32}
                                                            css={{ textWrap: "wrap" }}
                                                        >
                                                            {artist}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                                <Flex
                                                    justifyContent="space-between"
                                                    px={2}
                                                >
                                                    <Text
                                                        fontSize="xs"
                                                        lineClamp={1}
                                                        color="brand.textMuted"
                                                        css={{ textWrap: "wrap" }}
                                                    >
                                                        {genre}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="brand.textMuted"
                                                    >
                                                        {releaseYear}
                                                    </Text>
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

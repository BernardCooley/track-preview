"use client";

import React from "react";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Image,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { ReviewTracks, SortDirection, Track } from "../../types";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ShopIcon from "@mui/icons-material/Shop";
import TrackMenuOptions from "./TrackOptionsMenu";
import { camelcaseToTitleCase, getFormattedDate } from "../../utils";

type TrackKeys = keyof Track;

interface TableHeadingProps {
    title: TrackKeys;
}

interface Props {
    sortBy: keyof Track | "";
    sortDirection: SortDirection;
    currentReleaseTrack: Track | null;
    reviewTracks: ReviewTracks;
    currentlyPlaying: string | undefined;
    clickDisabled: boolean;
    updateCurrentlyPlaying: (url: string | undefined) => void;
    setClickDisabled: React.Dispatch<React.SetStateAction<boolean>>;
    setTrackToBuy: React.Dispatch<React.SetStateAction<number | null>>;
    setTrackToDelete: React.Dispatch<React.SetStateAction<number | null>>;
    updateCurrentReleaseTrack: (track: Track) => void;
    updatePreviousTracks: (tracks: Track[]) => void;
    getTracks: (track: Track) => void;
    updateReviewTracks: (reviewStep: number, tracks: Track[]) => void;
    setSortBy: React.Dispatch<React.SetStateAction<keyof Track | "">>;
    setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
}

const LibraryTable = ({
    sortBy,
    sortDirection,
    currentReleaseTrack,
    reviewTracks,
    currentlyPlaying,
    clickDisabled,
    updateCurrentlyPlaying,
    setClickDisabled,
    setTrackToBuy,
    setTrackToDelete,
    updateCurrentReleaseTrack,
    updatePreviousTracks,
    getTracks,
    updateReviewTracks,
    setSortBy,
    setSortDirection,
}: Props) => {
    const sortTracks = (field: TrackKeys) => {
        const order = sortBy === field ? sortDirection : "asc";

        const sortedTracks = [...reviewTracks[4]].sort((a, b) => {
            if (a[field] < b[field]) return order === "asc" ? -1 : 1;
            if (a[field] > b[field]) return order === "asc" ? 1 : -1;
            return 0;
        });

        updateReviewTracks(4, sortedTracks);
        setSortBy(field);
        setSortDirection(order === "asc" ? "desc" : "asc");
    };

    const gotToRelease = (index: number) => {
        updateCurrentReleaseTrack(reviewTracks[4][index]);
        if (
            currentReleaseTrack?.releaseTitle !==
                reviewTracks[4][index].releaseTitle &&
            currentReleaseTrack?.releaseDate !==
                reviewTracks[4][index].releaseDate
        ) {
            updatePreviousTracks(reviewTracks[4]);
            getTracks(reviewTracks[4][index]);
            setClickDisabled(false);
        }
    };

    const getTrProps = (
        track: Track,
        currentlyPlaying: string | undefined,
        clickDisabled: boolean,
        updateCurrentlyPlaying: (url: string | undefined) => void
    ) => {
        return {
            fontSize: "md",
            rounded: 10,
            outlineOffset: -2,
            outline:
                currentlyPlaying === track.previewUrl ? "1px solid" : "none",
            outlineColor:
                currentlyPlaying === track.previewUrl
                    ? "brand.primary"
                    : "transparent",
            color: "brand.textPrimaryLight",
            _hover: {
                cursor: "pointer",
                backgroundColor:
                    currentlyPlaying === track.previewUrl
                        ? "brand.backgroundTertiaryOpaque"
                        : "brand.backgroundTertiaryOpaque2",
            },
            bg:
                currentlyPlaying === track.previewUrl
                    ? "brand.backgroundTertiaryOpaque"
                    : "transparent",
            onClick: () => {
                if (!clickDisabled) {
                    if (currentlyPlaying === track.previewUrl) {
                        updateCurrentlyPlaying(undefined);
                    } else {
                        updateCurrentlyPlaying(track.previewUrl);
                    }
                }
            },
        };
    };

    const TableHeading = ({ title }: TableHeadingProps) => {
        return (
            <Flex
                position="relative"
                as={Button}
                variant="unstyled"
                border="none"
                shadow="none"
                onClick={() => sortTracks(title as TrackKeys)}
                textDecoration={sortBy === title ? "underline" : "none"}
            >
                <Text>{camelcaseToTitleCase(title)}</Text>
                {sortBy === title && (
                    <Box
                        top={2}
                        right={-6}
                        position="absolute"
                        transform={
                            sortBy === title && sortDirection === "asc"
                                ? ""
                                : "rotate(180deg)"
                        }
                    >
                        <KeyboardArrowUpIcon />
                    </Box>
                )}
            </Flex>
        );
    };

    return (
        <TableContainer
            maxH={currentReleaseTrack || currentlyPlaying ? "70vh" : "75vh"}
            overflowY="scroll"
            sx={{
                "::-webkit-scrollbar": {
                    display: "none",
                },
            }}
            shadow="2xl"
            rounded="2xl"
            border="1px solid"
            borderColor="brand.backgroundTertiaryOpaque"
        >
            <Table variant="primary" display={["none", "none", "table"]}>
                <Thead>
                    <Tr>
                        <Th pl={1}>
                            <TableHeading title="title" />
                        </Th>
                        <Th>
                            <TableHeading title="releaseTitle" />
                        </Th>
                        <Th>
                            <TableHeading title="genre" />
                        </Th>
                        <Th>
                            <TableHeading title="releaseDate" />
                        </Th>
                        {!currentReleaseTrack && (
                            <Th>
                                <Box
                                    as={Button}
                                    variant="unstyled"
                                    border="none"
                                    shadow="none"
                                    _hover={{
                                        cursor: "default",
                                    }}
                                >
                                    <br />
                                </Box>
                            </Th>
                        )}
                    </Tr>
                </Thead>
                <Tbody>
                    {reviewTracks[4].map((track, index) => (
                        <Tr
                            key={track.id}
                            {...getTrProps(
                                track,
                                currentlyPlaying,
                                clickDisabled,
                                updateCurrentlyPlaying
                            )}
                        >
                            <Td>
                                <Flex
                                    alignItems="center"
                                    gap={6}
                                    justifyContent="flex-start"
                                    pl={2}
                                >
                                    <Image
                                        maxW={16}
                                        maxH={16}
                                        src={track.thumbnail}
                                        alt=""
                                    ></Image>
                                    <Flex direction="column" gap={2}>
                                        <Text
                                            noOfLines={3}
                                            fontSize={"md"}
                                            color={"brand.textPrimary"}
                                            maxW={32}
                                            sx={{
                                                textWrap: "wrap",
                                            }}
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            maxW={32}
                                            sx={{
                                                textWrap: "wrap",
                                            }}
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Td>

                            <Td>
                                <Text maxW={48} sx={{ textWrap: "wrap" }}>
                                    {track.releaseTitle}
                                </Text>
                            </Td>
                            <Td>
                                <Text maxW={20} sx={{ textWrap: "wrap" }}>
                                    {track.genre}
                                </Text>
                            </Td>

                            <Td>
                                {getFormattedDate(track.releaseDate) ||
                                    track.releaseYear}
                            </Td>
                            {!currentReleaseTrack && (
                                <Td>
                                    <Flex alignItems="center">
                                        <IconButton
                                            onMouseEnter={() =>
                                                setClickDisabled(true)
                                            }
                                            onMouseLeave={() =>
                                                setClickDisabled(false)
                                            }
                                            color="brand.primary"
                                            fontSize="2xl"
                                            bg="transparent"
                                            shadow="none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTrackToBuy(index);
                                            }}
                                            position="relative"
                                            rounded="full"
                                            variant="ghost"
                                            aria-label="buy track"
                                            icon={
                                                <ShopIcon fontSize="inherit" />
                                            }
                                            _hover={{
                                                bg: "transparent",
                                            }}
                                            _focusVisible={{
                                                outline: "none",
                                            }}
                                        />
                                        <TrackMenuOptions
                                            onMouseEnter={() =>
                                                setClickDisabled(true)
                                            }
                                            onMouseLeave={() =>
                                                setClickDisabled(false)
                                            }
                                            onTrackDelete={() =>
                                                setTrackToDelete(index)
                                            }
                                            onViewRelease={() =>
                                                gotToRelease(index)
                                            }
                                            index={index}
                                        />
                                    </Flex>
                                </Td>
                            )}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <Table variant="primary" display={["table", "table", "none"]}>
                <Thead>
                    <Tr>
                        <Th>
                            <TableHeading title="title" />
                        </Th>
                        <Th>
                            <TableHeading title="genre" />
                        </Th>
                        {!currentReleaseTrack && (
                            <Th>
                                <br />
                            </Th>
                        )}
                    </Tr>
                </Thead>
                <Tbody>
                    {reviewTracks[4].map((track, index) => (
                        <Tr
                            key={track.id}
                            {...getTrProps(
                                track,
                                currentlyPlaying,
                                clickDisabled,
                                updateCurrentlyPlaying
                            )}
                            fontSize="sm"
                        >
                            <Td>
                                <Flex
                                    alignItems="center"
                                    gap={3}
                                    justifyContent="flex-start"
                                    pl={2}
                                >
                                    <Image
                                        maxW={14}
                                        maxH={14}
                                        src={track.thumbnail}
                                        alt=""
                                    ></Image>
                                    <Flex
                                        direction="column"
                                        maxW={[32, 40]}
                                        gap={1}
                                    >
                                        <Text
                                            isTruncated={
                                                currentlyPlaying !==
                                                track.previewUrl
                                            }
                                            color={"brand.textPrimary"}
                                            sx={{
                                                textWrap:
                                                    currentlyPlaying !==
                                                    track.previewUrl
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            isTruncated={
                                                currentlyPlaying !==
                                                track.previewUrl
                                            }
                                            fontSize="xs"
                                            maxW={24}
                                            sx={{
                                                textWrap:
                                                    currentlyPlaying !==
                                                    track.previewUrl
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Td>
                            <Td>
                                <Text
                                    isTruncated={
                                        currentlyPlaying !== track.previewUrl
                                    }
                                    sx={{
                                        textWrap:
                                            currentlyPlaying !==
                                            track.previewUrl
                                                ? "nowrap"
                                                : "wrap",
                                    }}
                                >
                                    {track.genre}
                                </Text>
                            </Td>
                            {!currentReleaseTrack && (
                                <Td>
                                    <Flex alignItems="center">
                                        <IconButton
                                            left={2}
                                            onMouseEnter={() =>
                                                setClickDisabled(true)
                                            }
                                            onMouseLeave={() =>
                                                setClickDisabled(false)
                                            }
                                            color="brand.primary"
                                            fontSize="2xl"
                                            bg="transparent"
                                            shadow="none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTrackToBuy(index);
                                            }}
                                            position="relative"
                                            rounded="full"
                                            variant="ghost"
                                            aria-label="buy track"
                                            icon={
                                                <ShopIcon fontSize="inherit" />
                                            }
                                            _hover={{
                                                bg: "transparent",
                                            }}
                                            _focusVisible={{
                                                outline: "none",
                                            }}
                                        />
                                        <TrackMenuOptions
                                            onMouseEnter={() =>
                                                setClickDisabled(true)
                                            }
                                            onMouseLeave={() =>
                                                setClickDisabled(false)
                                            }
                                            onTrackDelete={() =>
                                                setTrackToDelete(index)
                                            }
                                            onViewRelease={() =>
                                                gotToRelease(index)
                                            }
                                            index={index}
                                        />
                                    </Flex>
                                </Td>
                            )}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default LibraryTable;

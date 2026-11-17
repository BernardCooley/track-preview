"use client";

import React from "react";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Image,
    Table,
    Text,
} from "@chakra-ui/react";
import { ReviewTracks, SortDirection, Track } from "../../types";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ShopIcon from "@mui/icons-material/Shop";
import TrackMenuOptions from "./TrackOptionsMenu";
import { camelcaseToTitleCase, getFormattedDate } from "../../utils";
import { resolvePreviewUrl } from "@/bff/bff";

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
    updateReviewTracks: (
        reviewStep: number,
        tracks: Track[],
        currentTrackIndex: number
    ) => void;
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

        const sortedTracks = [...reviewTracks[4].tracks].sort((a, b) => {
            const aVal = a[field] ?? "";
            const bVal = b[field] ?? "";
            if (aVal < bVal) return order === "asc" ? -1 : 1;
            if (aVal > bVal) return order === "asc" ? 1 : -1;
            return 0;
        });

        updateReviewTracks(4, sortedTracks, 0);
        setSortBy(field);
        setSortDirection(order === "asc" ? "desc" : "asc");
    };

    const gotToRelease = (index: number) => {
        updateCurrentReleaseTrack(reviewTracks[4].tracks[index]);
        if (
            currentReleaseTrack?.releaseTitle !==
                reviewTracks[4].tracks[index].releaseTitle &&
            currentReleaseTrack?.releaseDate !==
                reviewTracks[4].tracks[index].releaseDate
        ) {
            updatePreviousTracks(reviewTracks[4].tracks);
            getTracks(reviewTracks[4].tracks[index]);
            setClickDisabled(false);
        }
    };

    const [playingTrackId, setPlayingTrackId] = React.useState<
        string | undefined
    >();

    const getTrProps = (
        track: Track,
        currentlyPlaying: string | undefined,
        clickDisabled: boolean,
        updateCurrentlyPlaying: (url: string | undefined) => void
    ) => {
        const isPlaying = playingTrackId === track.id;
        return {
            fontSize: "sm",
            transition: "all 0.15s ease",
            outline: isPlaying ? "1px solid" : "none",
            outlineColor: isPlaying ? "brand.primary" : "transparent",
            outlineOffset: -1,
            rounded: "lg",
            color: "brand.textSecondary",
            _hover: {
                cursor: "pointer",
                bg: isPlaying
                    ? "brand.primarySubtle"
                    : "brand.surfaceHover",
            },
            bg: isPlaying ? "brand.primarySubtle" : "transparent",
            onClick: async () => {
                if (!clickDisabled) {
                    if (playingTrackId === track.id) {
                        setPlayingTrackId(undefined);
                        updateCurrentlyPlaying(undefined);
                    } else {
                        setPlayingTrackId(track.id);
                        const url = await resolvePreviewUrl(track.id);
                        updateCurrentlyPlaying(url || track.previewUrl);
                    }
                }
            },
        };
    };

    const TableHeading = ({ title }: TableHeadingProps) => {
        const isActive = sortBy === title;
        return (
            <Button
                variant="ghost"
                onClick={() => sortTracks(title as TrackKeys)}
                height="auto"
                px={2}
                py={1}
                shadow="none"
                color={isActive ? "brand.primary" : "brand.textMuted"}
                fontWeight={isActive ? "semibold" : "medium"}
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                _hover={{
                    color: "brand.textSecondary",
                    bg: "transparent",
                }}
            >
                <Text>{camelcaseToTitleCase(title)}</Text>
                {isActive && (
                    <Box
                        transform={sortDirection === "asc" ? "" : "rotate(180deg)"}
                        transition="transform 0.2s ease"
                        ml={1}
                    >
                        <KeyboardArrowUpIcon style={{ fontSize: "16px" }} />
                    </Box>
                )}
            </Button>
        );
    };

    const ActionButtons = ({ index }: { index: number }) => (
        <Flex alignItems="center" gap={1}>
            <IconButton
                onMouseEnter={() => setClickDisabled(true)}
                onMouseLeave={() => setClickDisabled(false)}
                color="brand.primary"
                fontSize="xl"
                bg="transparent"
                shadow="none"
                onClick={(e) => {
                    e.stopPropagation();
                    setTrackToBuy(index);
                }}
                rounded="full"
                variant="tertiary"
                aria-label="buy track"
                size="sm"
            >
                <ShopIcon fontSize="inherit" />
            </IconButton>
            <TrackMenuOptions
                onMouseEnter={() => setClickDisabled(true)}
                onMouseLeave={() => setClickDisabled(false)}
                onTrackDelete={() => setTrackToDelete(index)}
                onViewRelease={() => gotToRelease(index)}
                index={index}
            />
        </Flex>
    );

    return (
        <Box
            transition="padding 0.2s ease-in-out"
            pb={currentlyPlaying ? 20 : 4}
            maxH={currentReleaseTrack || currentlyPlaying ? "70vh" : "78vh"}
            overflowY="auto"
            overflowX="auto"
            css={{
                "&::-webkit-scrollbar": {
                    width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                    background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                },
            }}
        >
            {/* Desktop table */}
            <Table.Root display={["none", "none", "table"]}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="title" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="releaseTitle" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="genre" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="releaseDate" />
                        </Table.ColumnHeader>
                        {!currentReleaseTrack && (
                            <Table.ColumnHeader py={2} px={2} w="80px" />
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {reviewTracks[4].tracks.map((track, index) => (
                        <Table.Row
                            key={track.id}
                            {...getTrProps(
                                track,
                                currentlyPlaying,
                                clickDisabled,
                                updateCurrentlyPlaying
                            )}
                            borderBottom="1px solid"
                            borderBottomColor="brand.divider"
                        >
                            <Table.Cell py={3} px={2}>
                                <Flex alignItems="center" gap={4} pl={2}>
                                    <Image
                                        rounded="lg"
                                        w={12}
                                        h={12}
                                        src={track.thumbnail}
                                        alt=""
                                        objectFit="cover"
                                    />
                                    <Flex direction="column" gap={0.5}>
                                        <Text
                                            lineClamp={2}
                                            fontSize="sm"
                                            color="brand.textPrimary"
                                            maxW={36}
                                            css={{ textWrap: "wrap" }}
                                            fontWeight={
                                                playingTrackId === track.id
                                                    ? "semibold"
                                                    : "normal"
                                            }
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            fontSize="xs"
                                            color="brand.textMuted"
                                            maxW={36}
                                            css={{ textWrap: "wrap" }}
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>

                            <Table.Cell py={3} px={2}>
                                <Text maxW={48} css={{ textWrap: "wrap" }} fontSize="sm">
                                    {track.releaseTitle}
                                </Text>
                            </Table.Cell>
                            <Table.Cell py={3} px={2}>
                                <Text maxW={20} css={{ textWrap: "wrap" }} fontSize="sm">
                                    {track.genre}
                                </Text>
                            </Table.Cell>
                            <Table.Cell py={3} px={2}>
                                <Text fontSize="sm">
                                    {getFormattedDate(track.releaseDate) ||
                                        track.releaseYear}
                                </Text>
                            </Table.Cell>
                            {!currentReleaseTrack && (
                                <Table.Cell py={3} px={2}>
                                    <ActionButtons index={index} />
                                </Table.Cell>
                            )}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Mobile table */}
            <Table.Root display={["table", "table", "none"]}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="title" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textMuted" py={2} px={2}>
                            <TableHeading title="genre" />
                        </Table.ColumnHeader>
                        {!currentReleaseTrack && (
                            <Table.ColumnHeader py={2} px={2} w="70px" />
                        )}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {reviewTracks[4].tracks.map((track, index) => (
                        <Table.Row
                            key={track.id}
                            {...getTrProps(
                                track,
                                currentlyPlaying,
                                clickDisabled,
                                updateCurrentlyPlaying
                            )}
                            borderBottom="1px solid"
                            borderBottomColor="brand.divider"
                        >
                            <Table.Cell py={2.5} px={2}>
                                <Flex alignItems="center" gap={3} pl={2}>
                                    <Image
                                        rounded="lg"
                                        w={11}
                                        h={11}
                                        src={track.thumbnail}
                                        alt=""
                                        objectFit="cover"
                                    />
                                    <Flex
                                        direction="column"
                                        maxW={[28, 36]}
                                        gap={0.5}
                                    >
                                        <Text
                                            truncate={playingTrackId !== track.id}
                                            color="brand.textPrimary"
                                            fontSize="sm"
                                            css={{
                                                textWrap:
                                                    playingTrackId !== track.id
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                            fontWeight={
                                                playingTrackId === track.id
                                                    ? "semibold"
                                                    : "normal"
                                            }
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            truncate={playingTrackId !== track.id}
                                            fontSize="xs"
                                            color="brand.textMuted"
                                            maxW={24}
                                            css={{
                                                textWrap:
                                                    playingTrackId !== track.id
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell py={2.5} px={2}>
                                <Text
                                    truncate={playingTrackId !== track.id}
                                    fontSize="xs"
                                    css={{
                                        textWrap:
                                            playingTrackId !== track.id
                                                ? "nowrap"
                                                : "wrap",
                                    }}
                                >
                                    {track.genre}
                                </Text>
                            </Table.Cell>
                            {!currentReleaseTrack && (
                                <Table.Cell py={2.5} px={2}>
                                    <ActionButtons index={index} />
                                </Table.Cell>
                            )}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default LibraryTable;

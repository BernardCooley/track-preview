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
            fontSize: "md",
            rounded: 10,
            outlineOffset: -2,
            outline: isPlaying ? "1px solid" : "none",
            outlineColor: isPlaying ? "brand.primary" : "transparent",
            color: "brand.textPrimaryLight",
            _hover: {
                cursor: "pointer",
                backgroundColor: isPlaying
                    ? "brand.backgroundTertiaryOpaque"
                    : "brand.backgroundTertiaryOpaque2",
            },
            bg: isPlaying ? "brand.backgroundTertiaryOpaque" : "transparent",
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
        return (
            <Button
                position="relative"
                variant="plain"
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
            </Button>
        );
    };

    return (
        <Box
            transition="padding 0.2s ease-in-out"
            pb={currentlyPlaying ? 14 : 0}
            maxH={currentReleaseTrack || currentlyPlaying ? "70vh" : "75vh"}
            overflowY="scroll"
            overflowX="auto"
            css={{
                "&::-webkit-scrollbar": {
                    display: "none",
                },
            }}
            shadow="2xl"
            rounded="2xl"
        >
            <Table.Root display={["none", "none", "table"]}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader pl={4} color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="title" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="releaseTitle" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="genre" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="releaseDate" />
                        </Table.ColumnHeader>
                        {!currentReleaseTrack && (
                            <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Button
                                    variant="plain"
                                    border="none"
                                    shadow="none"
                                    _hover={{
                                        cursor: "default",
                                    }}
                                >
                                    <br />
                                </Button>
                            </Table.ColumnHeader>
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
                            borderBottomColor="brand.backgroundTertiary"
                        >
                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Flex
                                    alignItems="center"
                                    gap={6}
                                    justifyContent="flex-start"
                                    pl={4}
                                >
                                    <Image
                                        rounded="full"
                                        w={16}
                                        h={16}
                                        src={track.thumbnail}
                                        alt=""
                                    ></Image>
                                    <Flex direction="column" gap={2}>
                                        <Text
                                            lineClamp={3}
                                            fontSize={"md"}
                                            color={"brand.textPrimary"}
                                            maxW={32}
                                            css={{
                                                textWrap: "wrap",
                                            }}
                                            fontWeight={
                                                playingTrackId !== track.id
                                                    ? "normal"
                                                    : "bold"
                                            }
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            maxW={32}
                                            css={{
                                                textWrap: "wrap",
                                            }}
                                            fontWeight={
                                                playingTrackId !== track.id
                                                    ? "normal"
                                                    : "bold"
                                            }
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>

                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Text maxW={48} css={{ textWrap: "wrap" }}>
                                    {track.releaseTitle}
                                </Text>
                            </Table.Cell>
                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Text maxW={20} css={{ textWrap: "wrap" }}>
                                    {track.genre}
                                </Text>
                            </Table.Cell>

                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                {getFormattedDate(track.releaseDate) ||
                                    track.releaseYear}
                            </Table.Cell>
                            {!currentReleaseTrack && (
                                <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
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
                                            _hover={{
                                                bg: "transparent",
                                            }}
                                            _focusVisible={{
                                                outline: "none",
                                            }}
                                        >
                                            <ShopIcon fontSize="inherit" />
                                        </IconButton>
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
                                </Table.Cell>
                            )}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Table.Root display={["table", "table", "none"]}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader pl={4} color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="title" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                            <TableHeading title="genre" />
                        </Table.ColumnHeader>
                        {!currentReleaseTrack && (
                            <Table.ColumnHeader color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <br />
                            </Table.ColumnHeader>
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
                            fontSize="sm"
                            borderBottom="1px solid"
                            borderBottomColor="brand.backgroundTertiary"
                        >
                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Flex
                                    alignItems="center"
                                    gap={3}
                                    justifyContent="flex-start"
                                    pl={4}
                                >
                                    <Image
                                        rounded="full"
                                        w={14}
                                        h={14}
                                        src={track.thumbnail}
                                        alt=""
                                    ></Image>
                                    <Flex
                                        direction="column"
                                        maxW={[32, 40]}
                                        gap={1}
                                    >
                                        <Text
                                            truncate={playingTrackId !== track.id}
                                            color={"brand.textPrimary"}
                                            css={{
                                                textWrap:
                                                    playingTrackId !== track.id
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                            fontWeight={
                                                playingTrackId !== track.id
                                                    ? "normal"
                                                    : "bold"
                                            }
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            truncate={playingTrackId !== track.id}
                                            fontSize="xs"
                                            maxW={24}
                                            css={{
                                                textWrap:
                                                    playingTrackId !== track.id
                                                        ? "nowrap"
                                                        : "wrap",
                                            }}
                                            fontWeight={
                                                playingTrackId !== track.id
                                                    ? "normal"
                                                    : "bold"
                                            }
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
                                <Text
                                    truncate={playingTrackId !== track.id}
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
                                <Table.Cell color="brand.textPrimaryLight" padding="10px" paddingLeft="0" paddingRight="0">
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
                                            _hover={{
                                                bg: "transparent",
                                            }}
                                            _focusVisible={{
                                                outline: "none",
                                            }}
                                        >
                                            <ShopIcon fontSize="inherit" />
                                        </IconButton>
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

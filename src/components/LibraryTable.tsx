"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Button,
    Flex,
    IconButton,
    Image,
    Menu,
    Table,
    Text,
} from "@chakra-ui/react";
import { ReviewTracks, Track } from "../../types";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ShopIcon from "@mui/icons-material/Shop";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrackMenuOptions from "./TrackOptionsMenu";
import { getFormattedDate } from "../../utils";
import { resolvePreviewUrl } from "@/bff/bff";
import { useTrackContext } from "../../context/TrackContext";
import { useLibraryParams } from "@/hooks/useLibraryParams";
import GenreModal from "./GenreModal";

type TrackKeys = keyof Track;

interface Props {
    currentReleaseTrack: Track | null;
    reviewTracks: ReviewTracks;
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (url: string | undefined) => void;
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
    addTrackToLibrary: (track: Track) => Promise<void>;
    addingTrackId: string | null;
    libraryTrackIds: Set<string>;
    playAllRequested?: boolean;
    onPlayAllStarted?: () => void;
}

const LibraryTable = ({
    currentReleaseTrack,
    reviewTracks,
    currentlyPlaying,
    updateCurrentlyPlaying,
    setTrackToBuy,
    setTrackToDelete,
    updateCurrentReleaseTrack,
    updatePreviousTracks,
    getTracks,
    updateReviewTracks,
    addTrackToLibrary,
    addingTrackId,
    libraryTrackIds,
    playAllRequested,
    onPlayAllStarted,
}: Props) => {
    const { onTrackEndedRef, onSkipRef, onPreviousRef, playingPositionRef, setTrackLoading, setPlayingTrack } = useTrackContext();
    const {
        selectedGenres, activeSortField, activeSortDirection,
        setSelectedGenres, setSort, setReleaseTrackId,
    } = useLibraryParams();
    const playingIndexRef = useRef<number | null>(null);
    const blobCache = useRef<Map<string, string>>(new Map());

    const [showGenreSelector, setShowGenreSelector] = useState(false);

    const availableGenres = useMemo(() => {
        const genreSet = new Set<string>();
        reviewTracks[4].tracks.forEach((t) => {
            if (t.genre) genreSet.add(t.genre);
        });
        return Array.from(genreSet).sort((a, b) => a.localeCompare(b));
    }, [reviewTracks[4].tracks]);

    const hasGenreFilter = !selectedGenres.some((g) => g.toLowerCase() === "all") && selectedGenres.length > 0;

    const filteredTracks = useMemo(() => {
        let tracks = reviewTracks[4].tracks;
        if (hasGenreFilter) {
            tracks = tracks.filter((t) => selectedGenres.includes(t.genre));
        }
        if (activeSortField) {
            tracks = [...tracks].sort((a, b) => {
                const aVal = a[activeSortField] ?? "";
                const bVal = b[activeSortField] ?? "";
                if (aVal < bVal) return activeSortDirection === "asc" ? -1 : 1;
                if (aVal > bVal) return activeSortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }
        return tracks;
    }, [reviewTracks[4].tracks, selectedGenres, hasGenreFilter, activeSortField, activeSortDirection]);

    const genreLabel = hasGenreFilter
        ? selectedGenres.length === 1
            ? selectedGenres[0]
            : `${selectedGenres.length} genres`
        : "All genres";

    const handleSortButton = (field: TrackKeys) => {
        if (activeSortField === field) {
            setSort(field, activeSortDirection === "asc" ? "desc" : "asc");
        } else {
            setSort(field, "asc");
        }
    };

    const clearSort = () => {
        setSort(null);
    };

    const fetchPreviewAsBlob = useCallback(async (trackId: string): Promise<string> => {
        if (blobCache.current.has(trackId)) return blobCache.current.get(trackId)!;
        const proxyUrl = await resolvePreviewUrl(trackId);
        if (!proxyUrl) return "";
        try {
            const res = await fetch(proxyUrl);
            if (!res.ok) return "";
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            blobCache.current.set(trackId, objectUrl);
            return objectUrl;
        } catch {
            return "";
        }
    }, []);
    const gotToRelease = (index: number) => {
        const track = reviewTracks[4].tracks[index];
        updateCurrentReleaseTrack(track);
        setReleaseTrackId(track.id);
        if (
            currentReleaseTrack?.releaseTitle !== track.releaseTitle &&
            currentReleaseTrack?.releaseDate !== track.releaseDate
        ) {
            updatePreviousTracks(reviewTracks[4].tracks);
            getTracks(track);
        }
    };

    const [playingTrackId, setPlayingTrackId] = React.useState<
        string | undefined
    >();

    const playTrackAtIndex = useCallback(async (index: number) => {
        const tracks = reviewTracks[4].tracks;
        if (index < 0 || index >= tracks.length) {
            setPlayingTrackId(undefined);
            updateCurrentlyPlaying(undefined);
            setPlayingTrack(null);
            playingIndexRef.current = null;
            playingPositionRef.current = null;
            setTrackLoading(null);
            onTrackEndedRef.current = null;
            return;
        }
        const track = tracks[index];
        playingIndexRef.current = index;
        playingPositionRef.current = { index, total: tracks.length };
        setPlayingTrackId(track.id);
        setPlayingTrack({ title: track.title, artist: track.artist, thumbnail: track.thumbnail });
        const url = await fetchPreviewAsBlob(track.id);
        setTrackLoading(null);
        if (url) {
            updateCurrentlyPlaying(url);
        } else {
            playTrackAtIndex(index + 1);
        }
    }, [reviewTracks, updateCurrentlyPlaying, fetchPreviewAsBlob]);

    const handleTrackEnded = useCallback(() => {
        if (playingIndexRef.current !== null) {
            playTrackAtIndex(playingIndexRef.current + 1);
        }
    }, [playTrackAtIndex]);

    const handleSkip = useCallback(() => {
        if (playingIndexRef.current !== null) {
            setTrackLoading("skip");
            playTrackAtIndex(playingIndexRef.current + 1);
        }
    }, [playTrackAtIndex]);

    const handlePrevious = useCallback(() => {
        if (playingIndexRef.current !== null && playingIndexRef.current > 0) {
            setTrackLoading("previous");
            playTrackAtIndex(playingIndexRef.current - 1);
        }
    }, [playTrackAtIndex]);

    const setAllRefs = useCallback(() => {
        onTrackEndedRef.current = handleTrackEnded;
        onSkipRef.current = handleSkip;
        onPreviousRef.current = handlePrevious;
    }, [handleTrackEnded, handleSkip, handlePrevious]);

    const clearAllRefs = useCallback(() => {
        onTrackEndedRef.current = null;
        onSkipRef.current = null;
        onPreviousRef.current = null;
        playingPositionRef.current = null;
    }, []);

    useEffect(() => {
        if (playAllRequested && reviewTracks[4].tracks.length > 0) {
            setAllRefs();
            playTrackAtIndex(0);
            onPlayAllStarted?.();
        }
    }, [playAllRequested]);

    useEffect(() => {
        if (playingIndexRef.current !== null) {
            setAllRefs();
        }
    }, [setAllRefs]);

    useEffect(() => {
        return () => { clearAllRefs(); };
    }, []);

    const getTrProps = (
        track: Track,
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
                if (playingTrackId === track.id) {
                    setPlayingTrackId(undefined);
                    updateCurrentlyPlaying(undefined);
                    setPlayingTrack(null);
                    playingIndexRef.current = null;
                    playingPositionRef.current = null;
                    clearAllRefs();
                } else {
                    const index = reviewTracks[4].tracks.findIndex(t => t.id === track.id);
                    playingIndexRef.current = index >= 0 ? index : null;
                    playingPositionRef.current = index >= 0 ? { index, total: reviewTracks[4].tracks.length } : null;
                    setAllRefs();
                    setPlayingTrackId(track.id);
                    setPlayingTrack({ title: track.title, artist: track.artist, thumbnail: track.thumbnail });
                    const url = await fetchPreviewAsBlob(track.id);
                    updateCurrentlyPlaying(url);
                }
            },
        };
    };

    const getOriginalIndex = (track: Track) =>
        reviewTracks[4].tracks.findIndex((t) => t.id === track.id);

    const ActionButtons = ({ track }: { track: Track }) => {
        const origIndex = getOriginalIndex(track);
        return (
            <Flex alignItems="center" gap={1} onClick={(e) => e.stopPropagation()}>
                <IconButton
                    color="brand.primary"
                    fontSize="xl"
                    bg="transparent"
                    shadow="none"
                    onClick={() => setTrackToBuy(origIndex)}
                    rounded="full"
                    variant="tertiary"
                    aria-label="buy track"
                    size="sm"
                >
                    <ShopIcon fontSize="inherit" />
                </IconButton>
                <TrackMenuOptions
                    onTrackDelete={() => setTrackToDelete(origIndex)}
                    onViewRelease={() => gotToRelease(origIndex)}
                    index={origIndex}
                />
            </Flex>
        );
    };

    const AddToLibraryButton = ({ track }: { track: Track }) => {
        const isInLibrary = libraryTrackIds.has(track.id);
        const isAdding = addingTrackId === track.id;

        if (isInLibrary) {
            return (
                <Flex alignItems="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                        color="brand.primary"
                        fontSize="xl"
                        bg="transparent"
                        shadow="none"
                        rounded="full"
                        variant="tertiary"
                        aria-label="Already in library"
                        size="sm"
                        disabled
                    >
                        <CheckCircleIcon fontSize="inherit" />
                    </IconButton>
                </Flex>
            );
        }

        return (
            <Flex alignItems="center" onClick={(e) => e.stopPropagation()}>
                <IconButton
                    color="brand.textMuted"
                    fontSize="xl"
                    bg="transparent"
                    shadow="none"
                    onClick={() => addTrackToLibrary(track)}
                    rounded="full"
                    variant="tertiary"
                    aria-label="Add to library"
                    size="sm"
                    loading={isAdding}
                    _hover={{ color: "brand.primary" }}
                >
                    <LibraryAddIcon fontSize="inherit" />
                </IconButton>
            </Flex>
        );
    };

    return (
        <Box
            transition="padding 0.2s ease-in-out"
            pb={currentlyPlaying ? 24 : 4}
            flex={1}
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
                    background: "var(--chakra-colors-brand-scrollbar-thumb)",
                    borderRadius: "4px",
                },
            }}
        >
            <GenreModal
                showGenreSelector={showGenreSelector}
                setShowGenreSelector={setShowGenreSelector}
                selectedGenres={selectedGenres}
                onApply={(genres) => {
                    setSelectedGenres(genres);
                    setShowGenreSelector(false);
                }}
                availableGenres={availableGenres}
                onCancel={() => setShowGenreSelector(false)}
            />

            {!currentReleaseTrack && (
                <Flex px={[3, 4]} pt={3} pb={2} gap={2.5} direction="column" position="sticky" top={0} zIndex={10} bg="brand.bg">
                    <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary" letterSpacing="-0.01em">
                        My Library
                    </Text>
                    <Flex gap={1.5} alignItems="center">
                    <Button
                        variant={hasGenreFilter ? "subtle" : "surface"}
                        onClick={() => setShowGenreSelector(true)}
                        size="xs"
                        px={2.5}
                        h={7}
                        fontSize="xs"
                    >
                        {genreLabel}
                    </Button>

                    <Menu.Root>
                        <Menu.Trigger asChild>
                            <Button
                                variant={activeSortField ? "subtle" : "surface"}
                                size="xs"
                                h={7}
                                px={activeSortField ? 2.5 : 0}
                                w={activeSortField ? "auto" : 7}
                                fontSize="xs"
                                aria-label="Sort"
                            >
                                <SwapVertIcon style={{ fontSize: "16px" }} />
                                {activeSortField && (
                                    <Text textTransform="capitalize">
                                        {activeSortField} ({activeSortDirection === "asc" ? "A-Z" : "Z-A"})
                                    </Text>
                                )}
                            </Button>
                        </Menu.Trigger>
                        <Menu.Positioner>
                            <Menu.Content
                                bg="brand.bg"
                                color="brand.textPrimary"
                                padding={1}
                                border="1px solid"
                                borderColor="brand.border"
                                shadow="lg"
                                rounded="lg"
                                minW="140px"
                            >
                                {(["title", "artist", "genre"] as TrackKeys[]).map((field) => {
                                    const isActive = activeSortField === field;
                                    return (
                                        <Menu.Item
                                            key={field}
                                            value={field}
                                            p={2.5}
                                            fontSize="sm"
                                            rounded="md"
                                            bg="transparent"
                                            color={isActive ? "brand.primary" : "brand.textSecondary"}
                                            fontWeight={isActive ? "semibold" : "normal"}
                                            cursor="pointer"
                                            _hover={{
                                                bg: "brand.surfaceHover",
                                                color: isActive ? "brand.primary" : "brand.textPrimary",
                                            }}
                                            onClick={() => handleSortButton(field)}
                                        >
                                            <Flex alignItems="center" justifyContent="space-between" w="full">
                                                <Text textTransform="capitalize">{field}</Text>
                                                {isActive && (
                                                    <Box
                                                        transform={activeSortDirection === "asc" ? "" : "rotate(180deg)"}
                                                        transition="transform 0.2s ease"
                                                    >
                                                        <KeyboardArrowUpIcon style={{ fontSize: "16px" }} />
                                                    </Box>
                                                )}
                                            </Flex>
                                        </Menu.Item>
                                    );
                                })}
                                {activeSortField && (
                                    <>
                                        <Box h="1px" bg="brand.divider" my={1} />
                                        <Menu.Item
                                            value="clear"
                                            p={2.5}
                                            fontSize="sm"
                                            rounded="md"
                                            bg="transparent"
                                            color="brand.textMuted"
                                            cursor="pointer"
                                            _hover={{
                                                bg: "brand.surfaceHover",
                                                color: "brand.textPrimary",
                                            }}
                                            onClick={clearSort}
                                        >
                                            Clear sort
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu.Content>
                        </Menu.Positioner>
                    </Menu.Root>
                    </Flex>
                </Flex>
            )}

            {/* Desktop table */}
            <Table.Root display={["none", "none", "table"]}>
                <Table.Body>
                    {filteredTracks.map((track) => (
                        <Table.Row
                            key={track.id}
                            {...getTrProps(
                                track,
                                updateCurrentlyPlaying
                            )}
                            borderBottom="1px solid"
                            borderBottomColor="brand.divider"
                        >
                            <Table.Cell py={3} px={2} w={currentReleaseTrack ? "full" : "auto"}>
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
                                            maxW={currentReleaseTrack ? "none" : 36}
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
                                            maxW={currentReleaseTrack ? "none" : 36}
                                            css={{ textWrap: "wrap" }}
                                        >
                                            {track.artist}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>

                            {!currentReleaseTrack && (
                                <>
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
                                </>
                            )}
                            <Table.Cell py={3} px={2}>
                                {currentReleaseTrack ? (
                                    <AddToLibraryButton track={track} />
                                ) : (
                                    <ActionButtons track={track} />
                                )}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>

            {/* Mobile table */}
            <Table.Root display={["table", "table", "none"]}>
                <Table.Body>
                    {filteredTracks.map((track) => (
                        <Table.Row
                            key={track.id}
                            {...getTrProps(
                                track,
                                updateCurrentlyPlaying
                            )}
                            borderBottom="1px solid"
                            borderBottomColor="brand.divider"
                        >
                            <Table.Cell py={2.5} px={2} maxW={0} w="full">
                                <Flex alignItems="center" gap={3} pl={2}>
                                    <Image
                                        rounded="lg"
                                        w={11}
                                        h={11}
                                        minW={11}
                                        src={track.thumbnail}
                                        alt=""
                                        objectFit="cover"
                                    />
                                    <Flex
                                        direction="column"
                                        gap={0.5}
                                        overflow="hidden"
                                    >
                                        <Text
                                            truncate
                                            color="brand.textPrimary"
                                            fontSize="sm"
                                            fontWeight={
                                                playingTrackId === track.id
                                                    ? "semibold"
                                                    : "normal"
                                            }
                                        >
                                            {track.title}
                                        </Text>
                                        <Text
                                            truncate
                                            fontSize="xs"
                                            color="brand.textMuted"
                                        >
                                            {track.artist}
                                        </Text>
                                        <Text
                                            truncate
                                            fontSize="xs"
                                            color="brand.textMuted"
                                        >
                                            {track.genre}
                                        </Text>
                                    </Flex>
                                </Flex>
                            </Table.Cell>
                            <Table.Cell py={2.5} px={2}>
                                {currentReleaseTrack ? (
                                    <AddToLibraryButton track={track} />
                                ) : (
                                    <ActionButtons track={track} />
                                )}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default LibraryTable;

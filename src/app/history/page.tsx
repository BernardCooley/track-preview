"use client";

import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    IconButton,
    Image,
    Input,
    Skeleton,
    Table,
    Text,
} from "@chakra-ui/react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import AuthGuard from "@/components/AuthGuard";
import BackHeader from "@/components/BackHeader";
import HistorySkeleton from "@/components/skeletons/HistorySkeleton";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import AudioPlayer from "@/components/AudioPlayer";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { useTrackContext } from "../../../context/TrackContext";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchDiscoveryHistory, getUserProfile, resolvePreviewUrl, sendToLibrary } from "@/bff/bff";
import { DiscoveryHistoryTrack } from "../../../types";

function getStatusLabel(step: number): { text: string; color: string } {
    switch (step) {
        case 0:
            return { text: "Skipped", color: "red" };
        case 4:
            return { text: "In library", color: "green" };
        default:
            return { text: "In review", color: "yellow" };
    }
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function HistoryContent() {
    const { user, updateUser, userProfile, updateUserProfile } = useAuthContext();
    const {
        currentlyPlaying,
        updateCurrentlyPlaying,
        onTrackEndedRef,
        onSkipRef,
        onPreviousRef,
        playingPositionRef,
        setTrackLoading,
        setPlayingTrack,
    } = useTrackContext();
    const { isPro } = useSubscription();

    const PAGE_SIZE = 50;
    const [tracks, setTracks] = useState<DiscoveryHistoryTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [playingTrackId, setPlayingTrackId] = useState<string | undefined>();
    const [filter, setFilter] = useState<"all" | "skipped-only">("all");
    const [filterLoading, setFilterLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioElement = useRef<HTMLAudioElement>(null);
    const playingIndexRef = useRef<number | null>(null);
    const blobCache = useRef<Map<string, string>>(new Map());
    const sentinelRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [hasLoadedResults, setHasLoadedResults] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    const showSkeleton = useDelayedLoading(!initialFetchDone);

    const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

    const statusParam = filter === "skipped-only" ? 0 : undefined;

    const addToLibrary = useCallback(async (trackId: string) => {
        if (!user?.uid) return;
        setAddingTrackId(trackId);
        try {
            await sendToLibrary({ trackId, userId: user.uid });
            setTracks(prev =>
                prev.map(t =>
                    t.id === trackId ? { ...t, currentReviewStep: 4 } : t
                )
            );
        } finally {
            setAddingTrackId(null);
        }
    }, [user?.uid]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser?.uid) {
                updateUser({ email: fbUser.email || "", uid: fbUser.uid });
                if (!userProfile) {
                    const profile = await getUserProfile({ userId: fbUser.uid });
                    if (profile) updateUserProfile(profile);
                }
            }
        });
        return unsubscribe;
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const trimmed = value.trim();
            setDebouncedSearch(trimmed.length >= 3 ? trimmed : "");
        }, 300);
    }, []);

    const fetchHistory = useCallback(async (offset: number, searchTerm: string, status?: number) => {
        if (!user?.uid) return [];
        const result = await fetchDiscoveryHistory({
            userId: user.uid,
            limit: PAGE_SIZE,
            offset,
            search: searchTerm || undefined,
            status,
        });
        return result || [];
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;

        if (!isPro) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const fetched = await fetchHistory(0, debouncedSearch, statusParam);
                if (fetched.length > 0) setHasLoadedResults(true);
                setTracks(fetched);
                scrollContainerRef.current?.scrollTo(0, 0);
                setHasMore(fetched.length >= PAGE_SIZE);
            } catch {
                setTracks([]);
                setHasMore(false);
            } finally {
                setLoading(false);
                setFilterLoading(false);
                setInitialFetchDone(true);
            }
        })();
    }, [user?.uid, isPro, debouncedSearch, statusParam, fetchHistory]);

    const loadMore = useCallback(async () => {
        if (!user?.uid || loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const fetched = await fetchHistory(tracks.length, debouncedSearch, statusParam);
            setTracks(prev => [...prev, ...fetched]);
            setHasMore(fetched.length >= PAGE_SIZE);
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    }, [user?.uid, loadingMore, hasMore, tracks.length, debouncedSearch, statusParam, fetchHistory]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        const container = scrollContainerRef.current;
        if (!sentinel || !container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { root: container, rootMargin: "200px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    useEffect(() => {
        if (currentlyPlaying !== undefined) {
            audioElement.current?.play().catch(() => {});
        } else {
            audioElement.current?.pause();
        }
    }, [currentlyPlaying]);

    useEffect(() => {
        return () => {
            audioElement.current?.pause();
            updateCurrentlyPlaying(undefined);
            setPlayingTrack(null);
            onTrackEndedRef.current = null;
            onSkipRef.current = null;
            onPreviousRef.current = null;
            playingPositionRef.current = null;
        };
    }, []);

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

    const playTrackAtIndex = useCallback(async (index: number) => {
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
    }, [tracks, updateCurrentlyPlaying, fetchPreviewAsBlob]);

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

    useEffect(() => {
        if (playingIndexRef.current !== null) {
            setAllRefs();
        }
    }, [setAllRefs]);

    const handleRowClick = async (track: DiscoveryHistoryTrack) => {
        if (playingTrackId === track.id) {
            setPlayingTrackId(undefined);
            updateCurrentlyPlaying(undefined);
            setPlayingTrack(null);
            playingIndexRef.current = null;
            playingPositionRef.current = null;
            onTrackEndedRef.current = null;
            onSkipRef.current = null;
            onPreviousRef.current = null;
        } else {
            const index = tracks.findIndex(t => t.id === track.id);
            setAllRefs();
            playingIndexRef.current = index >= 0 ? index : null;
            playingPositionRef.current = index >= 0 ? { index, total: tracks.length } : null;
            setPlayingTrackId(track.id);
            setPlayingTrack({ title: track.title, artist: track.artist, thumbnail: track.thumbnail });
            const url = await fetchPreviewAsBlob(track.id);
            updateCurrentlyPlaying(url);
        }
    };

    const showAudioPlayer =
        playingTrackId !== undefined ||
        (currentlyPlaying !== undefined && currentlyPlaying.length > 0);

    return (
        <Flex direction="column" h="100dvh" bg="brand.bg">
            <BackHeader title="Discovery History" />

            <Box ref={scrollContainerRef} flex={1} overflow="auto" css={{
                "&::-webkit-scrollbar": { width: "4px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                    background: "var(--chakra-colors-brand-scrollbar-thumb)",
                    borderRadius: "4px",
                },
            }}>
                {!initialFetchDone && showSkeleton && (
                    <HistorySkeleton />
                )}

                {initialFetchDone && (
                    <Box
                        maxW={["none", "none", "none", "1000px"]}
                        mx="auto"
                        pb={currentlyPlaying ? 24 : 4}
                    >
                        {hasLoadedResults && (
                            <Flex
                                px={[3, 4]}
                                pt={3}
                                pb={2}
                                gap={2.5}
                                direction="column"
                                position="sticky"
                                top={0}
                                zIndex={10}
                                bg="brand.bg"
                            >
                                <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary" letterSpacing="-0.01em">
                                    History
                                </Text>
                                <Flex alignItems="center" gap={2} position="relative">
                                    <Flex
                                        position="absolute"
                                        left={2.5}
                                        color="brand.textMuted"
                                        pointerEvents="none"
                                        zIndex={1}
                                    >
                                        <SearchIcon style={{ fontSize: "16px" }} />
                                    </Flex>
                                    <Input
                                        placeholder="Search artist or track"
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        size="xs"
                                        h={7}
                                        pl={8}
                                        pr={search ? 7 : 2.5}
                                        fontSize="xs"
                                        bg="brand.surface"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        rounded="md"
                                        color="brand.textPrimary"
                                        _placeholder={{ color: "brand.textMuted" }}
                                    />
                                    {search && (
                                        <IconButton
                                            position="absolute"
                                            right={0}
                                            variant="tertiary"
                                            size="2xs"
                                            aria-label="Clear search"
                                            color="brand.textMuted"
                                            _hover={{ color: "brand.textPrimary" }}
                                            onClick={() => handleSearchChange("")}
                                        >
                                            <CloseIcon style={{ fontSize: "14px" }} />
                                        </IconButton>
                                    )}
                                </Flex>
                                <Flex gap={1.5}>
                                    <Button
                                        variant="surface"
                                        size="xs"
                                        px={2.5}
                                        h={7}
                                        fontSize="xs"
                                        borderLeft="2px solid"
                                        borderLeftColor={filter === "all" ? "brand.primary" : "transparent"}
                                        color={filter === "all" ? "brand.primary" : undefined}
                                        onClick={() => { if (filter !== "all") { setFilterLoading(true); setFilter("all"); } }}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant="surface"
                                        size="xs"
                                        px={2.5}
                                        h={7}
                                        fontSize="xs"
                                        borderLeft="2px solid"
                                        borderLeftColor={filter === "skipped-only" ? "brand.primary" : "transparent"}
                                        color={filter === "skipped-only" ? "brand.primary" : undefined}
                                        onClick={() => { if (filter !== "skipped-only") { setFilterLoading(true); setFilter("skipped-only"); } }}
                                        loading={filterLoading}
                                    >
                                        Skipped only
                                    </Button>
                                </Flex>
                            </Flex>
                        )}

                        {initialFetchDone && !hasLoadedResults && tracks.length === 0 && !filterLoading && (
                            <Center pt={24}>
                                <Badge
                                    variant="outline"
                                    colorPalette="teal"
                                    fontSize={["md", "lg"]}
                                    px={4}
                                    py={2}
                                    rounded="lg"
                                >
                                    No discovery history yet
                                </Badge>
                            </Center>
                        )}

                        {hasLoadedResults && tracks.length === 0 && !filterLoading && (
                            <Center pt={12}>
                                <Text fontSize="sm" color="brand.textMuted">
                                    {debouncedSearch ? "No tracks match your search" : "No skipped tracks"}
                                </Text>
                            </Center>
                        )}

                        {/* Desktop */}
                        <Table.Root display={["none", "none", "table"]}>
                            <Table.Body>
                                {tracks.map((track) => {
                                    const status = getStatusLabel(track.currentReviewStep);
                                    const isPlaying = playingTrackId === track.id;
                                    return (
                                        <Table.Row
                                            key={track.id + track.reviewedAt}
                                            fontSize="sm"
                                            transition="all 0.15s ease"
                                            outline={isPlaying ? "1px solid" : "none"}
                                            outlineColor={isPlaying ? "brand.primary" : "transparent"}
                                            outlineOffset={-1}
                                            rounded="lg"
                                            color="brand.textSecondary"
                                            _hover={{
                                                cursor: "pointer",
                                                bg: isPlaying ? "brand.primarySubtle" : "brand.surfaceHover",
                                            }}
                                            bg={isPlaying ? "brand.primarySubtle" : "transparent"}
                                            onClick={() => handleRowClick(track)}
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
                                                            fontWeight={isPlaying ? "semibold" : "normal"}
                                                        >
                                                            {track.title}
                                                        </Text>
                                                        <Text fontSize="xs" color="brand.textMuted" maxW={36} css={{ textWrap: "wrap" }}>
                                                            {track.artist}
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell py={3} px={2}>
                                                <Text maxW={48} css={{ textWrap: "wrap" }} fontSize="sm">
                                                    {track.genre}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell py={3} px={2}>
                                                <Badge
                                                    variant="subtle"
                                                    colorPalette={status.color}
                                                    fontSize="xs"
                                                    px={2}
                                                    py={0.5}
                                                    rounded="full"
                                                >
                                                    {status.text}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell py={3} px={2}>
                                                <Text fontSize="xs" color="brand.textMuted">
                                                    {formatDate(track.reviewedAt)}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell py={3} px={2}>
                                                {track.currentReviewStep === 0 && (
                                                    <Flex alignItems="center" onClick={(e) => e.stopPropagation()}>
                                                        <IconButton
                                                            color="brand.textMuted"
                                                            fontSize="xl"
                                                            bg="transparent"
                                                            shadow="none"
                                                            onClick={() => addToLibrary(track.id)}
                                                            rounded="full"
                                                            variant="tertiary"
                                                            aria-label="Add to library"
                                                            size="sm"
                                                            loading={addingTrackId === track.id}
                                                            _hover={{ color: "brand.primary" }}
                                                        >
                                                            <LibraryAddIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Flex>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table.Root>

                        {/* Mobile */}
                        <Table.Root display={["table", "table", "none"]}>
                            <Table.Body>
                                {tracks.map((track) => {
                                    const status = getStatusLabel(track.currentReviewStep);
                                    const isPlaying = playingTrackId === track.id;
                                    return (
                                        <Table.Row
                                            key={track.id + track.reviewedAt}
                                            fontSize="sm"
                                            transition="all 0.15s ease"
                                            outline={isPlaying ? "1px solid" : "none"}
                                            outlineColor={isPlaying ? "brand.primary" : "transparent"}
                                            outlineOffset={-1}
                                            rounded="lg"
                                            color="brand.textSecondary"
                                            _hover={{
                                                cursor: "pointer",
                                                bg: isPlaying ? "brand.primarySubtle" : "brand.surfaceHover",
                                            }}
                                            bg={isPlaying ? "brand.primarySubtle" : "transparent"}
                                            onClick={() => handleRowClick(track)}
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
                                                    <Flex direction="column" gap={0.5} overflow="hidden">
                                                        <Text
                                                            truncate
                                                            color="brand.textPrimary"
                                                            fontSize="sm"
                                                            fontWeight={isPlaying ? "semibold" : "normal"}
                                                        >
                                                            {track.title}
                                                        </Text>
                                                        <Text truncate fontSize="xs" color="brand.textMuted">
                                                            {track.artist}
                                                        </Text>
                                                        <Flex gap={2} alignItems="center">
                                                            <Badge
                                                                variant="subtle"
                                                                colorPalette={status.color}
                                                                fontSize="2xs"
                                                                px={1.5}
                                                                py={0}
                                                                rounded="full"
                                                            >
                                                                {status.text}
                                                            </Badge>
                                                            <Text fontSize="2xs" color="brand.textMuted">
                                                                {formatDate(track.reviewedAt)}
                                                            </Text>
                                                        </Flex>
                                                    </Flex>
                                                </Flex>
                                            </Table.Cell>
                                            <Table.Cell py={2.5} px={2}>
                                                {track.currentReviewStep === 0 && (
                                                    <Flex alignItems="center" onClick={(e) => e.stopPropagation()}>
                                                        <IconButton
                                                            color="brand.textMuted"
                                                            fontSize="xl"
                                                            bg="transparent"
                                                            shadow="none"
                                                            onClick={() => addToLibrary(track.id)}
                                                            rounded="full"
                                                            variant="tertiary"
                                                            aria-label="Add to library"
                                                            size="sm"
                                                            loading={addingTrackId === track.id}
                                                            _hover={{ color: "brand.primary" }}
                                                        >
                                                            <LibraryAddIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Flex>
                                                )}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table.Root>

                        {hasMore && (
                            <Flex direction="column" px={[3, 4]} ref={sentinelRef}>
                                {loadingMore && Array.from({ length: 3 }).map((_, i) => (
                                    <Flex
                                        key={i}
                                        py={2.5}
                                        gap={3}
                                        alignItems="center"
                                        borderBottom="1px solid"
                                        borderBottomColor="brand.divider"
                                    >
                                        <Skeleton h="44px" w="44px" rounded="lg" flexShrink={0} />
                                        <Flex direction="column" gap={1.5} flex={1}>
                                            <Skeleton h="14px" w={`${55 + i * 15}%`} />
                                            <Skeleton h="12px" w={`${35 + i * 10}%`} />
                                            <Flex gap={2}>
                                                <Skeleton h="16px" w="55px" rounded="full" />
                                                <Skeleton h="12px" w="80px" />
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Box>
                )}
            </Box>

            {showAudioPlayer && (
                <Box
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    zIndex={10}
                    bg="brand.bgSubtle"
                    borderTop="1px solid"
                    borderTopColor="brand.border"
                >
                    <Box p={3} maxW={["none", "none", "none", "1000px"]} mx="auto">
                        <AudioPlayer ref={audioElement} />
                    </Box>
                </Box>
            )}
        </Flex>
    );
}

export default function History() {
    return (
        <AuthGuard>
            <HistoryContent />
        </AuthGuard>
    );
}

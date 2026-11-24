"use client";

import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { fetchLibraryStats, LibraryStats as LibraryStatsType } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import StarIcon from "@mui/icons-material/Star";

interface Props {
    onClose: () => void;
    isPro: boolean;
    requirePro: (featureName: string) => boolean;
}

const StatSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <Flex direction="column" gap={2}>
        <Text
            fontSize="xs"
            fontWeight="semibold"
            color="brand.textMuted"
            textTransform="uppercase"
            letterSpacing="wider"
        >
            {title}
        </Text>
        {children}
    </Flex>
);

const BarRow = ({
    label,
    count,
    maxCount,
}: {
    label: string;
    count: number;
    maxCount: number;
}) => (
    <Flex direction="column" gap={0.5}>
        <Flex justifyContent="space-between" alignItems="baseline">
            <Text fontSize="sm" color="brand.textSecondary" truncate maxW="70%">
                {label}
            </Text>
            <Text fontSize="xs" color="brand.textMuted">
                {count}
            </Text>
        </Flex>
        <Box
            h={1.5}
            rounded="full"
            bg="brand.surfaceHover"
            overflow="hidden"
        >
            <Box
                h="full"
                rounded="full"
                bg="brand.primary"
                w={`${(count / maxCount) * 100}%`}
                transition="width 0.3s ease"
            />
        </Box>
    </Flex>
);

const LibraryStats = ({ onClose, isPro, requirePro }: Props) => {
    const { user } = useAuthContext();
    const [stats, setStats] = useState<LibraryStatsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!user?.uid) return;
        let cancelled = false;

        const load = async () => {
            try {
                const data = await fetchLibraryStats({ userId: user.uid });
                if (!cancelled) setStats(data);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [user?.uid]);

    if (loading) {
        return (
            <Box px={[3, 4]} py={6}>
                <Loading />
            </Box>
        );
    }

    if (error || !stats) {
        return (
            <Box px={[3, 4]} py={6}>
                <Text fontSize="sm" color="brand.textMuted" textAlign="center">
                    Failed to load stats
                </Text>
            </Box>
        );
    }

    const genreMax = stats.genreBreakdown[0]?.count ?? 1;
    const decadeMax = Math.max(...stats.decadeDistribution.map((d) => d.count), 1);
    const artistMax = stats.topArtists[0]?.count ?? 1;
    const releaseMax = stats.topReleases[0]?.count ?? 1;

    const formatDecade = (decade: number) => `${decade}s`;

    return (
        <Flex direction="column" gap={5} px={[3, 4]} pb={4}>
            <Flex alignItems="baseline" justifyContent="space-between">
                <Text fontSize="lg" fontWeight="bold" color="brand.textPrimary" letterSpacing="-0.01em">
                    Library Stats
                </Text>
                <Text
                    fontSize="xs"
                    color="brand.textMuted"
                    cursor="pointer"
                    _hover={{ color: "brand.textSecondary" }}
                    onClick={onClose}
                >
                    Close
                </Text>
            </Flex>

            <Flex gap={3} flexWrap="wrap">
                <Flex
                    bg="brand.primarySubtle"
                    rounded="lg"
                    px={4}
                    py={3}
                    alignItems="center"
                    justifyContent="center"
                    flex={1}
                    minW="fit-content"
                >
                    <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                        {stats.totalTracks}
                    </Text>
                    <Text fontSize="sm" color="brand.textSecondary" ml={2}>
                        {stats.totalTracks === 1 ? "track" : "tracks"}
                    </Text>
                </Flex>

                <Flex
                    bg="brand.surfaceHover"
                    rounded="lg"
                    px={4}
                    py={3}
                    alignItems="center"
                    justifyContent="center"
                    flex={1}
                    minW="fit-content"
                >
                    <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                        {stats.purchasedTracks}
                    </Text>
                    <Text fontSize="sm" color="brand.textSecondary" ml={2}>
                        bought
                    </Text>
                </Flex>

                {stats.totalReviewed > 0 && (
                    <Flex
                        bg="brand.surfaceHover"
                        rounded="lg"
                        px={4}
                        py={3}
                        alignItems="center"
                        justifyContent="center"
                        flex={1}
                        minW="fit-content"
                    >
                        <Text fontSize="2xl" fontWeight="bold" color="brand.textPrimary">
                            {Math.round((stats.totalTracks / stats.totalReviewed) * 100)}%
                        </Text>
                        <Text fontSize="sm" color="brand.textSecondary" ml={2}>
                            like rate
                        </Text>
                    </Flex>
                )}
            </Flex>

            {isPro ? (
                <>
                    {stats.genreBreakdown.length > 0 && (
                        <StatSection title="Genres">
                            <Flex direction="column" gap={1.5}>
                                {stats.genreBreakdown.slice(0, 10).map((g) => (
                                    <BarRow
                                        key={g.genre}
                                        label={g.genre}
                                        count={g.count}
                                        maxCount={genreMax}
                                    />
                                ))}
                            </Flex>
                        </StatSection>
                    )}

                    {stats.decadeDistribution.length > 0 && (
                        <StatSection title="Decades">
                            <Flex direction="column" gap={1.5}>
                                {stats.decadeDistribution.map((d) => (
                                    <BarRow
                                        key={d.decade}
                                        label={formatDecade(d.decade)}
                                        count={d.count}
                                        maxCount={decadeMax}
                                    />
                                ))}
                            </Flex>
                        </StatSection>
                    )}

                    {stats.topArtists.length > 0 && (
                        <StatSection title="Top Artists">
                            <Flex direction="column" gap={1.5}>
                                {stats.topArtists.map((a) => (
                                    <BarRow
                                        key={a.artist}
                                        label={a.artist}
                                        count={a.count}
                                        maxCount={artistMax}
                                    />
                                ))}
                            </Flex>
                        </StatSection>
                    )}

                    {stats.topReleases.length > 0 && (
                        <StatSection title="Top Releases">
                            <Flex direction="column" gap={1.5}>
                                {stats.topReleases.map((r) => (
                                    <BarRow
                                        key={`${r.releaseTitle}-${r.artist}`}
                                        label={`${r.releaseTitle} — ${r.artist}`}
                                        count={r.count}
                                        maxCount={releaseMax}
                                    />
                                ))}
                            </Flex>
                        </StatSection>
                    )}
                </>
            ) : (
                <Flex
                    border="1px solid"
                    borderColor="brand.primary"
                    rounded="lg"
                    px={4}
                    py={3}
                    gap={2}
                    alignItems="center"
                    justifyContent="center"
                    opacity={0.75}
                    cursor="pointer"
                    transition="opacity 0.15s ease"
                    _hover={{ opacity: 1 }}
                    onClick={() => requirePro("Library Stats")}
                >
                    <Text fontSize="sm" color="brand.textSecondary">
                        See more stats
                    </Text>
                    <Flex
                        alignItems="center"
                        bg="brand.primarySubtle"
                        color="brand.primary"
                        rounded="full"
                        px={1.5}
                        py={0.5}
                        gap={0.5}
                        flexShrink={0}
                    >
                        <StarIcon style={{ fontSize: "10px" }} />
                        <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                            PRO
                        </Text>
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
};

export default LibraryStats;

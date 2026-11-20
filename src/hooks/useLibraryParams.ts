"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { SortDirection, Track } from "../../types";

type TrackKeys = keyof Track;

const VALID_SORT_FIELDS: TrackKeys[] = ["title", "artist", "genre", "purchased"];
const VALID_SORT_DIRS: SortDirection[] = ["asc", "desc"];

export function useLibraryParams() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const selectedGenres = useMemo(() => {
        const raw = searchParams?.get("genres");
        if (!raw) return ["all"];
        const genres = raw.split(",").map((g) => decodeURIComponent(g)).filter(Boolean);
        return genres.length > 0 ? genres : ["all"];
    }, [searchParams]);

    const activeSortField = useMemo(() => {
        const raw = searchParams?.get("sort") as TrackKeys | null;
        return raw && VALID_SORT_FIELDS.includes(raw) ? raw : null;
    }, [searchParams]);

    const activeSortDirection = useMemo((): SortDirection => {
        const raw = searchParams?.get("sortDir") as SortDirection | null;
        return raw && VALID_SORT_DIRS.includes(raw) ? raw : "asc";
    }, [searchParams]);

    const hideBought = useMemo(() => {
        return searchParams?.get("hideBought") === "true";
    }, [searchParams]);

    const releaseTrackId = useMemo(() => {
        return searchParams?.get("release") || null;
    }, [searchParams]);

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams?.toString() || "");
            for (const [key, value] of Object.entries(updates)) {
                if (value === null) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            }
            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [searchParams, router]
    );

    const setSelectedGenres = useCallback(
        (genres: string[]) => {
            const isAll = genres.length === 0 || genres.some((g) => g.toLowerCase() === "all");
            updateParams({ genres: isAll ? null : genres.join(",") });
        },
        [updateParams]
    );

    const setActiveSortField = useCallback(
        (field: TrackKeys | null) => {
            updateParams({
                sort: field,
                sortDir: field ? (activeSortDirection || "asc") : null,
            });
        },
        [updateParams, activeSortDirection]
    );

    const setActiveSortDirection = useCallback(
        (dir: SortDirection) => {
            updateParams({ sortDir: dir });
        },
        [updateParams]
    );

    const setHideBought = useCallback(
        (hide: boolean) => {
            updateParams({ hideBought: hide ? "true" : null });
        },
        [updateParams]
    );

    const setReleaseTrackId = useCallback(
        (trackId: string | null) => {
            updateParams({ release: trackId });
        },
        [updateParams]
    );

    const setSort = useCallback(
        (field: TrackKeys | null, dir?: SortDirection) => {
            updateParams({
                sort: field,
                sortDir: field ? (dir || "asc") : null,
            });
        },
        [updateParams]
    );

    return {
        selectedGenres,
        activeSortField,
        activeSortDirection,
        hideBought,
        releaseTrackId,
        setSelectedGenres,
        setActiveSortField,
        setActiveSortDirection,
        setSort,
        setHideBought,
        setReleaseTrackId,
    };
}

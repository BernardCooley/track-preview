import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import {
    fetchNewTracks,
    getTrialLikeCount,
    resolvePreviewUrl,
    updateTrackReviewStep,
} from "@/bff/bff";
import { Track } from "../../types";

const LOOKBACK_HOURS: Record<string, number> = {
    DAILY: 24,
    WEEKLY: 24 * 7,
    MONTHLY: 24 * 30,
};

export const useNewTrackReview = () => {
    const { user, userProfile, isAnonymous } = useAuthContext();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [noTracks, setNoTracks] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(true);

    const previewCache = useRef<Map<string, string>>(new Map());
    const unplayableTracks = useRef<Set<string>>(new Set());
    const prefetchingTracks = useRef<Set<string>>(new Set());

    const fetchPreview = useCallback(async (trackId: string, signal?: AbortSignal): Promise<string | null> => {
        if (previewCache.current.has(trackId)) return previewCache.current.get(trackId)!;
        if (unplayableTracks.current.has(trackId)) return null;

        try {
            const proxyUrl = await resolvePreviewUrl(trackId);
            if (signal?.aborted) return null;
            if (!proxyUrl) {
                unplayableTracks.current.add(trackId);
                return null;
            }
            const res = await fetch(proxyUrl, { signal });
            if (!res.ok) {
                unplayableTracks.current.add(trackId);
                return null;
            }
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            previewCache.current.set(trackId, objectUrl);
            return objectUrl;
        } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return null;
            unplayableTracks.current.add(trackId);
            return null;
        }
    }, []);

    const prefetchUpcoming = useCallback((trackList: Track[], fromIndex: number) => {
        let queued = 0;
        for (let i = fromIndex + 1; i < trackList.length && queued < 3; i++) {
            const track = trackList[i];
            if (
                unplayableTracks.current.has(track.id) ||
                previewCache.current.has(track.id) ||
                prefetchingTracks.current.has(track.id)
            ) continue;
            prefetchingTracks.current.add(track.id);
            queued++;
            fetchPreview(track.id).finally(() => {
                prefetchingTracks.current.delete(track.id);
            });
        }
    }, [fetchPreview]);

    useEffect(() => {
        const abortController = new AbortController();
        if (!currentTrack) return;

        setResolvedPreviewUrl("");
        setPreviewLoading(true);

        const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
        if (currentIndex === -1) {
            setPreviewLoading(false);
            setLoading(false);
            return;
        }

        const tryTrackAtIndex = async (idx: number) => {
            if (abortController.signal.aborted) return;
            if (idx >= tracks.length) {
                setPreviewLoading(false);
                setLoading(false);
                return;
            }

            const track = tracks[idx];
            if (idx !== currentIndex) {
                setCurrentTrack(track as Track);
                return;
            }

            const blobUrl = await fetchPreview(track.id, abortController.signal);
            if (abortController.signal.aborted) return;

            if (!blobUrl) {
                tryTrackAtIndex(idx + 1);
                return;
            }

            setResolvedPreviewUrl(blobUrl);
            setPreviewLoading(false);
            prefetchUpcoming(tracks, idx);
        };

        tryTrackAtIndex(currentIndex);

        return () => {
            abortController.abort();
        };
    }, [currentTrack]);

    useEffect(() => {
        if (!user?.uid || !userProfile?.genreAlerts?.length) {
            setLoading(false);
            setNoTracks(true);
            return;
        }

        const freq = userProfile.genreAlertFrequency || "WEEKLY";
        const lookbackMs = (LOOKBACK_HOURS[freq] || LOOKBACK_HOURS.WEEKLY) * 60 * 60 * 1000;
        const since = new Date(Date.now() - lookbackMs).toISOString();

        setLoading(true);
        setNoTracks(false);

        fetchNewTracks({
            genres: userProfile.genreAlerts,
            userId: user.uid,
            since,
        }).then((result) => {
            if (result && result.length > 0) {
                setTracks(result);
                setCurrentTrack(result[0] as Track);
                setNoTracks(false);
            } else {
                setTracks([]);
                setCurrentTrack(null);
                setNoTracks(true);
            }
            setLoading(false);
        }).catch(() => {
            setLoading(false);
            setNoTracks(true);
        });

        return () => {
            previewCache.current.forEach((url) => URL.revokeObjectURL(url));
            previewCache.current.clear();
        };
    }, [user?.uid, userProfile?.genreAlerts, userProfile?.genreAlertFrequency]);

    const likeOrDislike = async (like: boolean) => {
        if (!currentTrack || !user?.uid) return;

        setLoading(true);
        setPreviewLoading(true);

        const track = { ...currentTrack };
        const cachedUrl = previewCache.current.get(track.id);
        if (cachedUrl) {
            URL.revokeObjectURL(cachedUrl);
            previewCache.current.delete(track.id);
        }

        updateTrackReviewStep({
            trackId: track.id,
            reviewStep: 1,
            like,
            userId: user.uid,
            curatedMode: userProfile?.curatedMode ?? false,
        });

        const currentIndex = tracks.findIndex((t) => t.id === track.id);
        const remaining = tracks.filter((t) => t.id !== track.id);
        setTracks(remaining);

        if (remaining.length > 0) {
            const nextIndex = Math.min(currentIndex, remaining.length - 1);
            setCurrentTrack(remaining[nextIndex] as Track);
        } else {
            setCurrentTrack(null);
            setNoTracks(true);
            setLoading(false);
        }
    };

    return {
        tracks,
        currentTrack,
        setCurrentTrack,
        noTracks,
        loading,
        previewLoading,
        resolvedPreviewUrl,
        likeOrDislike,
        userProfile,
        isAnonymous,
    };
};

import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getCurrentYear } from "../../utils";
import { useTrackContext } from "../../context/TrackContext";
import {
    fetchTracks,
    mutateUserProfile,
    resolvePreviewUrl,
    updateTrackReviewStep,
} from "@/bff/bff";
import { useLocalStorage } from "usehooks-ts";
import { toaster } from "@/components/toaster";
import { Track, YearRange } from "../../types";
import { User as UserProfile } from "@prisma/client";

export const useTrackReview = (reviewStep: number) => {
    const { reviewTracks, updateReviewTracks, changesMade, updateChangesMade } =
        useTrackContext();
    const [recentGenres, setRecentGenres] = useLocalStorage<string[]>(
        "recentGenres",
        []
    );
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const [prevUserProfile, setPrevUserProfile] = useState<UserProfile | null>(
        userProfile
    );
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const [showYearSelector, setShowYearSelector] = useState<boolean>(false);
    const [showGenreSelector, setShowGenreSelector] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const id = "review-toast";
    const [loading, setLoading] = useState<boolean>(true);
    const [loadMoreTracks, setLoadMoreTracks] = useState<boolean>(false);
    const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);
    const [autoplayLoading, setAutoplayLoading] = useState<boolean>(false);
    const [indexOfTrack, setIndexOfTrack] = useState(0);
    const [resolvedPreviewUrl, setResolvedPreviewUrl] = useState<string>("");
    const [previewLoading, setPreviewLoading] = useState<boolean>(true);

    const comparisonUserProfile = (profile: UserProfile | null) => {
        if (profile === null) return;

        const { autoplay, curatedMode, ...rest } = profile;
        return JSON.stringify(rest);
    };

    const hasUserProfileChanged =
        comparisonUserProfile(prevUserProfile) !==
        comparisonUserProfile(userProfile);

    useEffect(() => {
        setPrevUserProfile(userProfile);
    }, [userProfile]);

    useEffect(() => {
        let revoked = false;
        let objectUrl = "";

        if (currentTrack) {
            setListened(false);
            setIsPlaying(false);
            setResolvedPreviewUrl("");
            setPreviewLoading(true);
            resolvePreviewUrl(currentTrack.id).then(async (proxyUrl) => {
                if (!proxyUrl || revoked) {
                    if (!revoked) setPreviewLoading(false);
                    return;
                }
                try {
                    const res = await fetch(proxyUrl);
                    if (!res.ok || revoked) {
                        if (!revoked) setPreviewLoading(false);
                        return;
                    }
                    const blob = await res.blob();
                    if (revoked) return;
                    objectUrl = URL.createObjectURL(blob);
                    setResolvedPreviewUrl(objectUrl);
                } catch {
                    // fall through — no preview available
                }
                if (!revoked) setPreviewLoading(false);
            });
        }

        return () => {
            revoked = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [currentTrack]);

    const getTracks = useCallback(async () => {
        setCurrentTrack(null);
        if (userProfile?.genres && user?.uid) {
            setLoading(true);
            return await fetchTracks({
                genres:
                    userProfile?.genres && reviewStep === 1
                        ? userProfile?.genres
                        : ["all"],
                startYear: Number(userProfile?.yearFrom || 1960),
                endYear: Number(userProfile?.yearTo || getCurrentYear()),
                userId: user.uid,
                reviewStep,
                limit: reviewStep === 1 ? 100 : null,
            });
        }

        return null;
    }, [
        userProfile?.genres,
        user?.uid,
        userProfile?.yearFrom,
        userProfile?.yearTo,
        reviewStep,
    ]);

    useEffect(() => {
        setCurrentTrack(null);
        setLoading(true);
        setNoTracks(false);
    }, [reviewStep]);

    const onGetTracks = useCallback(
        async (forceFetch: boolean = false) => {
            if (forceFetch) {
                const tracks = await getTracks();
                setFetchAttempted(true);
                if (tracks && tracks.length > 0) {
                    updateReviewTracks(reviewStep, tracks, 0);
                    setLoading(false);
                    setNoTracks(false);
                    setLoadMoreTracks(false);
                } else {
                    setCurrentTrack(null);
                    setNoTracks(true);
                    setLoading(false);
                }
                updateChangesMade(reviewStep, false);
            }
        },
        [getTracks]
    );

    useEffect(() => {
        if (reviewTracks[reviewStep].tracks.length > 0) {
            setLoading(false);
            setCurrentTrack(
                reviewTracks[reviewStep].tracks[
                    reviewTracks[reviewStep].currentTrack
                ] as Track
            );
        } else {
            setCurrentTrack(null);
            setLoading(false);

            if (reviewStep === 1) {
                setLoadMoreTracks(true);
            } else {
                setNoTracks(true);
            }
        }
    }, [reviewTracks[reviewStep].tracks]);

    useEffect(() => {
        if (
            userProfile?.genres &&
            userProfile?.yearFrom &&
            userProfile?.yearTo
        ) {
            onGetTracks(
                reviewStep === 1
                    ? changesMade[reviewStep as keyof typeof changesMade] ||
                          reviewTracks[reviewStep].tracks.length === 0
                    : changesMade[reviewStep as keyof typeof changesMade]
            );
        }
    }, [reviewStep]);

    useEffect(() => {
        if (hasUserProfileChanged) {
            onGetTracks(true);
        }
    }, [hasUserProfileChanged]);

    const showToast = useCallback(
        ({ type, title, description }: { type?: string; title?: string; description?: string }) => {
            toaster.create({
                id,
                title: title || "An error has occured.",
                description: description || "Please try again later.",
                type: (type as "success" | "error" | "warning" | "info") || "error",
                duration: 5000,
            });
        },
        []
    );

    const likeOrDislike = async (like: boolean) => {
        try {
            if (currentTrack && user?.uid) {
                setIndexOfTrack(
                    reviewTracks[reviewStep].tracks.findIndex(
                        (t) => t.id === currentTrack.id
                    )
                );

                setLoading(true);
                setPreviewLoading(true);
                const track = { ...currentTrack };

                if (reviewTracks[reviewStep].tracks.length > 0) {
                    if (reviewTracks[reviewStep].tracks.length === 1) {
                        onGetTracks(
                            changesMade[reviewStep as keyof typeof changesMade]
                        );
                        await updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                            curatedMode: userProfile?.curatedMode ?? false,
                        });
                    } else {
                        updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                            curatedMode: userProfile?.curatedMode ?? false,
                        });
                    }

                    updateReviewTracks(
                        reviewStep,
                        reviewTracks[reviewStep].tracks.filter(
                            (t) => t.id !== track.id
                        ),
                        0
                    );
                }
                const nextStep = (!userProfile?.curatedMode && reviewStep === 1) ? 4 : reviewStep + 1;
                updateChangesMade(nextStep, true);
            }
        } catch (error) {
            showToast({
                type: "error",
                title: "Error saving track",
            });
        }
    };

    const onGenreApply = async (selectedGenres: string[]) => {
        if (user?.uid) {
            const sorted = [...selectedGenres].sort();
            const prevSorted = [...(userProfile?.genres || ["all"])].sort();
            const changed = JSON.stringify(sorted) !== JSON.stringify(prevSorted);

            if (changed) {
                const newProfile = await mutateUserProfile({
                    userId: user.uid,
                    genres: selectedGenres,
                });
                setRecentGenres((prev) =>
                    Array.from(new Set([...prev, ...selectedGenres.filter((g) => g !== "all")]))
                );
                updateUserProfile(newProfile);
                setCurrentTrack(null);
                setListened(false);
                setIsPlaying(false);
            }
        }
        setShowGenreSelector(false);
    };

    const onYearConfirm = async (val: YearRange) => {
        const newProfile = await mutateUserProfile({
            userId: user?.uid || "",
            yearFrom: Number(val.from),
            yearTo: Number(val.to),
        });
        updateUserProfile(newProfile);
        setCurrentTrack(null);
        setListened(false);
        setIsPlaying(false);
        setShowYearSelector(false);
    };

    return {
        onYearConfirm,
        onGenreApply,
        onGetTracks,
        likeOrDislike,
        recentGenres,
        setRecentGenres,
        user,
        userProfile,
        updateUserProfile,
        prevUserProfile,
        setPrevUserProfile,
        hasUserProfileChanged,
        currentTrack,
        setCurrentTrack,
        noTracks,
        setNoTracks,
        showYearSelector,
        setShowYearSelector,
        showGenreSelector,
        setShowGenreSelector,
        listened,
        setListened,
        isPlaying,
        setIsPlaying,
        id,
        loading,
        setLoading,
        loadMoreTracks,
        setLoadMoreTracks,
        fetchAttempted,
        setFetchAttempted,
        autoplayLoading,
        setAutoplayLoading,
        reviewTracks,
        updateReviewTracks,
        resolvedPreviewUrl,
        previewLoading,
    };
};

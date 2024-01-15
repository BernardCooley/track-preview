import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { getCurrentYear } from "../../utils";
import { useTrackContext } from "../../context/TrackContext";
import {
    fetchTracks,
    mutateUserProfile,
    updateTrackReviewStep,
} from "@/bff/bff";
import { useLocalStorage } from "usehooks-ts";
import { useToast, ToastProps } from "@chakra-ui/react";
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
    const toast = useToast();
    const id = "review-toast";
    const [loading, setLoading] = useState<boolean>(true);
    const [loadMoreTracks, setLoadMoreTracks] = useState<boolean>(false);
    const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);
    const [autoplayLoading, setAutoplayLoading] = useState<boolean>(false);

    const comparisonUserProfile = (profile: UserProfile | null) => {
        if (profile === null) return;

        const { autoplay, ...rest } = profile;
        return JSON.stringify(rest);
    };

    const hasUserProfileChanged =
        comparisonUserProfile(prevUserProfile) !==
        comparisonUserProfile(userProfile);

    useEffect(() => {
        setPrevUserProfile(userProfile);
    }, [userProfile]);

    useEffect(() => {
        if (currentTrack) {
            setListened(false);
            setIsPlaying(false);
        }
    }, [currentTrack]);

    const getTracks = useCallback(async () => {
        setCurrentTrack(null);
        if (userProfile?.genre && user?.uid) {
            setLoading(true);
            return await fetchTracks({
                genre:
                    userProfile?.genre && reviewStep === 1
                        ? userProfile?.genre
                        : "all",
                startYear: Number(userProfile?.yearFrom || 1960),
                endYear: Number(userProfile?.yearTo || getCurrentYear()),
                userId: user.uid,
                reviewStep,
                limit: reviewStep === 1 ? 100 : null,
            });
        }

        return null;
    }, [
        userProfile?.genre,
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
                    updateReviewTracks(reviewStep, tracks);
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
        if (reviewTracks[reviewStep].length > 0) {
            setLoading(false);
            setCurrentTrack(reviewTracks[reviewStep][0] as Track);
        } else {
            setCurrentTrack(null);
            setLoading(false);

            if (reviewStep === 1) {
                setLoadMoreTracks(true);
            } else {
                setNoTracks(true);
            }
        }
    }, [reviewTracks[reviewStep]]);

    useEffect(() => {
        if (
            userProfile?.genre &&
            userProfile?.yearFrom &&
            userProfile?.yearTo
        ) {
            onGetTracks(
                reviewStep === 1
                    ? changesMade[reviewStep as keyof typeof changesMade] ||
                          reviewTracks[reviewStep].length === 0
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
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
    );

    const likeOrDislike = async (like: boolean) => {
        try {
            if (currentTrack && user?.uid) {
                setLoading(true);
                const track = { ...currentTrack };
                setCurrentTrack(null);

                if (reviewTracks[reviewStep].length > 0) {
                    if (reviewTracks[reviewStep].length === 1) {
                        onGetTracks(
                            changesMade[reviewStep as keyof typeof changesMade]
                        );
                        await updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                        });
                    } else {
                        updateTrackReviewStep({
                            trackId: track.id,
                            reviewStep,
                            like,
                            userId: user.uid,
                        });
                    }

                    updateReviewTracks(
                        reviewStep,
                        reviewTracks[reviewStep].slice(1)
                    );
                }
                updateChangesMade(reviewStep + 1, true);
            }
        } catch (error) {
            showToast({
                status: "error",
                title: "Error saving track",
            });
        }
    };

    const onGenreSelect = async (gen: string) => {
        if (user?.uid && gen !== userProfile?.genre) {
            const newProfile = await mutateUserProfile({
                userId: user.uid,
                genre: gen,
            });
            setRecentGenres((prev) => Array.from(new Set([...prev, gen])));
            updateUserProfile(newProfile);
            setCurrentTrack(null);
            setListened(false);
            setIsPlaying(false);
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
        onGenreSelect,
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
        toast,
        id,
        loading,
        setLoading,
        loadMoreTracks,
        setLoadMoreTracks,
        fetchAttempted,
        setFetchAttempted,
        autoplayLoading,
        setAutoplayLoading,
    };
};

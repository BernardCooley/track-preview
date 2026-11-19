'use client';

import React, { createContext, MutableRefObject, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { ReviewTracks, Track } from "../types";

export interface PlayingTrackInfo {
    title: string;
    artist: string;
    thumbnail: string;
}

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    onTrackEndedRef: MutableRefObject<(() => void) | null>;
    onSkipRef: MutableRefObject<(() => void) | null>;
    onPreviousRef: MutableRefObject<(() => void) | null>;
    playingPositionRef: MutableRefObject<{ index: number; total: number } | null>;
    trackLoading: "skip" | "previous" | null;
    setTrackLoading: (loading: "skip" | "previous" | null) => void;
    playingTrack: PlayingTrackInfo | null;
    setPlayingTrack: (track: PlayingTrackInfo | null) => void;
    reviewTracks: ReviewTracks;
    updateReviewTracks: (
        reviewStep: number,
        tracks: Track[],
        currentTrackIndex: number
    ) => void;
    currentReleaseTrack: Track | null;
    updateCurrentReleaseTrack: (track: Track | null) => void;
    previousTracks: Track[];
    updatePreviousTracks: (tracks: Track[]) => void;
    changesMade: {
        2: boolean;
        3: boolean;
        4: boolean;
    };
    updateChangesMade: (reviewStep: number, changesMade: boolean) => void;
}

export const TrackContext = createContext<TrackContextProps | null>(null);

export const useTrackContext = () => {
    const trackContext = useContext(TrackContext);

    if (!trackContext) {
        throw new Error(
            "useTrackContext has to be used within <TrackContext.Provider>"
        );
    }

    return trackContext;
};

export const TrackContextProvider = ({ children }: { children: ReactNode }) => {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string>("");
    const [reviewTracks, setReviewTracks] = useState<ReviewTracks>({
        1: {
            tracks: [],
            currentTrack: 0,
        },
        2: {
            tracks: [],
            currentTrack: 0,
        },
        3: {
            tracks: [],
            currentTrack: 0,
        },
        4: {
            tracks: [],
            currentTrack: 0,
        },
    });
    const [currentReleaseTrack, setCurrentReleaseTrack] =
        useState<Track | null>(null);
    const [previousTracks, setPreviousTracks] = useState<Track[]>([]);
    const [changesMade, setChangesMade] = useState<{
        2: boolean;
        3: boolean;
        4: boolean;
    }>({
        2: true,
        3: true,
        4: true,
    });

    const onTrackEndedRef = useRef<(() => void) | null>(null);
    const onSkipRef = useRef<(() => void) | null>(null);
    const onPreviousRef = useRef<(() => void) | null>(null);
    const playingPositionRef = useRef<{ index: number; total: number } | null>(null);
    const [trackLoading, setTrackLoadingState] = useState<"skip" | "previous" | null>(null);
    const setTrackLoading = useCallback((loading: "skip" | "previous" | null) => setTrackLoadingState(loading), []);
    const [playingTrack, setPlayingTrackState] = useState<PlayingTrackInfo | null>(null);
    const setPlayingTrack = useCallback((track: PlayingTrackInfo | null) => setPlayingTrackState(track), []);

    const updateCurrentlyPlaying = (trackId: string | undefined) => {
        setCurrentlyPlaying(trackId || "");
    };

    const updateReviewTracks = (
        reviewStep: number,
        tracks: Track[],
        currentTrackIndex: number
    ) => {
        setReviewTracks(
            (prevReviewTracks) =>
                ({
                    ...prevReviewTracks,
                    [reviewStep]: {
                        tracks,
                        currentTrack: currentTrackIndex,
                    },
                } as ReviewTracks)
        );
    };

    const updateCurrentReleaseTrack = (track: Track | null) => {
        setCurrentReleaseTrack(track);
    };

    const updatePreviousTracks = (tracks: Track[]) => {
        setPreviousTracks(tracks);
    };

    const updateChangesMade = (reviewStep: number, changesMade: boolean) => {
        setChangesMade((prevChangesMade) => ({
            ...prevChangesMade,
            [reviewStep]: changesMade,
        }));
    };

    return (
        <TrackContext.Provider
            value={{
                currentlyPlaying,
                updateCurrentlyPlaying,
                onTrackEndedRef,
                onSkipRef,
                onPreviousRef,
                playingPositionRef,
                trackLoading,
                setTrackLoading,
                playingTrack,
                setPlayingTrack,
                reviewTracks,
                updateReviewTracks,
                currentReleaseTrack,
                updateCurrentReleaseTrack,
                previousTracks,
                updatePreviousTracks,
                changesMade,
                updateChangesMade,
            }}
        >
            {children}
        </TrackContext.Provider>
    );
};

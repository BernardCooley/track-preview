'use client';

import React, { createContext, ReactNode, useContext, useState } from "react";
import { ReviewTracks, Track } from "../types";

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
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

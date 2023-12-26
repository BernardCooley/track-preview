'use client';

import React, { createContext, ReactNode, useContext, useState } from "react";
import { ReviewTracks, Track } from "../types";

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    reviewTracks: ReviewTracks;
    updateReviewTracks: (reviewStep: number, tracks: Track[]) => void;
    addedToLibrary: boolean;
    updateAddedToLibrary: (addedToLibrary: boolean) => void;
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
        1: [],
        2: [],
        3: [],
        4: [],
    });
    const [addedToLibrary, setAddedToLibrary] = useState<boolean>(false);

    const updateCurrentlyPlaying = (trackId: string | undefined) => {
        setCurrentlyPlaying(trackId || "");
    };

    const updateReviewTracks = (reviewStep: number, tracks: Track[]) => {
        setReviewTracks((prevReviewTracks) => ({
            ...prevReviewTracks,
            [reviewStep]: tracks,
        }));
    };

    const updateAddedToLibrary = (addedToLibrary: boolean) => {
        setAddedToLibrary(addedToLibrary);
    };

    return (
        <TrackContext.Provider
            value={{
                currentlyPlaying,
                updateCurrentlyPlaying,
                reviewTracks,
                updateReviewTracks,
                addedToLibrary,
                updateAddedToLibrary,
            }}
        >
            {children}
        </TrackContext.Provider>
    );
};

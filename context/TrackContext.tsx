'use client';

import { StoredTrack } from "@prisma/client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { Track } from "../types";

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    step1Tracks: StoredTrack[];
    updateStep1Tracks: (tracks: StoredTrack[]) => void;
    step1CurrentTrack: Track | null;
    updateStep1CurrentTrack: (track: Track | null) => void;
    step1QueuedTrack: Track | null;
    updateStep1QueuedTrack: (track: Track | null) => void;
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
    const [step1Tracks, setStep1Tracks] = useState<StoredTrack[]>([]);
    const [step1CurrentTrack, setStep1CurrentTrack] = useState<Track | null>(
        null
    );
    const [step1QueuedTrack, setStep1QueuedTrack] = useState<Track | null>(
        null
    );

    const updateCurrentlyPlaying = (trackId: string | undefined) => {
        setCurrentlyPlaying(trackId || "");
    };

    const updateStep1Tracks = (tracks: StoredTrack[]) => {
        setStep1Tracks(tracks);
    };

    const updateStep1CurrentTrack = (track: Track | null) => {
        setStep1CurrentTrack(track);
    };

    const updateStep1QueuedTrack = (track: Track | null) => {
        setStep1QueuedTrack(track);
    };

    return (
        <TrackContext.Provider
            value={{
                currentlyPlaying,
                updateCurrentlyPlaying,
                step1Tracks,
                updateStep1Tracks,
                step1CurrentTrack,
                updateStep1CurrentTrack,
                step1QueuedTrack,
                updateStep1QueuedTrack,
            }}
        >
            {children}
        </TrackContext.Provider>
    );
};

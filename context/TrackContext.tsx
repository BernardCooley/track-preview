'use client';

import React, { createContext, ReactNode, useContext, useState } from "react";
import { Track, YearRange } from "../types";

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    step1Tracks: Track[];
    updateStep1Tracks: (tracks: Track[]) => void;
    step1CurrentTrack: Track | null;
    updateStep1CurrentTrack: (track: Track | null) => void;
    yearRange: YearRange | null;
    updateYearRange: (yearRange: YearRange) => void;
    genre: string | null;
    updateGenre: (genre: string | null) => void;
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
    const [step1Tracks, setStep1Tracks] = useState<Track[]>([]);
    const [step1CurrentTrack, setStep1CurrentTrack] = useState<Track | null>(
        null
    );
    const [yearRange, setYearRange] = useState<YearRange | null>(null);
    const [genre, setGenre] = useState<string | null>(null);

    const updateCurrentlyPlaying = (trackId: string | undefined) => {
        setCurrentlyPlaying(trackId || "");
    };

    const updateStep1Tracks = (tracks: Track[]) => {
        setStep1Tracks(tracks);
    };

    const updateStep1CurrentTrack = (track: Track | null) => {
        setStep1CurrentTrack(track);
    };

    const updateYearRange = (yearRange: YearRange) => {
        setYearRange(yearRange);
    };

    const updateGenre = (genre: string | null) => {
        setGenre(genre);
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
                yearRange,
                updateYearRange,
                genre,
                updateGenre,
            }}
        >
            {children}
        </TrackContext.Provider>
    );
};

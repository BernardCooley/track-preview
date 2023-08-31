'use client';

import React, { createContext, ReactNode, useContext, useState } from "react";

interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    currentStep: number;
    updateCurrentStep: (step: number) => void;
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

export const TrackContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [currentStep, setCurrentlStep] = useState<number>(1);

    const updateCurrentStep = (step: number) => {
        setCurrentlStep(step);
    };

    const[currentlyPlaying, setCurrentlyPlaying] = useState<string>("");

    const updateCurrentlyPlaying = (trackId: string | undefined) => {
        setCurrentlyPlaying(trackId || "");
    };


    return (
        <TrackContext.Provider
            value={{
                currentStep,
                updateCurrentStep,
                currentlyPlaying,
                updateCurrentlyPlaying
            }}
        >
            {children}
        </TrackContext.Provider>
    );
};

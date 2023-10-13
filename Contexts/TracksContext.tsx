import React, { createContext, ReactNode, useContext, useState } from "react";
import { SpotifyTrack } from "../types";

interface TracksContextProps {
    tracks: SpotifyTrack[] | null;
    updateTracks: (tracks: SpotifyTrack[] | null) => void;
}

export const TracksContext = createContext<TracksContextProps | null>(null);

export const useTracksContext = () => {
    const tracksContext = useContext(TracksContext);

    if (!tracksContext) {
        throw new Error(
            "useTracksContext has to be used within <TracksContext.Provider>"
        );
    }

    return tracksContext;
};

export const TracksContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [tracks, setTracks] = useState<SpotifyTrack[] | null>(null);

    const updateTracks = (tracks: SpotifyTrack[] | null) => {
        setTracks(tracks);
    };

    return (
        <TracksContext.Provider
            value={{
                tracks,
                updateTracks,
            }}
        >
            {children}
        </TracksContext.Provider>
    );
};

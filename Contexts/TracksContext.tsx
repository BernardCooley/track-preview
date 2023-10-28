import React, { createContext, ReactNode, useContext, useState } from "react";
import { SearchedTrack } from "../types";

interface TracksContextProps {
    tracks: SearchedTrack[] | null;
    updateTracks: (tracks: SearchedTrack[] | null) => void;
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
    const [tracks, setTracks] = useState<SearchedTrack[] | null>(null);

    const updateTracks = (tracks: SearchedTrack[] | null) => {
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

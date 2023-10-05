import React, { createContext, ReactNode, useContext, useState } from "react";
import { ITrack } from "../types";

interface TracksContextProps {
    tracks: ITrack[] | null;
    updateTracks: (tracks: ITrack[] | null) => void;
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
    const [tracks, setTracks] = useState<ITrack[] | null>(null);

    const updateTracks = (tracks: ITrack[] | null) => {
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

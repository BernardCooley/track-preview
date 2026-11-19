import type { MutableRefObject } from "react";
import type { Track, ReviewTracks } from "../types";

export interface TrackContextProps {
    currentlyPlaying: string | undefined;
    updateCurrentlyPlaying: (trackId: string | undefined) => void;
    onTrackEndedRef: MutableRefObject<(() => void) | null>;
    reviewTracks: ReviewTracks;
    updateReviewTracks: (reviewStep: number, tracks: Track[], currentTrackIndex: number) => void;
    currentReleaseTrack: Track | null;
    updateCurrentReleaseTrack: (track: Track | null) => void;
    previousTracks: Track[];
    updatePreviousTracks: (tracks: Track[]) => void;
    changesMade: { 2: boolean; 3: boolean; 4: boolean };
    updateChangesMade: (reviewStep: number, changesMade: boolean) => void;
}

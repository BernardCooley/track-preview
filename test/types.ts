import type { MutableRefObject } from "react";
import type { Track, ReviewTracks } from "../types";
import type { PlayingTrackInfo } from "../context/TrackContext";

export interface TrackContextProps {
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
    updateReviewTracks: (reviewStep: number, tracks: Track[], currentTrackIndex: number) => void;
    currentReleaseTrack: Track | null;
    updateCurrentReleaseTrack: (track: Track | null) => void;
    previousTracks: Track[];
    updatePreviousTracks: (tracks: Track[]) => void;
    changesMade: { 2: boolean; 3: boolean; 4: boolean };
    updateChangesMade: (reviewStep: number, changesMade: boolean) => void;
}

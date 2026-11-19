import React, { forwardRef, useEffect, useRef } from "react";
import { Flex, IconButton, Spinner } from "@chakra-ui/react";

import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { useTrackContext } from "../../context/TrackContext";

const AudioPlayer = forwardRef<HTMLAudioElement>((props, ref) => {
    const { currentlyPlaying, onTrackEndedRef, onSkipRef, onPreviousRef, currentReleaseTrack, trackLoading, playingPositionRef } = useTrackContext();
    const localRef = useRef<HTMLAudioElement | null>(null);
    const pos = playingPositionRef.current;

    useEffect(() => {
        const el = localRef.current;
        return () => {
            el?.pause();
            if (el) el.src = "";
        };
    }, []);

    return (
        <Flex w="full" alignItems="center" gap={1}>
            {currentReleaseTrack && (
                <IconButton
                    variant="tertiary"
                    size="sm"
                    rounded="full"
                    color="brand.textSecondary"
                    _hover={{ color: "brand.textPrimary" }}
                    aria-label="Previous track"
                    disabled={!!trackLoading || !pos || pos.index <= 0}
                    onClick={() => onPreviousRef.current?.()}
                >
                    {trackLoading === "previous" ? <Spinner size="xs" color="brand.primary" /> : <SkipPreviousIcon style={{ fontSize: "20px" }} />}
                </IconButton>
            )}
            <audio
                ref={(node) => {
                    localRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                style={{
                    width: "100%",
                    borderRadius: "8px",
                }}
                src={currentlyPlaying || undefined}
                controls
                onEnded={() => onTrackEndedRef.current?.()}
            />
            {currentReleaseTrack && (
                <IconButton
                    variant="tertiary"
                    size="sm"
                    rounded="full"
                    color="brand.textSecondary"
                    _hover={{ color: "brand.textPrimary" }}
                    aria-label="Next track"
                    disabled={!!trackLoading || !pos || pos.index >= pos.total - 1}
                    onClick={() => onSkipRef.current?.()}
                >
                    {trackLoading === "skip" ? <Spinner size="xs" color="brand.primary" /> : <SkipNextIcon style={{ fontSize: "20px" }} />}
                </IconButton>
            )}
        </Flex>
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

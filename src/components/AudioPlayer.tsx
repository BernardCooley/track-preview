import React, { forwardRef, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useTrackContext } from "../../context/TrackContext";

const AudioPlayer = forwardRef<HTMLAudioElement>((props, ref) => {
    const { currentlyPlaying, onTrackEndedRef } = useTrackContext();
    const localRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const el = localRef.current;
        return () => {
            el?.pause();
            if (el) el.src = "";
        };
    }, []);

    return (
        <Box w="full">
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
        </Box>
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

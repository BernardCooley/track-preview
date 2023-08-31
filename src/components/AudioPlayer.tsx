import React, { forwardRef } from "react";
import { useTrackContext } from "../../context/TrackContext";
import { Box } from "@chakra-ui/react";

const AudioPlayer = forwardRef<HTMLAudioElement>((props, ref) => {
    const { currentlyPlaying } = useTrackContext();

    return (
        <Box w="full">
            <audio
                ref={ref}
                style={{
                    width: "100%",
                }}
                src={currentlyPlaying}
                controls
            />
        </Box>
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

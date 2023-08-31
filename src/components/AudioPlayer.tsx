import React, { forwardRef } from "react";
import { useTrackContext } from "../../context/TrackContext";

const AudioPlayer = forwardRef<HTMLAudioElement>((props, ref) => {
    const { currentlyPlaying } = useTrackContext();

    return (
        <audio
            ref={ref}
            style={{
                width: "100%",
                position: "absolute",
                top: "0px",
            }}
            src={currentlyPlaying}
            controls
        />
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

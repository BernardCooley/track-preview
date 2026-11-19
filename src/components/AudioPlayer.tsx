import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, IconButton, Image, Spinner, Text } from "@chakra-ui/react";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useTrackContext } from "../../context/TrackContext";

function ProgressBar({ currentTime, duration, onSeek }: { currentTime: number; duration: number; onSeek: (time: number) => void }) {
    const barRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const seek = useCallback(
        (clientX: number) => {
            const bar = barRef.current;
            if (!bar || !duration) return;
            const rect = bar.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            onSeek(ratio * duration);
        },
        [duration, onSeek]
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            seek(e.clientX);
        },
        [seek]
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (dragging.current) seek(e.clientX);
        },
        [seek]
    );

    const onPointerUp = useCallback(() => {
        dragging.current = false;
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="4px"
            bg="brand.surface"
            cursor="pointer"
            ref={barRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="slider"
            aria-label="Track progress"
            aria-valuenow={currentTime}
            aria-valuemax={duration}
        >
            <Box
                h="full"
                bg="brand.primary"
                w={`${progress}%`}
                transition={dragging.current ? "none" : "width 0.25s linear"}
                borderRadius="0 1px 1px 0"
            />
        </Box>
    );
}

const AudioPlayer = forwardRef<HTMLAudioElement>((_, ref) => {
    const {
        currentlyPlaying,
        onTrackEndedRef,
        onSkipRef,
        onPreviousRef,
        trackLoading,
        playingPositionRef,
        playingTrack,
    } = useTrackContext();

    const localRef = useRef<HTMLAudioElement | null>(null);
    const pos = playingPositionRef.current;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const el = localRef.current;
        return () => {
            el?.pause();
            if (el) el.src = "";
        };
    }, []);

    useEffect(() => {
        const el = localRef.current;
        if (!el) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(el.currentTime);
        const onDurationChange = () => setDuration(el.duration);
        const onLoadedMetadata = () => setDuration(el.duration);

        el.addEventListener("play", onPlay);
        el.addEventListener("pause", onPause);
        el.addEventListener("timeupdate", onTimeUpdate);
        el.addEventListener("durationchange", onDurationChange);
        el.addEventListener("loadedmetadata", onLoadedMetadata);

        return () => {
            el.removeEventListener("play", onPlay);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("timeupdate", onTimeUpdate);
            el.removeEventListener("durationchange", onDurationChange);
            el.removeEventListener("loadedmetadata", onLoadedMetadata);
        };
    }, [currentlyPlaying]);

    const handleSeek = useCallback((time: number) => {
        const el = localRef.current;
        if (el) el.currentTime = time;
    }, []);

    const togglePlay = useCallback(() => {
        const el = localRef.current;
        if (!el) return;
        if (el.paused) {
            el.play().catch(() => {});
        } else {
            el.pause();
        }
    }, []);

    return (
        <>
            <audio
                ref={(node) => {
                    localRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                src={currentlyPlaying || undefined}
                onEnded={() => onTrackEndedRef.current?.()}
            />

            <Flex
                alignItems="center"
                gap={2}
                position="relative"
                py={1.5}
            >
                {playingTrack && (
                    <Flex alignItems="center" gap={3} minW={0} flex={1}>
                        <Image
                            rounded="md"
                            w={10}
                            h={10}
                            minW={10}
                            src={playingTrack.thumbnail}
                            alt=""
                            objectFit="cover"
                        />
                        <Flex direction="column" minW={0} gap={0.5}>
                            <Text
                                truncate
                                fontSize="sm"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                            >
                                {playingTrack.title}
                            </Text>
                            <Text truncate fontSize="xs" color="brand.textMuted">
                                {playingTrack.artist}
                            </Text>
                        </Flex>
                    </Flex>
                )}

                <Flex alignItems="center" gap={0.5} flexShrink={0}>
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
                        {trackLoading === "previous" ? (
                            <Spinner size="xs" color="brand.primary" />
                        ) : (
                            <SkipPreviousIcon style={{ fontSize: "20px" }} />
                        )}
                    </IconButton>

                    <IconButton
                        variant="tertiary"
                        size="sm"
                        rounded="full"
                        color="brand.textPrimary"
                        aria-label={isPlaying ? "Pause" : "Play"}
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <PauseIcon style={{ fontSize: "22px" }} />
                        ) : (
                            <PlayArrowIcon style={{ fontSize: "22px" }} />
                        )}
                    </IconButton>

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
                        {trackLoading === "skip" ? (
                            <Spinner size="xs" color="brand.primary" />
                        ) : (
                            <SkipNextIcon style={{ fontSize: "20px" }} />
                        )}
                    </IconButton>
                </Flex>

                <ProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                />
            </Flex>
        </>
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;

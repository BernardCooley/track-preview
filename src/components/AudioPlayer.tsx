import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, IconButton, Image, Spinner, Text } from "@chakra-ui/react";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { useTrackContext } from "../../context/TrackContext";

function ProgressBar({ currentTime, duration, onSeek }: { currentTime: number; duration: number; onSeek: (time: number) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const interacting = useRef(false);

    useEffect(() => {
        if (!interacting.current && inputRef.current) {
            inputRef.current.value = String(currentTime);
        }
    }, [currentTime]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.max = String(duration || 1);
        }
    }, [duration]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <Box position="absolute" bottom={0} left={0} right={0} h="4px">
            <input
                ref={inputRef}
                className="library-progress"
                type="range"
                min={0}
                max={duration || 1}
                step="any"
                defaultValue={0}
                onPointerDown={() => { interacting.current = true; }}
                onTouchStart={() => { interacting.current = true; }}
                onInput={(e) => onSeek(parseFloat((e.target as HTMLInputElement).value))}
                onPointerUp={() => { interacting.current = false; }}
                onTouchEnd={() => { interacting.current = false; }}
                onChange={() => {}}
                aria-label="Track progress"
                style={{
                    display: "block",
                    width: "100%",
                    height: "32px",
                    margin: 0,
                    padding: 0,
                    position: "absolute",
                    top: "-14px",
                    left: 0,
                    border: "none",
                    outline: "none",
                    cursor: "pointer",
                    WebkitAppearance: "none",
                    appearance: "none",
                    background: "transparent",
                    touchAction: "none",
                    zIndex: 1,
                }}
            />
            <Box h="full" bg="brand.surface" w="full" borderRadius="2px" overflow="hidden">
                <Box
                    h="full"
                    bg="brand.primary"
                    w={`${progress}%`}
                    borderRadius="2px"
                    pointerEvents="none"
                />
            </Box>
            <style>{`
                .library-progress::-webkit-slider-runnable-track {
                    height: 4px;
                    border-radius: 2px;
                    background: transparent;
                }
                .library-progress::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--chakra-colors-brand-primary);
                    margin-top: -5px;
                    border: none;
                }
                .library-progress::-moz-range-track {
                    height: 4px;
                    border-radius: 2px;
                    background: transparent;
                    border: none;
                }
                .library-progress::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--chakra-colors-brand-primary);
                    border: none;
                }
            `}</style>
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

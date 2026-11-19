import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
    Box,
    Card,
    Collapsible,
    Flex,
    Separator,
    Spinner,
    Text,
} from "@chakra-ui/react";
import { Track } from "../../types";
import ThumbDownAltTwoToneIcon from "@mui/icons-material/ThumbDownAltTwoTone";
import BouncingDotsLoader from "./BouncingLoaderDots";
import ThumbUpAltTwoToneIcon from "@mui/icons-material/ThumbUpAltTwoTone";
import SwipeOutlinedIcon from "@mui/icons-material/SwipeOutlined";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import FullTrackLinks from "./FullTrackLinks";
import ToggleTracklist from "./ToggleTracklist";
import TrackCardIcon from "./TrackCardIcon";

const SWIPE_THRESHOLD = 80;

interface Props {
    loadingMessage?: string;
    currentTrack: Track;
    previewUrl?: string;
    onLikeOrDislike: (liked: boolean) => Promise<void>;
    onAudioPlay: () => void;
    autoplay?: boolean;
    isOpen: boolean;
    trackList: Track[];
    setCurrentTrack: (track: Track) => void;
    onAutoPlayToggle: () => void;
    preferredAutoPlay: boolean;
    profileLoaded: boolean;
    autoplayLoading?: boolean;
    noTracks: boolean;
    loading: boolean;
    reviewStep: number;
    toggleTracklist: () => void;
    isShowingTracklist: boolean;
    swipeMode: boolean;
    curatedMode: boolean;
    onSendToLibrary: () => void;
}

const TrackReviewCard = ({
    loadingMessage,
    currentTrack,
    previewUrl,
    onLikeOrDislike,
    onAudioPlay,
    autoplay,
    isOpen,
    trackList,
    setCurrentTrack,
    onAutoPlayToggle,
    preferredAutoPlay,
    profileLoaded,
    autoplayLoading = false,
    noTracks,
    loading,
    reviewStep,
    toggleTracklist,
    isShowingTracklist,
    swipeMode,
    curatedMode,
    onSendToLibrary,
}: Props) => {
    const playerRef = useRef<AudioPlayer>(null);
    const indexOfCurrentTrack = trackList.findIndex(
        (t) => t.id === currentTrack.id
    );

    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [skipTransition, setSkipTransition] = useState(false);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const [swipedColor, setSwipedColor] = useState<"like" | "dislike" | null>(null);

    useEffect(() => {
        setSwipedColor(null);
    }, [currentTrack.id]);
    const startX = useRef(0);
    const startY = useRef(0);
    const locked = useRef<"horizontal" | "vertical" | null>(null);

    useEffect(() => {
        const seen = localStorage.getItem("swipeHintSeen");
        if (!seen && !loading && !noTracks) {
            setShowSwipeHint(true);
        }
    }, [loading, noTracks]);

    const dismissHint = useCallback(() => {
        if (showSwipeHint) {
            setShowSwipeHint(false);
            localStorage.setItem("swipeHintSeen", "1");
        }
    }, [showSwipeHint]);

    const onDragStart = useCallback((clientX: number, clientY: number) => {
        startX.current = clientX;
        startY.current = clientY;
        locked.current = null;
        setSkipTransition(false);
        setIsDragging(true);
    }, []);

    const onDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;

        const dx = clientX - startX.current;
        const dy = clientY - startY.current;

        if (!locked.current) {
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                locked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
            }
            return;
        }

        if (locked.current === "vertical") return;
        setDragX(dx);
    }, [isDragging]);

    const onDragEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);
        const swiped = locked.current === "horizontal" && Math.abs(dragX) > SWIPE_THRESHOLD;
        const liked = dragX > 0;
        flushSync(() => {
            setSkipTransition(true);
            setDragX(0);
        });
        locked.current = null;
        if (swiped) {
            setSwipedColor(liked ? "like" : "dislike");
            dismissHint();
            onLikeOrDislike(liked);
        }
    }, [isDragging, dragX, onLikeOrDislike, dismissHint]);

    const swipeProgress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
    const swipeDirection = dragX > 0 ? "like" : dragX < 0 ? "dislike" : null;

    return (
        <Collapsible.Root open={isOpen} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Collapsible.Content style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <Flex justify="center" w="full" position="relative" flex={1} bg="brand.bg" overflow="hidden">
                    {swipeMode && (swipedColor || (isDragging && Math.abs(dragX) > 10)) && (
                        <Box
                            position="absolute"
                            inset={0}
                            pointerEvents="none"
                            bg={
                                swipedColor
                                    ? swipedColor === "like"
                                        ? "rgba(16, 185, 129, 0.12)"
                                        : "rgba(239, 68, 68, 0.12)"
                                    : dragX > 0
                                        ? `rgba(16, 185, 129, ${swipeProgress * 0.12})`
                                        : `rgba(239, 68, 68, ${swipeProgress * 0.12})`
                            }
                            transition="background 0.1s ease"
                            zIndex={0}
                        />
                    )}
                    {swipeMode && showSwipeHint && (
                        <Flex
                            position="absolute"
                            top="28%"
                            left={0}
                            right={0}
                            zIndex={10}
                            justifyContent="center"
                            alignItems="center"
                            direction="column"
                            gap={2}
                            pointerEvents="none"
                            opacity={1 - swipeProgress}
                            transition={isDragging ? "none" : "opacity 0.3s ease"}
                            css={{
                                animation: "swipeHintIn 0.5s ease",
                                "@keyframes swipeHintIn": {
                                    from: { opacity: 0, transform: "scale(0.9)" },
                                    to: { opacity: 1, transform: "scale(1)" },
                                },
                                "@keyframes swipeHintRock": {
                                    "0%, 100%": { transform: "rotate(0deg)" },
                                    "25%": { transform: "rotate(-12deg)" },
                                    "75%": { transform: "rotate(12deg)" },
                                },
                            }}
                        >
                            <Flex
                                bg="blackAlpha.600"
                                rounded="2xl"
                                px={5}
                                py={4}
                                direction="column"
                                alignItems="center"
                                gap={2}
                                backdropFilter="blur(4px)"
                            >
                                <Box
                                    animation="swipeHintRock 1.5s ease-in-out infinite"
                                    color="whiteAlpha.700"
                                >
                                    <SwipeOutlinedIcon style={{ fontSize: "56px" }} />
                                </Box>
                                <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.900">
                                    Swipe to skip or like
                                </Text>
                            </Flex>
                        </Flex>
                    )}

                    {loadingMessage && loadingMessage.length > 0 && (
                        <Flex
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            zIndex={300}
                            bg="brand.surfaceRaised"
                            border="1px solid"
                            borderColor="brand.border"
                            rounded="lg"
                            px={5}
                            py={3}
                            shadow="lg"
                            alignItems="center"
                            gap={3}
                        >
                            <Text fontSize="md" color="brand.textPrimary">
                                {loadingMessage}
                            </Text>
                            <BouncingDotsLoader />
                        </Flex>
                    )}

                    {swipeMode && swipeDirection && (
                        <Flex
                            position="absolute"
                            top="30%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            zIndex={10}
                            opacity={swipeProgress}
                            transition={isDragging ? "none" : "opacity 0.2s ease"}
                            pointerEvents="none"
                        >
                            {swipeDirection === "like" ? (
                                <ThumbUpAltTwoToneIcon style={{ fontSize: "80px", color: "var(--chakra-colors-green-400)" }} />
                            ) : (
                                <ThumbDownAltTwoToneIcon style={{ fontSize: "80px", color: "var(--chakra-colors-red-400)" }} />
                            )}
                        </Flex>
                    )}

                    <Card.Root
                        w="full"
                        flex={1}
                        bg="transparent"
                        shadow="none"
                        border="none"
                        opacity={
                            loadingMessage && loadingMessage.length > 0 ? 0.2 : 1
                        }
                        transition="opacity 0.3s ease"
                        display="flex"
                        flexDirection="column"
                    >
                        <Card.Body
                            data-track-thumbnail
                            w="full"
                            flex={1}
                            p={0}
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            bgImage={`url(${currentTrack.thumbnail})`}
                            bgSize="cover"
                            backgroundPosition="center"
                            position="relative"
                            overflow="hidden"
                            _before={{
                                content: '""',
                                position: "absolute",
                                inset: 0,
                                bg: "linear-gradient(to bottom, color-mix(in srgb, var(--chakra-colors-brand-bg) 30%, transparent) 0%, color-mix(in srgb, var(--chakra-colors-brand-bg) 85%, transparent) 60%, color-mix(in srgb, var(--chakra-colors-brand-bg) 95%, transparent) 100%)",
                            }}
                            {...(swipeMode ? {
                                onTouchStart: (e: React.TouchEvent) => onDragStart(e.touches[0].clientX, e.touches[0].clientY),
                                onTouchMove: (e: React.TouchEvent) => onDragMove(e.touches[0].clientX, e.touches[0].clientY),
                                onTouchEnd: onDragEnd,
                                onMouseDown: (e: React.MouseEvent) => onDragStart(e.clientX, e.clientY),
                                onMouseMove: (e: React.MouseEvent) => onDragMove(e.clientX, e.clientY),
                                onMouseUp: onDragEnd,
                                onMouseLeave: () => { if (isDragging) onDragEnd(); },
                            } : {})}
                            style={swipeMode ? {
                                touchAction: "pan-y",
                                transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                                transition: isDragging || skipTransition ? "none" : "transform 0.3s ease",
                            } : undefined}
                        >

                            {!noTracks &&
                                !loading &&
                                reviewStep > 1 &&
                                reviewStep < 4 && (
                                    <Box position="relative" zIndex={1} alignSelf="flex-end">
                                        <ToggleTracklist
                                            toggleTracklist={toggleTracklist}
                                            isShowingTracklist={isShowingTracklist}
                                        />
                                    </Box>
                                )}

                            <Flex flex={1} alignItems="flex-end" justifyContent="center" pb={12} position="relative" zIndex={1}>
                                <Flex direction="column" alignItems="center" gap={6}>
                                    {!swipeMode && (
                                        <Flex justifyContent="center" alignItems="center" gap={[8, 12]}>
                                            <TrackCardIcon
                                                ariaLabel="dislike button"
                                                onClick={async () => onLikeOrDislike(false)}
                                                colorPalette="red"
                                                Icon={ThumbDownAltTwoToneIcon}
                                            />
                                            <TrackCardIcon
                                                ariaLabel="like button"
                                                onClick={async () => onLikeOrDislike(true)}
                                                colorPalette="green"
                                                Icon={ThumbUpAltTwoToneIcon}
                                            />
                                        </Flex>
                                    )}
                                    {curatedMode && (
                                        <Box
                                            onClick={onSendToLibrary}
                                            rounded="full"
                                            py={1}
                                            px={3}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            gap={1.5}
                                            border="1px solid"
                                            borderColor="brand.border"
                                            bg="blackAlpha.500"
                                            cursor="pointer"
                                            transition="all 0.2s ease"
                                            _hover={{
                                                borderColor: "brand.primary",
                                                bg: "brand.primarySubtle",
                                            }}
                                            _active={{
                                                transform: "scale(0.95)",
                                            }}
                                            color="whiteAlpha.900"
                                        >
                                            <Text
                                                fontSize="xs"
                                                fontWeight="medium"
                                                userSelect="none"
                                                whiteSpace="nowrap"
                                            >
                                                Save to library
                                            </Text>
                                        </Box>
                                    )}
                                </Flex>
                            </Flex>

                            <Flex
                                direction="column"
                                w="full"
                                position="relative"
                                zIndex={1}
                            >
                                <AudioPlayer
                                    ref={playerRef}
                                    style={{ backgroundColor: "transparent" }}
                                    autoPlayAfterSrcChange={autoplay}
                                    header={
                                        <Flex
                                            data-track-info
                                            alignItems="center"
                                            direction="column"
                                            gap={1}
                                            pb={2}
                                        >
                                            <Text
                                                textAlign="center"
                                                w="full"
                                                fontSize={["xl", "2xl"]}
                                                fontWeight="semibold"
                                                lineClamp={2}
                                                color="brand.textPrimary"
                                            >
                                                {currentTrack.title}
                                            </Text>
                                            <Text
                                                textAlign="center"
                                                lineClamp={2}
                                                fontSize={["md", "lg"]}
                                                color="brand.textSecondary"
                                            >
                                                {currentTrack.artist}
                                            </Text>
                                            <Flex
                                                py={1}
                                                fontSize="sm"
                                                justifyContent="space-between"
                                                w="full"
                                                color="brand.textMuted"
                                            >
                                                <Text lineClamp={1}>
                                                    {currentTrack.genre}
                                                </Text>
                                                <Text whiteSpace="nowrap">
                                                    {currentTrack.releaseYear}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    }
                                    autoPlay={autoplay}
                                    src={previewUrl || undefined}
                                    showJumpControls={false}
                                    showSkipControls={true}
                                    onClickNext={() => {
                                        indexOfCurrentTrack < trackList.length - 1
                                            ? setCurrentTrack(
                                                  trackList[indexOfCurrentTrack + 1]
                                              )
                                            : undefined;
                                    }}
                                    onClickPrevious={() => {
                                        indexOfCurrentTrack > 0
                                            ? setCurrentTrack(
                                                  trackList[indexOfCurrentTrack - 1]
                                              )
                                            : undefined;
                                    }}
                                    onPlay={onAudioPlay}
                                    customIcons={{
                                        previous:
                                            indexOfCurrentTrack > 0 ? (
                                                <SkipPreviousIcon
                                                    style={{ fontSize: "28px" }}
                                                />
                                            ) : (
                                                <Box></Box>
                                            ),
                                        next:
                                            indexOfCurrentTrack <
                                            trackList.length - 1 ? (
                                                <SkipNextIcon
                                                    style={{ fontSize: "28px" }}
                                                />
                                            ) : (
                                                <Box></Box>
                                            ),
                                    }}
                                    onEnded={() => {
                                        indexOfCurrentTrack <
                                            trackList.length - 1 && autoplay
                                            ? setCurrentTrack(
                                                  trackList[indexOfCurrentTrack + 1]
                                              )
                                            : undefined;
                                    }}
                                    customVolumeControls={[]}
                                    customControlsSection={[
                                        RHAP_UI.ADDITIONAL_CONTROLS,
                                        RHAP_UI.MAIN_CONTROLS,
                                        <Box
                                            key="AutoplayButton"
                                            rounded="full"
                                            py={1}
                                            px={3}
                                            minW="70px"
                                            h="28px"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            onClick={onAutoPlayToggle}
                                            border="1px solid"
                                            borderColor={
                                                preferredAutoPlay
                                                    ? "brand.primary"
                                                    : "brand.border"
                                            }
                                            bg={
                                                preferredAutoPlay
                                                    ? "brand.primarySubtle"
                                                    : "transparent"
                                            }
                                            cursor="pointer"
                                            transition="all 0.2s ease"
                                            _hover={{
                                                borderColor: "brand.primary",
                                            }}
                                        >
                                                {profileLoaded && !autoplayLoading ? (
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                        color={
                                                            preferredAutoPlay
                                                                ? "brand.primary"
                                                                : "brand.textSecondary"
                                                        }
                                                        userSelect="none"
                                                    >
                                                        AutoPlay
                                                    </Text>
                                                ) : (
                                                    <Flex
                                                        w="full"
                                                        justifyContent="center"
                                                    >
                                                        <Spinner
                                                            color="brand.primary"
                                                            size="xs"
                                                        />
                                                    </Flex>
                                                )}
                                            </Box>,
                                    ]}
                                />
                                <Separator borderColor="brand.divider" />
                                <FullTrackLinks
                                    onLinkClicked={() => {
                                        if (playerRef.current) {
                                            playerRef?.current?.audio.current?.pause();
                                        }
                                    }}
                                    currentTrack={currentTrack}
                                />
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                </Flex>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export default TrackReviewCard;

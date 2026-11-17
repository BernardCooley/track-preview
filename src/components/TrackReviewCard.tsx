import React, { useRef } from "react";
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
import TrackCardIcon from "./TrackCardIcon";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import FullTrackLinks from "./FullTrackLinks";
import ToggleTracklist from "./ToggleTracklist";

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
}: Props) => {
    const playerRef = useRef<AudioPlayer>(null);
    const indexOfCurrentTrack = trackList.findIndex(
        (t) => t.id === currentTrack.id
    );

    return (
        <Collapsible.Root open={isOpen} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Collapsible.Content style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <Flex justify="center" w="full" position="relative" flex={1}>
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

                            <Flex
                                direction="column"
                                flex={1}
                                w="full"
                                justifyContent="center"
                                pt={[8, 10]}
                                pb={4}
                                position="relative"
                                zIndex={1}
                            >
                                <Flex w="full" justifyContent="center" gap={[8, 12]}>
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

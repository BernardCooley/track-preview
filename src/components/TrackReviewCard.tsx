import React, { useRef } from "react";
import {
    Box,
    Card,
    Collapsible,
    Flex,
    Separator,
    Spinner,
    Tag,
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
        <Collapsible.Root open={isOpen}>
            <Collapsible.Content>
                <Flex h="auto" justify="center" w="full">
                    {loadingMessage && loadingMessage.length > 0 && (
                        <Box
                            position="absolute"
                            top="50%"
                            transform="translate(50%, 0)"
                            right="50%"
                            zIndex={300}
                        >
                            <Tag.Root size="lg" colorPalette="white"
                                padding="18px"
                                height="62px"
                                backgroundColor="brand.backgroundTertiary"
                                color="white"
                                fontSize="16px"
                                fontWeight="normal"
                                rounded="10px"
                                userSelect="none"
                                textAlign="center"
                                whiteSpace="nowrap"
                                bg="brand.backgroundTertiaryOpaque"
                                shadow="lg"
                            >
                                <Tag.Label>
                                    <Flex alignItems="center" gap={4}>
                                        <Text fontSize="xl">{loadingMessage}</Text>
                                        <BouncingDotsLoader />
                                    </Flex>
                                </Tag.Label>
                            </Tag.Root>
                        </Box>
                    )}
                    <Card.Root
                        w="full"
                        size="md"
                        backgroundColor="transparent"
                        opacity={
                            loadingMessage && loadingMessage.length > 0 ? 0.2 : 1
                        }
                    >
                        <Card.Body
                            w="full"
                            minH="456px"
                            h={["full", "unset"]}
                            p={0}
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-end"
                            justifyContent="space-between"
                            bgImage={`url(${currentTrack.thumbnail})`}
                            bgSize="cover"
                        >
                            {!noTracks &&
                                !loading &&
                                reviewStep > 1 &&
                                reviewStep < 4 && (
                                    <ToggleTracklist
                                        toggleTracklist={toggleTracklist}
                                        isShowingTracklist={isShowingTracklist}
                                    />
                                )}
                            <Flex
                                direction="column"
                                h="full"
                                w="full"
                                justifyContent="center"
                                pt={10}
                                height="256px"
                            >
                                <Flex w="full" justifyContent="space-around">
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
                                bg="brand.backgroundTertiaryOpaque3"
                                color="brand.textPrimary"
                            >
                                <AudioPlayer
                                    ref={playerRef}
                                    style={{ backgroundColor: "transparent" }}
                                    autoPlayAfterSrcChange={autoplay}
                                    header={
                                        <Flex
                                            alignItems="center"
                                            direction="column"
                                            position="relative"
                                            gap={[1, 2]}
                                        >
                                            <Text
                                                textAlign="center"
                                                w="full"
                                                fontSize={["2xl", "3xl"]}
                                                lineClamp={2}
                                                pb="2px"
                                            >
                                                {currentTrack.title}
                                            </Text>
                                            <Text
                                                textAlign="center"
                                                lineClamp={2}
                                                fontSize={["lg", "xl"]}
                                                pb="2px"
                                            >
                                                {currentTrack.artist}
                                            </Text>
                                            <Flex
                                                py={1}
                                                fontSize={["md", "lg"]}
                                                justifyContent="space-between"
                                                w="full"
                                            >
                                                <Text lineClamp={1}>
                                                    {currentTrack.genre}
                                                </Text>
                                                <Text
                                                    css={{
                                                        textWrap: "nowrap",
                                                    }}
                                                >
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
                                                    style={{ fontSize: "34px" }}
                                                />
                                            ) : (
                                                <Box></Box>
                                            ),
                                        next:
                                            indexOfCurrentTrack <
                                            trackList.length - 1 ? (
                                                <SkipNextIcon
                                                    style={{ fontSize: "34px" }}
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
                                            w="84px"
                                            py={1}
                                            px={2}
                                            onClick={onAutoPlayToggle}
                                            border="1px solid"
                                            borderColor="brand.textPrimary"
                                            bg={
                                                preferredAutoPlay
                                                    ? "brand.textPrimary"
                                                    : "transparent"
                                            }
                                        >
                                            {profileLoaded && !autoplayLoading ? (
                                                <Text
                                                    color={
                                                        preferredAutoPlay
                                                            ? "black"
                                                            : "brand.textPrimary"
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
                                <Separator />
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

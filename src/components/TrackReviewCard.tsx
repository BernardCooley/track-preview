import React from "react";
import { Box, Card, CardBody, Flex, Tag, Text } from "@chakra-ui/react";
import { Track } from "../../types";
import BouncingDotsLoader from "./BouncingLoaderDots";
import ThumbDownAltTwoToneIcon from "@mui/icons-material/ThumbDownAltTwoTone";
import ThumbUpAltTwoToneIcon from "@mui/icons-material/ThumbUpAltTwoTone";
import TrackCardIcon from "./TrackCardIcon";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

interface Props {
    loadingMessage?: string;
    currentTrack: Track;
    isPlaying: boolean;
    listened: boolean;
    onLikeOrDislike: (liked: boolean) => Promise<void>;
    onAudioPlay: () => void;
    onListenedToggle: (listened: boolean) => void;
    autoplay?: boolean;
}

const TrackReviewCard = ({
    loadingMessage,
    currentTrack,
    isPlaying,
    listened,
    onLikeOrDislike,
    onAudioPlay,
    onListenedToggle,
    autoplay,
}: Props) => {
    return (
        <Flex h="auto" mt={2} justify="center">
            {loadingMessage && loadingMessage.length > 0 && (
                <Box
                    position="absolute"
                    top="50%"
                    transform="translate(50%, 0)"
                    right="50%"
                    zIndex={300}
                >
                    <Tag size="lg" variant="loading" colorScheme="white">
                        <Flex alignItems="center" gap={4}>
                            <Text fontSize="xl">{loadingMessage}</Text>
                            <BouncingDotsLoader />
                        </Flex>
                    </Tag>
                </Box>
            )}
            <Card
                w="full"
                maxW="600px"
                size="md"
                backgroundColor="transparent"
                opacity={loadingMessage && loadingMessage.length > 0 ? 0.2 : 1}
            >
                <CardBody
                    w="full"
                    minH={["400px", "400px"]}
                    h={["full", "unset"]}
                    borderBottomRadius={20}
                    p={0}
                    as={Flex}
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    bgImage={currentTrack.thumbnail}
                    bgSize="cover"
                    rounded={20}
                >
                    <Flex
                        direction="column"
                        h="full"
                        w="full"
                        justifyContent="center"
                        pt={10}
                        height="256px"
                        roundedTop={20}
                    >
                        {isPlaying && (
                            <Flex
                                w="full"
                                pb={isPlaying ? 8 : 0}
                                justifyContent="space-around"
                            >
                                <TrackCardIcon
                                    canHover={listened}
                                    isDisabled={!listened}
                                    ariaLabel="dislike button"
                                    onClick={async () => onLikeOrDislike(false)}
                                    colorScheme="red"
                                    Icon={ThumbDownAltTwoToneIcon}
                                />
                                <TrackCardIcon
                                    canHover={listened}
                                    isDisabled={!listened}
                                    ariaLabel="like button"
                                    onClick={async () => onLikeOrDislike(true)}
                                    colorScheme="green"
                                    Icon={ThumbUpAltTwoToneIcon}
                                />
                            </Flex>
                        )}
                    </Flex>
                    <Flex
                        w="full"
                        bg="brand.backgroundTertiaryOpaque3"
                        color="brand.textPrimary"
                        roundedBottom={20}
                    >
                        <AudioPlayer
                            style={{ backgroundColor: "transparent" }}
                            autoPlayAfterSrcChange={false}
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
                                        noOfLines={2}
                                        pb="2px"
                                    >
                                        {currentTrack.title}
                                    </Text>
                                    <Text
                                        textAlign="center"
                                        noOfLines={2}
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
                                        <Text noOfLines={1}>
                                            {currentTrack.genre}
                                        </Text>
                                        <Text
                                            sx={{
                                                textWrap: "nowrap",
                                            }}
                                        >
                                            {currentTrack.releaseYear}
                                        </Text>
                                    </Flex>
                                </Flex>
                            }
                            autoPlay={autoplay}
                            src={currentTrack.previewUrl}
                            showJumpControls={false}
                            onListen={() => {
                                onListenedToggle(true);
                            }}
                            onPlay={onAudioPlay}
                        />
                    </Flex>
                </CardBody>
            </Card>
        </Flex>
    );
};

export default TrackReviewCard;

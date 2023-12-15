import React, { LegacyRef, forwardRef } from "react";
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Tag,
    Text,
} from "@chakra-ui/react";
import { SearchedTrack } from "../../types";
import BouncingDotsLoader from "./BouncingLoaderDots";
import PlayArrowTwoToneIcon from "@mui/icons-material/PlayArrowTwoTone";
import ThumbDownAltTwoToneIcon from "@mui/icons-material/ThumbDownAltTwoTone";
import ThumbUpAltTwoToneIcon from "@mui/icons-material/ThumbUpAltTwoTone";

interface Props {
    loadingMessage?: string;
    currentTrack: SearchedTrack;
    isPlaying: boolean;
    listened: boolean;
    onLikeOrDislike: (liked: boolean) => Promise<void>;
    onPlayButtonClicked: () => void;
    onAudioPlay: () => void;
    onListenedToggle: (listened: boolean) => void;
}

const TrackReviewCard = forwardRef(
    (
        {
            loadingMessage,
            currentTrack,
            isPlaying,
            listened,
            onLikeOrDislike,
            onPlayButtonClicked,
            onAudioPlay,
            onListenedToggle,
        }: Props,
        ref: LegacyRef<HTMLAudioElement> | undefined
    ) => {
        return (
            <Box h="auto" mt={2}>
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
                    size="md"
                    backgroundColor="transparent"
                    opacity={
                        loadingMessage && loadingMessage.length > 0 ? 0.2 : 1
                    }
                >
                    <CardHeader
                        color="brand.textPrimary"
                        backgroundColor="brand.primaryOpaque"
                        borderTopRadius={40}
                    >
                        <Heading size="md">
                            <Flex
                                alignItems="center"
                                direction="column"
                                position="relative"
                                gap={2}
                            >
                                <Text fontSize="3xl">
                                    {currentTrack.artist}
                                </Text>
                                <Flex gap={1}>
                                    <Text fontSize="xl">
                                        {currentTrack.title}
                                        {" ("}
                                        {currentTrack.releaseYear}
                                        {")"}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Heading>
                    </CardHeader>
                    <CardBody
                        w="full"
                        h="full"
                        bgImage={currentTrack.thumbnail}
                        bgSize="cover"
                        borderBottomRadius={40}
                    >
                        <Flex
                            direction="column"
                            h="full"
                            justifyContent="space-between"
                        >
                            <Flex
                                w="full"
                                pb={10}
                                h="full"
                                justifyContent="center"
                            >
                                {isPlaying ? (
                                    <Flex
                                        w="full"
                                        justifyContent="space-around"
                                    >
                                        <IconButton
                                            shadow="none"
                                            p={[4, 6]}
                                            isDisabled={!listened}
                                            onClick={async () =>
                                                onLikeOrDislike(false)
                                            }
                                            variant="ghost"
                                            w="auto"
                                            h="auto"
                                            colorScheme="red"
                                            aria-label="Call Segun"
                                            fontSize={["100px", "150px"]}
                                            icon={
                                                <ThumbDownAltTwoToneIcon fontSize="inherit" />
                                            }
                                            _selected={{
                                                transform: "scale(1.2)",
                                            }}
                                            _hover={{
                                                transform: "scale(1.2)",
                                            }}
                                        />
                                        <IconButton
                                            shadow="none"
                                            p={[4, 6]}
                                            isDisabled={!listened}
                                            onClick={async () =>
                                                onLikeOrDislike(true)
                                            }
                                            variant="ghost"
                                            w="auto"
                                            h="auto"
                                            colorScheme="green"
                                            aria-label="Call Segun"
                                            fontSize={["100px", "150px"]}
                                            icon={
                                                <ThumbUpAltTwoToneIcon fontSize="inherit" />
                                            }
                                            _selected={{
                                                transform: "scale(1.2)",
                                            }}
                                            _hover={{
                                                transform: "scale(1.2)",
                                            }}
                                        />
                                    </Flex>
                                ) : (
                                    <IconButton
                                        shadow="none"
                                        onClick={onPlayButtonClicked}
                                        variant="ghost"
                                        w="auto"
                                        h="auto"
                                        colorScheme="black"
                                        aria-label="Call Segun"
                                        fontSize={["100px", "200px"]}
                                        icon={
                                            <PlayArrowTwoToneIcon fontSize="inherit" />
                                        }
                                        _selected={{
                                            transform: "scale(1.2)",
                                        }}
                                        _hover={{
                                            transform: "scale(1.2)",
                                        }}
                                    />
                                )}
                            </Flex>

                            <Flex direction="column" h="auto">
                                <Flex w="full">
                                    <audio
                                        onPlay={onAudioPlay}
                                        onTimeUpdate={(e) => {
                                            onListenedToggle(
                                                (e.currentTarget.currentTime >
                                                    2) as boolean
                                            );
                                        }}
                                        ref={ref}
                                        style={{
                                            width: "100%",
                                        }}
                                        src={currentTrack.previewUrl}
                                        controls
                                    />
                                </Flex>
                            </Flex>
                        </Flex>
                    </CardBody>
                </Card>
            </Box>
        );
    }
);

TrackReviewCard.displayName = "TrackReviewCard";

export default TrackReviewCard;

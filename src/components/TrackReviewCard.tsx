import React, { LegacyRef, forwardRef } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Text,
} from "@chakra-ui/react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { SearchedTrack } from "../../types";

interface Props {
    currentTrack: SearchedTrack;
    queueTrack: SearchedTrack | null;
    ignoreQueuedTrack: boolean;
    loading: boolean;
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
            currentTrack,
            queueTrack,
            ignoreQueuedTrack,
            loading,
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
            <Card
                size="md"
                h="400px"
                opacity={loading ? "0.4" : "1"}
                mt={2}
                backgroundColor="transparent"
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
                            <Text fontSize="3xl">{currentTrack.artist}</Text>
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
                        <Flex w="full" pb={10} h="full">
                            {isPlaying ? (
                                <>
                                    <IconButton
                                        isDisabled={!listened}
                                        onClick={async () =>
                                            onLikeOrDislike(false)
                                        }
                                        variant="ghost"
                                        w="full"
                                        h="full"
                                        colorScheme="red"
                                        aria-label="Call Segun"
                                        fontSize={["100px", "200px"]}
                                        icon={
                                            <ThumbDownIcon fontSize="inherit" />
                                        }
                                    />
                                    <IconButton
                                        isDisabled={!listened}
                                        onClick={async () =>
                                            onLikeOrDislike(true)
                                        }
                                        variant="ghost"
                                        w="full"
                                        h="full"
                                        colorScheme="green"
                                        aria-label="Call Segun"
                                        fontSize={["100px", "200px"]}
                                        icon={
                                            <ThumbUpIcon fontSize="inherit" />
                                        }
                                    />
                                </>
                            ) : (
                                <IconButton
                                    onClick={onPlayButtonClicked}
                                    variant="ghost"
                                    w="full"
                                    h="full"
                                    colorScheme="black"
                                    aria-label="Call Segun"
                                    fontSize={["100px", "200px"]}
                                    icon={<PlayArrowIcon fontSize="inherit" />}
                                />
                            )}
                        </Flex>

                        <Flex direction="column" h="auto">
                            <Flex w="full">
                                <audio
                                    onPlay={onAudioPlay}
                                    onTimeUpdate={(e) => {
                                        onListenedToggle(
                                            (e.currentTarget.currentTime > 2 &&
                                                (queueTrack ||
                                                    ignoreQueuedTrack)) as boolean
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
        );
    }
);

TrackReviewCard.displayName = "TrackReviewCard";

export default TrackReviewCard;

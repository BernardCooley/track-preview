import React, { LegacyRef, forwardRef } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Link,
    Text,
} from "@chakra-ui/react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { SearchedTrack } from "../../types";

interface Props {
    ignoreQueuedTrack: boolean;
    loading: boolean;
    trackList: SearchedTrack[];
    isPlaying: boolean;
    listened: boolean;
    onLikeOrDislike: (liked: boolean) => Promise<void>;
    onPlayButtonClicked: () => void;
    onAudioPlay: () => void;
    onListened: () => void;
}

const TrackReviewCard = forwardRef(
    (
        {
            ignoreQueuedTrack,
            loading,
            trackList,
            isPlaying,
            listened,
            onLikeOrDislike,
            onPlayButtonClicked,
            onAudioPlay,
            onListened,
        }: Props,
        ref: LegacyRef<HTMLAudioElement> | undefined
    ) => {
        return (
            <Card size="md" h="400px" opacity={loading ? "0.4" : "1"} mt={2}>
                <CardHeader>
                    <Heading size="md">
                        <Link href={trackList[0].url} isExternal>
                            <Flex
                                alignItems="center"
                                direction="column"
                                position="relative"
                            >
                                <Text fontSize="3xl" fontWeight="bold">
                                    {trackList[0].artist}
                                </Text>
                                <Flex gap={1}>
                                    <Text fontSize="xl">
                                        {trackList[0].title}
                                    </Text>
                                    <OpenInNewIcon />
                                </Flex>
                            </Flex>
                        </Link>
                    </Heading>
                </CardHeader>
                <CardBody
                    w="full"
                    h="full"
                    bgImage={trackList[0].thumbnail}
                    bgSize="cover"
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
                                        if (
                                            e.currentTarget.currentTime > 2 &&
                                            (trackList[1] || ignoreQueuedTrack)
                                        ) {
                                            onListened();
                                        }
                                    }}
                                    ref={ref}
                                    style={{
                                        width: "100%",
                                    }}
                                    src={trackList[0].previewUrl}
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

import React, { LegacyRef, forwardRef, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Link,
    SlideFade,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
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
        const { isOpen, onToggle } = useDisclosure();

        useEffect(() => {
            if (currentTrack) {
                onToggle();
            }
        }, [currentTrack]);

        return (
            <SlideFade in={isOpen}>
                <Card
                    size="md"
                    h="400px"
                    opacity={loading ? "0.4" : "1"}
                    mt={2}
                >
                    <CardHeader>
                        <Heading size="md">
                            <Link href={currentTrack.url} isExternal>
                                <Flex
                                    alignItems="center"
                                    direction="column"
                                    position="relative"
                                >
                                    <Text fontSize="3xl" fontWeight="bold">
                                        {currentTrack.artist}
                                    </Text>
                                    <Flex gap={1}>
                                        <Text fontSize="xl">
                                            {currentTrack.title}
                                            {" ("}
                                            {currentTrack.releaseYear}
                                            {")"}
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
                        bgImage={currentTrack.thumbnail}
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
                                        icon={
                                            <PlayArrowIcon fontSize="inherit" />
                                        }
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
                                                    2 &&
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
            </SlideFade>
        );
    }
);

TrackReviewCard.displayName = "TrackReviewCard";

export default TrackReviewCard;

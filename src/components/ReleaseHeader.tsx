import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Track } from "../../types";

interface Props {
    updateReviewTracks: (
        step: number,
        tracks: Track[],
        currentTrackId: number
    ) => void;
    updatePreviousTracks: (tracks: Track[]) => void;
    updateCurrentReleaseTrack: (track: Track | null) => void;
    previousTracks: Track[];
    currentReleaseTrack: Track;
}

const ReleaseHeader = ({
    updateReviewTracks,
    updatePreviousTracks,
    updateCurrentReleaseTrack,
    previousTracks,
    currentReleaseTrack,
}: Props) => {
    return (
        <Flex gap={4} w="full" alignItems="center" top={-1} p={2} wrap="wrap">
            <Button
                variant="primary"
                leftIcon={<ChevronLeftIcon />}
                onClick={() => {
                    updateReviewTracks(4, previousTracks, 0);
                    updatePreviousTracks([]);

                    updateCurrentReleaseTrack(null);
                }}
            >
                Library
            </Button>
            <Flex direction="column">
                <Flex gap={2}>
                    <Text
                        noOfLines={1}
                        fontSize="md"
                        color="brand.textPrimaryLight"
                    >
                        Artist:
                    </Text>
                    <Text noOfLines={2}>{currentReleaseTrack.artist}</Text>
                </Flex>
                <Flex gap={2}>
                    <Text
                        noOfLines={1}
                        fontSize="md"
                        color="brand.textPrimaryLight"
                    >
                        Release title:
                    </Text>
                    <Text noOfLines={2}>
                        {currentReleaseTrack.releaseTitle}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ReleaseHeader;

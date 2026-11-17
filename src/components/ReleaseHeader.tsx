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
        <Flex
            gap={4}
            w="full"
            alignItems="center"
            px={[3, 4]}
            py={3}
            borderBottom="1px solid"
            borderBottomColor="brand.divider"
            bg="brand.surfaceRaised"
            flexWrap="wrap"
        >
            <Button
                variant="outline"
                height="36px"
                px={3}
                fontSize="sm"
                onClick={() => {
                    updateReviewTracks(4, previousTracks, 0);
                    updatePreviousTracks([]);
                    updateCurrentReleaseTrack(null);
                }}
            >
                <ChevronLeftIcon style={{ fontSize: "18px" }} />
                Library
            </Button>
            <Flex direction="column" gap={0.5}>
                <Flex gap={2} alignItems="baseline">
                    <Text fontSize="xs" color="brand.textMuted">
                        Artist:
                    </Text>
                    <Text
                        fontSize="sm"
                        color="brand.textPrimary"
                        lineClamp={1}
                    >
                        {currentReleaseTrack.artist}
                    </Text>
                </Flex>
                <Flex gap={2} alignItems="baseline">
                    <Text fontSize="xs" color="brand.textMuted">
                        Release:
                    </Text>
                    <Text
                        fontSize="sm"
                        color="brand.textPrimary"
                        lineClamp={1}
                    >
                        {currentReleaseTrack.releaseTitle}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default ReleaseHeader;

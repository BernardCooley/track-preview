import React from "react";
import { Button, Flex, Text } from "@chakra-ui/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Track } from "../../types";

interface Props {
    updateReviewTracks: (step: number, tracks: any) => void;
    updatePreviousTracks: (tracks: Track[]) => void;
    updateCurrentAlbumTrack: (track: Track | null) => void;
    previousTracks: Track[];
    currentAlbumTrack: Track;
}

const AlbumHeader = ({
    updateReviewTracks,
    updatePreviousTracks,
    updateCurrentAlbumTrack,
    previousTracks,
    currentAlbumTrack,
}: Props) => {
    return (
        <Flex gap={4} w="full" alignItems="flex-start" top={-1} p={2}>
            <Button
                variant="primary"
                leftIcon={<ChevronLeftIcon />}
                onClick={() => {
                    updateReviewTracks(4, previousTracks);
                    updatePreviousTracks([]);

                    updateCurrentAlbumTrack(null);
                }}
            >
                Library
            </Button>
            <Flex direction="column">
                <Flex gap={2}>
                    <Text fontSize="md" color="brand.textPrimaryLight">
                        Album:
                    </Text>
                    <Text noOfLines={2}>
                        {currentAlbumTrack.artist} -{" "}
                        {currentAlbumTrack.releaseTitle}
                    </Text>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default AlbumHeader;

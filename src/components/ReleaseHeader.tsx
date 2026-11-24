import React from "react";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShopIcon from "@mui/icons-material/Shop";
import { Track } from "../../types";
import { useLibraryParams } from "@/hooks/useLibraryParams";

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
    onBuyRelease: () => void;
    onPlayAll: () => void;
}

const ReleaseHeader = ({
    updateReviewTracks,
    updatePreviousTracks,
    updateCurrentReleaseTrack,
    previousTracks,
    currentReleaseTrack,
    onBuyRelease,
    onPlayAll,
}: Props) => {
    const { setReleaseTrackId } = useLibraryParams();
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
            <IconButton
                variant="tertiary"
                bg="transparent"
                shadow="none"
                rounded="full"
                size="sm"
                fontSize="xl"
                color="brand.textMuted"
                _hover={{ color: "brand.textPrimary" }}
                aria-label="Back to library"
                onClick={() => {
                    setReleaseTrackId(null);
                    updateCurrentReleaseTrack(null);
                    updateReviewTracks(4, previousTracks, 0);
                    updatePreviousTracks([]);
                }}
            >
                <ChevronLeftIcon fontSize="inherit" />
            </IconButton>
            <Flex direction="column" gap={0.5} flex={1}>
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
            <IconButton
                color="brand.primary"
                fontSize="xl"
                bg="transparent"
                shadow="none"
                onClick={onPlayAll}
                rounded="full"
                variant="tertiary"
                aria-label="play all"
                size="sm"
            >
                <PlayArrowIcon fontSize="inherit" />
            </IconButton>
            <IconButton
                color="brand.primary"
                fontSize="xl"
                bg="transparent"
                shadow="none"
                onClick={onBuyRelease}
                rounded="full"
                variant="tertiary"
                aria-label="buy release"
                size="sm"
            >
                <ShopIcon fontSize="inherit" />
            </IconButton>
        </Flex>
    );
};

export default ReleaseHeader;

import {
    Box,
    Card,
    CardBody,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
} from "@chakra-ui/react";
import React from "react";
import { Track } from "../../types";
import MoreHorizTwoToneIcon from "@mui/icons-material/MoreHorizTwoTone";

interface Props {
    track: Track;
    currentlyPlaying: string | undefined;
    onTrackDelete: (index: number) => void;
    trackIndex: number;
    onCurrentlyPlayingUpdate: (url: string | undefined) => void;
}

const ListTrack = ({
    track,
    currentlyPlaying,
    onTrackDelete,
    trackIndex,
    onCurrentlyPlayingUpdate,
}: Props) => {
    return (
        <Card
            shadow="none"
            key={track.searchedTrack.previewUrl}
            bg="transparent"
        >
            <CardBody p={0}>
                <Flex
                    gap={[0, 8]}
                    justifyContent={["center", "space-between"]}
                    direction={["column", "row"]}
                    alignItems="flex-end"
                >
                    <Box
                        rounded="md"
                        color="brand.textPrimary"
                        w="full"
                        py={[2, 4]}
                        px={[1, 2]}
                        outline={
                            currentlyPlaying === track.searchedTrack.previewUrl
                                ? "1px solid"
                                : "none"
                        }
                        outlineColor={
                            currentlyPlaying === track.searchedTrack.previewUrl
                                ? "brand.primary"
                                : "transparent"
                        }
                        _hover={{
                            outline: "1px solid",
                            outlineColor: "brand.primaryOpaque",
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            if (
                                currentlyPlaying ===
                                track.searchedTrack.previewUrl
                            ) {
                                onCurrentlyPlayingUpdate(undefined);
                            } else {
                                onCurrentlyPlayingUpdate(
                                    track.searchedTrack.previewUrl
                                );
                            }
                        }}
                    >
                        <Text fontSize={["xl", "2xl"]} fontWeight="bold">
                            {track.artist}
                        </Text>
                        <Text fontSize={["md", "xl"]}>{track.title}</Text>
                    </Box>
                    <Box w="50px">
                        <Menu variant="primary">
                            <MenuButton
                                color="brand.primaryOpaque"
                                fontSize="3xl"
                                bg="transparent"
                                _active={{
                                    bg: "transparent",
                                    color: "brand.primary",
                                    transform: "scale(1.2)",
                                }}
                                as={IconButton}
                                shadow="none"
                                _hover={{
                                    bg: "transparent",
                                    color: "brand.primary",
                                    transform: "scale(1.2)",
                                }}
                                icon={
                                    <MoreHorizTwoToneIcon fontSize="inherit" />
                                }
                            ></MenuButton>
                            <MenuList>
                                <MenuItem
                                    onClick={() => onTrackDelete(trackIndex)}
                                >
                                    Delete track
                                </MenuItem>
                                <MenuItem>Buy</MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                </Flex>
            </CardBody>
        </Card>
    );
};

export default ListTrack;

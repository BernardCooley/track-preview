import { Menu, Button } from "@chakra-ui/react";
import React from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TrackOptionsProps {
    index: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTrackDelete: (index: number) => void;
    onViewRelease: (index: number) => void;
}

const TrackMenuOptions = ({
    index,
    onMouseEnter,
    onMouseLeave,
    onTrackDelete,
    onViewRelease,
}: TrackOptionsProps) => {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    onClick={(e) => e.stopPropagation()}
                    variant="menuButton"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <MoreHorizIcon />
                </Button>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content
                    bg="brand.backgroundPrimary"
                    color="brand.textPrimary"
                    padding="0"
                    border="1px solid"
                    borderColor="brand.primary"
                    shadow="md"
                >
                    <Menu.Item
                        value="delete"
                        p={3}
                        fontSize="lg"
                        rounded="md"
                        bg="transparent"
                        color="brand.textPrimary"
                        _hover={{
                            bg: "brand.backgroundTertiaryOpaque",
                        }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onTrackDelete(index)}
                    >
                        Delete track
                    </Menu.Item>
                    <Menu.Item
                        value="viewRelease"
                        p={3}
                        fontSize="lg"
                        rounded="md"
                        bg="transparent"
                        color="brand.textPrimary"
                        _hover={{
                            bg: "brand.backgroundTertiaryOpaque",
                        }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onViewRelease(index)}
                    >
                        View release
                    </Menu.Item>
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};

export default TrackMenuOptions;

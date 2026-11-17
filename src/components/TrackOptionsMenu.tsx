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
                    variant="tertiary"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    size="sm"
                    color="brand.textMuted"
                >
                    <MoreHorizIcon fontSize="small" />
                </Button>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content
                    bg="brand.bg"
                    color="brand.textPrimary"
                    padding={1}
                    border="1px solid"
                    borderColor="brand.border"
                    shadow="lg"
                    rounded="lg"
                    minW="140px"
                >
                    <Menu.Item
                        value="delete"
                        p={2.5}
                        fontSize="sm"
                        rounded="md"
                        bg="transparent"
                        color="brand.textSecondary"
                        _hover={{
                            bg: "brand.surfaceHover",
                            color: "brand.textPrimary",
                        }}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={() => onTrackDelete(index)}
                    >
                        Delete track
                    </Menu.Item>
                    <Menu.Item
                        value="viewRelease"
                        p={2.5}
                        fontSize="sm"
                        rounded="md"
                        bg="transparent"
                        color="brand.textSecondary"
                        _hover={{
                            bg: "brand.surfaceHover",
                            color: "brand.textPrimary",
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

import { Menu, Button } from "@chakra-ui/react";
import React from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TrackOptionsProps {
    index: number;
    purchased?: boolean;
    onTrackDelete: (index: number) => void;
    onViewRelease: (index: number) => void;
    onTogglePurchased?: (index: number) => void;
}

const TrackMenuOptions = ({
    index,
    purchased,
    onTrackDelete,
    onViewRelease,
    onTogglePurchased,
}: TrackOptionsProps) => {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    variant="tertiary"
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
                    {onTogglePurchased && (
                        <Menu.Item
                            value="togglePurchased"
                            p={2.5}
                            fontSize="sm"
                            rounded="md"
                            bg="transparent"
                            color={purchased ? "brand.primary" : "brand.textSecondary"}
                            cursor="pointer"
                            _hover={{
                                bg: "brand.surfaceHover",
                                color: "brand.textPrimary",
                            }}
                            onClick={() => onTogglePurchased(index)}
                        >
                            {purchased ? "Mark as not bought" : "Mark as bought"}
                        </Menu.Item>
                    )}
                    <Menu.Item
                        value="delete"
                        p={2.5}
                        fontSize="sm"
                        rounded="md"
                        bg="transparent"
                        color="brand.textSecondary"
                        cursor="pointer"
                        _hover={{
                            bg: "brand.surfaceHover",
                            color: "brand.textPrimary",
                        }}
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
                        cursor="pointer"
                        _hover={{
                            bg: "brand.surfaceHover",
                            color: "brand.textPrimary",
                        }}
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

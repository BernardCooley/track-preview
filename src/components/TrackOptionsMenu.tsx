import { Flex, Menu, Button, Text } from "@chakra-ui/react";
import React from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import StarIcon from "@mui/icons-material/Star";

interface TrackOptionsProps {
    index: number;
    purchased?: boolean;
    hasNotes?: boolean;
    isPro?: boolean;
    onTrackDelete: (index: number) => void;
    onViewRelease: (index: number) => void;
    onTogglePurchased?: (index: number) => void;
    onEditNotes?: (index: number) => void;
}

const TrackMenuOptions = ({
    index,
    purchased,
    hasNotes,
    isPro,
    onTrackDelete,
    onViewRelease,
    onTogglePurchased,
    onEditNotes,
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
                    {onEditNotes && (
                        <Menu.Item
                            value="editNotes"
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
                            onClick={() => onEditNotes(index)}
                        >
                            <Flex alignItems="center" justifyContent="space-between" w="full">
                                <Text>{hasNotes ? "View note" : "Add note"}</Text>
                                {!isPro && !hasNotes && (
                                    <Flex
                                        alignItems="center"
                                        bg="brand.primarySubtle"
                                        color="brand.primary"
                                        rounded="full"
                                        px={1.5}
                                        py={0.5}
                                        gap={0.5}
                                    >
                                        <StarIcon style={{ fontSize: "10px" }} />
                                        <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                                            PRO
                                        </Text>
                                    </Flex>
                                )}
                            </Flex>
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

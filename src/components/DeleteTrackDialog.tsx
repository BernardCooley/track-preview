import React from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Text,
} from "@chakra-ui/react";
import { ReviewTracks } from "../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    closeDialog: () => void;
    reviewTracks: ReviewTracks;
    trackToDelete: number | null;
    deleteTrack: () => void;
}

const DeleteTrackDialog = ({
    isOpen,
    onClose,
    closeDialog,
    reviewTracks,
    trackToDelete,
    deleteTrack,
}: Props) => {
    return (
        <Dialog.Root
            role="alertdialog"
            open={isOpen}
            onOpenChange={(details) => {
                if (!details.open) {
                    onClose();
                    closeDialog();
                }
            }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="modal"
                    overflow="hidden"
                >
                    <Flex direction="column">
                        <Flex
                            px={[4, 5]}
                            pt={[4, 5]}
                            pb={3}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                letterSpacing="-0.01em"
                            >
                                Delete Track
                            </Text>
                            <Dialog.CloseTrigger
                                position="relative"
                                top="auto"
                                right="auto"
                                color="brand.textMuted"
                                _hover={{ color: "brand.textPrimary" }}
                            />
                        </Flex>

                        <Box
                            h="1px"
                            bg="brand.divider"
                            mx={[4, 5]}
                        />

                        <Box px={[4, 5]} py={5}>
                            <Flex direction="column" gap={3}>
                                <Text color="brand.textSecondary" fontSize="sm">
                                    Are you sure you want to delete this track?
                                </Text>
                                <Box
                                    bg="brand.surface"
                                    border="1px solid"
                                    borderColor="brand.border"
                                    p={3}
                                    rounded="lg"
                                >
                                    <Text
                                        fontSize="md"
                                        fontWeight="semibold"
                                        color="brand.textPrimary"
                                    >
                                        {reviewTracks[4].tracks[trackToDelete!]?.title}
                                    </Text>
                                    <Text fontSize="sm" color="brand.textSecondary">
                                        {reviewTracks[4].tracks[trackToDelete!]?.artist}
                                    </Text>
                                </Box>
                                <Text fontSize="xs" color="brand.textMuted">
                                    This action cannot be undone.
                                </Text>
                            </Flex>
                        </Box>

                        <Flex
                            gap={3}
                            px={[4, 5]}
                            py={4}
                            justifyContent="flex-end"
                            css={{
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                borderTop: "1px solid var(--chakra-colors-brand-divider)",
                            }}
                        >
                            <Button variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>
                            <Button variant="warning" onClick={deleteTrack}>
                                Delete
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

DeleteTrackDialog.displayName = "DeleteTrackDialog";

export default DeleteTrackDialog;

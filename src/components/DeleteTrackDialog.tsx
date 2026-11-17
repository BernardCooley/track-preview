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
                >
                    <Dialog.Header
                        fontSize="lg"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                        borderBottom="1px solid"
                        borderBottomColor="brand.divider"
                    >
                        Delete Track
                    </Dialog.Header>

                    <Dialog.Body py={5}>
                        <Flex direction="column" gap={3}>
                            <Text color="brand.textSecondary">
                                Are you sure you want to delete...
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
                                    {reviewTracks[4].tracks[trackToDelete!]?.artist}
                                </Text>
                                <Text fontSize="sm" color="brand.textSecondary">
                                    {reviewTracks[4].tracks[trackToDelete!]?.title}
                                </Text>
                            </Box>
                            <Text fontSize="sm" color="brand.textMuted">
                                You cannot undo this action afterwards.
                            </Text>
                        </Flex>
                    </Dialog.Body>

                    <Dialog.Footer
                        borderTop="1px solid"
                        borderTopColor="brand.divider"
                        gap={3}
                    >
                        <Button variant="outline" onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button variant="warning" onClick={deleteTrack}>
                            Delete
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

DeleteTrackDialog.displayName = "DeleteTrackDialog";

export default DeleteTrackDialog;

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
                    m={6}
                    bg="brand.backgroundPrimary"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.primary"
                >
                    <Dialog.Header fontSize="lg" fontWeight="bold">
                        Delete Track
                    </Dialog.Header>

                    <Dialog.Body>
                        <Flex direction="column" gap={2}>
                            <Text>Are you sure you want to delete...</Text>
                            <Flex
                                direction="column"
                                bg="brand.backgroundTertiaryOpaque"
                                p={2}
                                rounded="md"
                            >
                                <Text fontSize="xl" fontWeight="bold">
                                    {
                                        reviewTracks[4].tracks[
                                            trackToDelete!
                                        ]?.artist
                                    }
                                </Text>
                                <Text fontSize="md" fontWeight="bold">
                                    {
                                        reviewTracks[4].tracks[
                                            trackToDelete!
                                        ]?.title
                                    }
                                </Text>
                            </Flex>
                            <Text>
                                You cannot undo this action afterwards.
                            </Text>
                        </Flex>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <Button
                            variant="primary"
                            onClick={closeDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorPalette="red"
                            onClick={deleteTrack}
                            ml={3}
                        >
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

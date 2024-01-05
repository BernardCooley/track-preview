import React, { LegacyRef, RefObject, forwardRef } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
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

const DeleteTrackDialog = forwardRef(
    (
        {
            isOpen,
            onClose,
            closeDialog,
            reviewTracks,
            trackToDelete,
            deleteTrack,
        }: Props,
        ref: LegacyRef<HTMLButtonElement>
    ) => {
        return (
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={ref as RefObject<HTMLButtonElement>}
                onClose={() => {
                    onClose();
                    closeDialog();
                }}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent
                        m={6}
                        bg="brand.backgroundPrimary"
                        shadow="2xl"
                        border="1px solid"
                        borderColor="brand.primary"
                    >
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Track
                        </AlertDialogHeader>

                        <AlertDialogBody>
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
                                            reviewTracks[4][trackToDelete!]
                                                ?.artist
                                        }
                                    </Text>
                                    <Text fontSize="md" fontWeight="bold">
                                        {reviewTracks[4][trackToDelete!]?.title}
                                    </Text>
                                </Flex>
                                <Text>
                                    You cannot undo this action afterwards.
                                </Text>
                            </Flex>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                variant="primary"
                                ref={ref}
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={deleteTrack}
                                ml={3}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        );
    }
);

DeleteTrackDialog.displayName = "DeleteTrackDialog";

export default DeleteTrackDialog;

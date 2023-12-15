import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Badge,
    Box,
    Button,
    Center,
    Stack,
    StackDivider,
    ToastProps,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { Track } from "../../types";
import { useTrackContext } from "../../context/TrackContext";
import { fetchUserTracks, updateTrackReviewStep } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import ListTrack from "./ListTrack";

const TrackList = () => {
    const { user } = useAuthContext();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const toast = useToast();
    const id = "step4-toast";
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [trackToDelete, setTrackToDelete] = useState<number | null>(null);

    useEffect(() => {
        getTracks();
    }, [user]);

    useEffect(() => {
        if (trackToDelete || trackToDelete === 0) {
            onOpen();
        }
    }, [trackToDelete]);

    useEffect(() => {
        if (noTracks) {
            setLoading(false);
        }
    }, [noTracks]);

    const deleteTrack = async () => {
        if (trackToDelete || trackToDelete === 0) {
            try {
                await updateTrackReviewStep({
                    id: tracks[trackToDelete].id,
                    reviewStep: 4,
                    like: false,
                });

                const filteredTracks: Track[] = tracks.filter(
                    (t) => t.id !== tracks[0].id
                );

                if (filteredTracks.length > 0) {
                    setTracks(filteredTracks);
                } else {
                    setNoTracks(true);
                    setTracks([]);
                }
                onClose();
                setTrackToDelete(null);
            } catch (error) {}
        }
    };

    const showToast = useCallback(
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
    );

    const getTracks = useCallback(async () => {
        setTracks([]);
        setNoTracks(false);
        setLoading(true);
        if (user?.uid) {
            try {
                const userTracks = await fetchUserTracks({
                    userId: user.uid,
                    genre: "All",
                    reviewStep: 4,
                });

                if (userTracks && userTracks.length > 0) {
                    setTracks(userTracks);
                    setLoading(false);
                } else {
                    setNoTracks(true);
                }
            } catch (error) {
                showToast({ status: "error" });
            }
        }
    }, [user]);

    const closeDialog = () => {
        onClose();
        setTrackToDelete(null);
    };

    return (
        <Box position="relative">
            {loading && <Loading loadingText={`Loading step 4 tracks`} />}
            {!loading && noTracks && (
                <Center>
                    <Badge
                        zIndex={150}
                        top="200px"
                        position="absolute"
                        variant="outline"
                        colorScheme="teal"
                        fontSize={["24px", "36px"]}
                        px={4}
                    >
                        All done on this step
                    </Badge>
                </Center>
            )}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Track
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {`Are you sure? You can't undo this action afterwards.`}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={closeDialog}>
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
            <Stack
                p={[2, 4, 8]}
                h="full"
                overflowY="scroll"
                divider={<StackDivider />}
                spacing="4"
                css={{
                    "&::-webkit-scrollbar": {
                        width: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "lightgray",
                        borderRadius: "24px",
                    },
                }}
            >
                {tracks.map((track, index) => (
                    <ListTrack
                        key={track.searchedTrack.previewUrl}
                        track={track}
                        currentlyPlaying={currentlyPlaying}
                        onTrackDelete={() => setTrackToDelete(index)}
                        trackIndex={index}
                        onCurrentlyPlayingUpdate={updateCurrentlyPlaying}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default TrackList;

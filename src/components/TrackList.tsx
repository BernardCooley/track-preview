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
    Flex,
    IconButton,
    Link,
    Stack,
    StackDivider,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    ToastProps,
    Tr,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { Track } from "../../types";
import { useTrackContext } from "../../context/TrackContext";
import { fetchTracks, updateTrackReviewStep } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import Image from "next/image";
import { getFormattedDate } from "../../utils";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
    const [clickDisabled, setClickDisabled] = useState<boolean>(false);

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
        if (user && (trackToDelete || trackToDelete === 0)) {
            try {
                await updateTrackReviewStep({
                    trackId: tracks[trackToDelete].id,
                    reviewStep: 4,
                    like: false,
                    userId: user.uid,
                });

                updateCurrentlyPlaying(undefined);

                const filteredTracks: Track[] = tracks.filter(
                    (t) => t.id !== tracks[trackToDelete].id
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
                const tracks = await fetchTracks({
                    userId: user.uid,
                    reviewStep: 4,
                });

                if (tracks && tracks.length > 0) {
                    setTracks(tracks);
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
        <Box position="relative" pb={20}>
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
                                        {tracks[trackToDelete!]?.artist}
                                    </Text>
                                    <Text fontSize="md" fontWeight="bold">
                                        {tracks[trackToDelete!]?.title}
                                    </Text>
                                </Flex>
                                <Text>
                                    You cannot undo this action afterwards.
                                </Text>
                            </Flex>
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
                divider={
                    <StackDivider borderColor="brand.backgroundTertiaryOpaque" />
                }
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
                {!loading && !noTracks && (
                    <TableContainer>
                        <Table variant="unstyled">
                            <Thead>
                                <Tr>
                                    <Th>Artwork</Th>
                                    <Th>Artist</Th>
                                    <Th>Title</Th>
                                    <Th>Release</Th>
                                    <Th>Genre</Th>
                                    <Th>Buy</Th>
                                    <Th>Release date</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tracks.map((track, index) => (
                                    <Tr
                                        key={track.id}
                                        rounded={10}
                                        outlineOffset={-2}
                                        outline={
                                            currentlyPlaying ===
                                            track.previewUrl
                                                ? "1px solid"
                                                : "none"
                                        }
                                        outlineColor={
                                            currentlyPlaying ===
                                            track.previewUrl
                                                ? "brand.primary"
                                                : "transparent"
                                        }
                                        color={
                                            currentlyPlaying ===
                                            track.previewUrl
                                                ? "brand.textPrimary"
                                                : "brand.primary"
                                        }
                                        _hover={{
                                            cursor: "pointer",
                                            backgroundColor:
                                                "brand.backgroundTertiaryOpaque",
                                        }}
                                        onClick={() => {
                                            if (!clickDisabled) {
                                                if (
                                                    currentlyPlaying ===
                                                    track.previewUrl
                                                ) {
                                                    updateCurrentlyPlaying(
                                                        undefined
                                                    );
                                                } else {
                                                    updateCurrentlyPlaying(
                                                        track.previewUrl
                                                    );
                                                }
                                            }
                                        }}
                                    >
                                        <Td w={6}>
                                            <Image
                                                src={track.thumbnail}
                                                alt=""
                                                width={300}
                                                height={300}
                                            ></Image>
                                        </Td>
                                        <Td>
                                            <Text
                                                maxW={32}
                                                sx={{ textWrap: "wrap" }}
                                            >
                                                {track.artist}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text
                                                maxW={48}
                                                sx={{ textWrap: "wrap" }}
                                            >
                                                {track.title}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text
                                                maxW={48}
                                                sx={{ textWrap: "wrap" }}
                                            >
                                                {track.releaseTitle}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Text
                                                maxW={28}
                                                sx={{ textWrap: "wrap" }}
                                            >
                                                {track.genre}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Link
                                                variant="primary"
                                                href={track.purchaseUrl}
                                                isExternal
                                            >
                                                Buy
                                            </Link>
                                        </Td>
                                        <Td>
                                            {getFormattedDate(
                                                track.releaseDate
                                            )}{" "}
                                        </Td>
                                        <Td>
                                            <Flex
                                                w="full"
                                                justifyContent="space-between"
                                            >
                                                <IconButton
                                                    onMouseEnter={() =>
                                                        setClickDisabled(true)
                                                    }
                                                    onMouseLeave={() =>
                                                        setClickDisabled(false)
                                                    }
                                                    _hover={{
                                                        bg: "transparent",
                                                        transform: "scale(1.2)",
                                                    }}
                                                    shadow="lg"
                                                    height="30px"
                                                    onClick={() =>
                                                        setTrackToDelete(index)
                                                    }
                                                    variant="ghost"
                                                    h={1 / 2}
                                                    colorScheme="red"
                                                    aria-label="Show password"
                                                    fontSize="3xl"
                                                    icon={<DeleteForeverIcon />}
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>
        </Box>
    );
};

export default TrackList;

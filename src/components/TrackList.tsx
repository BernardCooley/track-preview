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
    Image,
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
import { fetchAlbum, fetchTracks, updateTrackReviewStep } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import { camelcaseToTitleCase, getFormattedDate } from "../../utils";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TrackMenuOptions from "./TrackOptionsMenu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const TrackList = () => {
    const { user } = useAuthContext();
    const {
        currentlyPlaying,
        updateCurrentlyPlaying,
        reviewTracks,
        updateReviewTracks,
        addedToLibrary,
        updateAddedToLibrary,
        currentAlbumTrack,
        updateCurrentAlbumTrack,
        previousTracks,
        updatePreviousTracks,
    } = useTrackContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const toast = useToast();
    const id = "step4-toast";
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [trackToDelete, setTrackToDelete] = useState<number | null>(null);
    const [clickDisabled, setClickDisabled] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<keyof Track | "">("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        if (addedToLibrary || reviewTracks[4].length === 0) {
            getTracks(null);
        }
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
                    trackId: reviewTracks[4][trackToDelete].id,
                    reviewStep: 4,
                    like: false,
                    userId: user.uid,
                });

                updateCurrentlyPlaying(undefined);

                const filteredTracks: Track[] = reviewTracks[4].filter(
                    (t) => t.id !== reviewTracks[4][trackToDelete].id
                );

                if (filteredTracks.length > 0) {
                    updateReviewTracks(4, filteredTracks);
                } else {
                    setNoTracks(true);
                    updateReviewTracks(4, []);
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

    const getTracks = useCallback(
        async (track: Track | null) => {
            updateReviewTracks(4, []);
            setNoTracks(false);
            setLoading(true);
            if (user?.uid) {
                try {
                    const fetchedTracks = track
                        ? await fetchAlbum({
                              releaseTitle: track.releaseTitle,
                              releaseDate: track.releaseDate,
                          })
                        : await fetchTracks({
                              userId: user.uid,
                              reviewStep: 4,
                          });

                    if (fetchedTracks && fetchedTracks.length > 0) {
                        updateReviewTracks(4, fetchedTracks);
                        updateAddedToLibrary(false);
                        setLoading(false);
                    } else {
                        setNoTracks(true);
                    }
                } catch (error) {
                    showToast({ status: "error" });
                }
            }
        },
        [user]
    );

    const closeDialog = () => {
        onClose();
        setTrackToDelete(null);
    };

    type TrackKeys = keyof Track;

    const sortTracks = (field: TrackKeys) => {
        const order = sortBy === field ? sortDirection : "asc";

        const sortedTracks = [...reviewTracks[4]].sort((a, b) => {
            if (a[field] < b[field]) return order === "asc" ? -1 : 1;
            if (a[field] > b[field]) return order === "asc" ? 1 : -1;
            return 0;
        });

        updateReviewTracks(4, sortedTracks);
        setSortBy(field);
        setSortDirection(order === "asc" ? "desc" : "asc");
    };

    interface TableHeadingProps {
        title: TrackKeys;
    }

    const TableHeading = ({ title }: TableHeadingProps) => {
        return (
            <Flex
                as={Button}
                variant="unstyled"
                border="none"
                shadow="none"
                onClick={() => {
                    sortTracks(title as TrackKeys);
                }}
                textDecoration={sortBy === title ? "underline" : "none"}
            >
                <Text>{camelcaseToTitleCase(title)}</Text>
                {sortBy === title && (
                    <Box
                        transform={
                            sortBy === title && sortDirection === "asc"
                                ? ""
                                : "rotate(180deg)"
                        }
                    >
                        <KeyboardArrowUpIcon />
                    </Box>
                )}
            </Flex>
        );
    };

    const getTrProps = (
        track: Track,
        currentlyPlaying: string | undefined,
        clickDisabled: boolean,
        updateCurrentlyPlaying: (url: string | undefined) => void
    ) => {
        return {
            fontSize: "md",
            rounded: 10,
            outlineOffset: -2,
            outline:
                currentlyPlaying === track.previewUrl ? "1px solid" : "none",
            outlineColor:
                currentlyPlaying === track.previewUrl
                    ? "brand.primary"
                    : "transparent",
            color: "brand.textPrimaryLight",
            _hover: {
                cursor: "pointer",
                backgroundColor:
                    currentlyPlaying === track.previewUrl
                        ? "brand.backgroundTertiaryOpaque"
                        : "brand.backgroundTertiaryOpaque2",
            },
            bg:
                currentlyPlaying === track.previewUrl
                    ? "brand.backgroundTertiaryOpaque"
                    : "transparent",
            onClick: () => {
                if (!clickDisabled) {
                    if (currentlyPlaying === track.previewUrl) {
                        updateCurrentlyPlaying(undefined);
                    } else {
                        updateCurrentlyPlaying(track.previewUrl);
                    }
                }
            },
        };
    };

    const gotToAlbum = (index: number) => {
        updateCurrentAlbumTrack(reviewTracks[4][index]);
        if (
            currentAlbumTrack?.releaseTitle !==
                reviewTracks[4][index].releaseTitle &&
            currentAlbumTrack?.releaseDate !==
                reviewTracks[4][index].releaseDate
        ) {
            updatePreviousTracks(reviewTracks[4]);
            getTracks(reviewTracks[4][index]);
            setClickDisabled(false);
        }
    };

    return (
        <Box position="relative" pb={20}>
            {loading && <Loading loadingText={`Loading library`} />}
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
                position="relative"
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
                {currentAlbumTrack && (
                    <Flex
                        gap={4}
                        w="full"
                        alignItems="flex-start"
                        top={-1}
                        p={2}
                    >
                        <Button
                            variant="primary"
                            leftIcon={<ChevronLeftIcon />}
                            onClick={() => {
                                updateReviewTracks(4, previousTracks);
                                updatePreviousTracks([]);

                                updateCurrentAlbumTrack(null);
                            }}
                        >
                            Library
                        </Button>
                        <Flex direction="column">
                            <Flex gap={2}>
                                <Text
                                    fontSize="md"
                                    color="brand.textPrimaryLight"
                                >
                                    Album:
                                </Text>
                                <Text noOfLines={2}>
                                    {currentAlbumTrack.artist} -{" "}
                                    {currentAlbumTrack.releaseTitle}
                                </Text>
                            </Flex>
                        </Flex>
                    </Flex>
                )}
                {!loading && !noTracks && (
                    <TableContainer
                        maxH={currentAlbumTrack ? "60vh" : "70vh"}
                        overflowY="scroll"
                    >
                        <Table
                            variant="primary"
                            display={["none", "none", "table"]}
                        >
                            <Thead>
                                <Tr>
                                    <Th>
                                        <TableHeading title="title" />
                                    </Th>
                                    <Th>
                                        <TableHeading title="releaseTitle" />
                                    </Th>
                                    <Th>
                                        <TableHeading title="genre" />
                                    </Th>
                                    <Th>
                                        <TableHeading title="releaseDate" />
                                    </Th>
                                    {!currentAlbumTrack && (
                                        <Th>
                                            <Box
                                                as={Button}
                                                variant="unstyled"
                                                border="none"
                                                shadow="none"
                                                _hover={{
                                                    cursor: "default",
                                                }}
                                            >
                                                <br />
                                            </Box>
                                        </Th>
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {reviewTracks[4].map((track, index) => (
                                    <Tr
                                        key={track.id}
                                        {...getTrProps(
                                            track,
                                            currentlyPlaying,
                                            clickDisabled,
                                            updateCurrentlyPlaying
                                        )}
                                    >
                                        <Td>
                                            <Flex
                                                alignItems="center"
                                                gap={6}
                                                justifyContent="flex-start"
                                            >
                                                <Image
                                                    maxW={16}
                                                    maxH={16}
                                                    src={track.thumbnail}
                                                    alt=""
                                                ></Image>
                                                <Flex
                                                    direction="column"
                                                    gap={2}
                                                >
                                                    <Text
                                                        fontSize={"md"}
                                                        color={
                                                            "brand.textPrimary"
                                                        }
                                                        maxW={32}
                                                        sx={{
                                                            textWrap: "wrap",
                                                        }}
                                                    >
                                                        {track.title}
                                                    </Text>
                                                    <Text
                                                        fontSize="sm"
                                                        maxW={32}
                                                        sx={{
                                                            textWrap: "wrap",
                                                        }}
                                                    >
                                                        {track.artist}
                                                    </Text>
                                                </Flex>
                                            </Flex>
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
                                                maxW={20}
                                                sx={{ textWrap: "wrap" }}
                                            >
                                                {track.genre}
                                            </Text>
                                        </Td>

                                        <Td>
                                            {getFormattedDate(
                                                track.releaseDate
                                            ) || track.releaseYear}
                                        </Td>
                                        {!currentAlbumTrack && (
                                            <Td>
                                                <TrackMenuOptions
                                                    onMouseEnter={() =>
                                                        setClickDisabled(true)
                                                    }
                                                    onMouseLeave={() =>
                                                        setClickDisabled(false)
                                                    }
                                                    onTrackDelete={() =>
                                                        setTrackToDelete(index)
                                                    }
                                                    onViewAlbum={() =>
                                                        gotToAlbum(index)
                                                    }
                                                    track={track}
                                                    index={index}
                                                />
                                            </Td>
                                        )}
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Table
                            variant="primary"
                            display={["table", "table", "none"]}
                        >
                            <Thead>
                                <Tr>
                                    <Th>
                                        <TableHeading title="title" />
                                    </Th>
                                    <Th>
                                        <TableHeading title="genre" />
                                    </Th>
                                    {!currentAlbumTrack && (
                                        <Th>
                                            <br />
                                        </Th>
                                    )}
                                </Tr>
                            </Thead>
                            <Tbody>
                                {reviewTracks[4].map((track, index) => (
                                    <Tr
                                        key={track.id}
                                        {...getTrProps(
                                            track,
                                            currentlyPlaying,
                                            clickDisabled,
                                            updateCurrentlyPlaying
                                        )}
                                    >
                                        <Td>
                                            <Flex
                                                alignItems="center"
                                                gap={3}
                                                justifyContent="flex-start"
                                            >
                                                <Image
                                                    maxW={14}
                                                    maxH={14}
                                                    src={track.thumbnail}
                                                    alt=""
                                                ></Image>
                                                <Flex
                                                    direction="column"
                                                    maxW={[32, 40]}
                                                    gap={1}
                                                >
                                                    <Text
                                                        isTruncated={
                                                            currentlyPlaying !==
                                                            track.previewUrl
                                                        }
                                                        fontSize="sm"
                                                        color={
                                                            "brand.textPrimary"
                                                        }
                                                        sx={{
                                                            textWrap:
                                                                currentlyPlaying !==
                                                                track.previewUrl
                                                                    ? "nowrap"
                                                                    : "wrap",
                                                        }}
                                                    >
                                                        {track.title}
                                                    </Text>
                                                    <Text
                                                        isTruncated={
                                                            currentlyPlaying !==
                                                            track.previewUrl
                                                        }
                                                        fontSize="xs"
                                                        maxW={24}
                                                        sx={{
                                                            textWrap:
                                                                currentlyPlaying !==
                                                                track.previewUrl
                                                                    ? "nowrap"
                                                                    : "wrap",
                                                        }}
                                                    >
                                                        {track.artist}
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </Td>
                                        <Td>
                                            <Text
                                                isTruncated={
                                                    currentlyPlaying !==
                                                    track.previewUrl
                                                }
                                                maxW={28}
                                                sx={{
                                                    textWrap:
                                                        currentlyPlaying !==
                                                        track.previewUrl
                                                            ? "nowrap"
                                                            : "wrap",
                                                }}
                                            >
                                                {track.genre}
                                            </Text>
                                        </Td>
                                        {!currentAlbumTrack && (
                                            <Td>
                                                <TrackMenuOptions
                                                    onMouseEnter={() =>
                                                        setClickDisabled(true)
                                                    }
                                                    onMouseLeave={() =>
                                                        setClickDisabled(false)
                                                    }
                                                    onTrackDelete={() =>
                                                        setTrackToDelete(index)
                                                    }
                                                    onViewAlbum={() =>
                                                        gotToAlbum(index)
                                                    }
                                                    track={track}
                                                    index={index}
                                                />
                                            </Td>
                                        )}
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

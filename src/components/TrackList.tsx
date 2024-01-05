import React, { useEffect } from "react";
import { Badge, Box, Center, Stack, StackDivider } from "@chakra-ui/react";
import Loading from "./Loading";
import { buyLinks } from "../../consts";
import BuyModal from "./BuyModal";
import DeleteTrackDialog from "./DeleteTrackDialog";
import LibraryTable from "./LibraryTable";
import AlbumHeader from "./AlbumHeader";
import { useTrackList } from "@/hooks/useTrackList";

const TrackList = () => {
    const {
        user,
        currentlyPlaying,
        updateCurrentlyPlaying,
        reviewTracks,
        updateReviewTracks,
        currentAlbumTrack,
        updateCurrentAlbumTrack,
        previousTracks,
        updatePreviousTracks,
        changesMade,
        loading,
        setLoading,
        noTracks,
        isOpen,
        onOpen,
        onClose,
        buyModalIsOpen,
        onBuyModalOpen,
        cancelRef,
        trackToDelete,
        setTrackToDelete,
        trackToBuy,
        setTrackToBuy,
        clickDisabled,
        setClickDisabled,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        getTracks,
        closeBuyModal,
        closeDialog,
        deleteTrack,
    } = useTrackList();

    useEffect(() => {
        if (changesMade[4] || reviewTracks[4].length === 0) {
            getTracks(null);
        }
    }, [user]);

    useEffect(() => {
        if (trackToDelete || trackToDelete === 0) {
            onOpen();
        }
    }, [trackToDelete]);

    useEffect(() => {
        if (trackToBuy || trackToBuy === 0) {
            onBuyModalOpen();
        }
    }, [trackToBuy]);

    useEffect(() => {
        if (noTracks) {
            setLoading(false);
        }
    }, [noTracks]);

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
            <BuyModal
                buyModalIsOpen={buyModalIsOpen}
                closeBuyModal={closeBuyModal}
                buyLinks={buyLinks}
                reviewTracks={reviewTracks}
                trackToBuy={trackToBuy}
            />
            <DeleteTrackDialog
                isOpen={isOpen}
                onClose={onClose}
                closeDialog={closeDialog}
                reviewTracks={reviewTracks}
                trackToDelete={trackToDelete}
                deleteTrack={deleteTrack}
                ref={cancelRef}
            />
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
                    <AlbumHeader
                        updateReviewTracks={updateReviewTracks}
                        updatePreviousTracks={updatePreviousTracks}
                        updateCurrentAlbumTrack={updateCurrentAlbumTrack}
                        previousTracks={previousTracks}
                        currentAlbumTrack={currentAlbumTrack}
                    />
                )}
                {!loading && !noTracks && (
                    <LibraryTable
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        currentAlbumTrack={currentAlbumTrack}
                        reviewTracks={reviewTracks}
                        currentlyPlaying={currentlyPlaying}
                        clickDisabled={clickDisabled}
                        updateCurrentlyPlaying={updateCurrentlyPlaying}
                        setClickDisabled={setClickDisabled}
                        setTrackToBuy={setTrackToBuy}
                        setTrackToDelete={setTrackToDelete}
                        updateCurrentAlbumTrack={updateCurrentAlbumTrack}
                        updatePreviousTracks={updatePreviousTracks}
                        getTracks={getTracks}
                        updateReviewTracks={updateReviewTracks}
                        setSortBy={setSortBy}
                        setSortDirection={setSortDirection}
                    />
                )}
            </Stack>
        </Box>
    );
};

export default TrackList;

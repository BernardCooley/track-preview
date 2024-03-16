import React, { useEffect } from "react";
import { Badge, Center, Flex } from "@chakra-ui/react";
import Loading from "./Loading";
import { buyLinks } from "../../consts";
import BuyModal from "./BuyModal";
import DeleteTrackDialog from "./DeleteTrackDialog";
import LibraryTable from "./LibraryTable";
import ReleaseHeader from "./ReleaseHeader";
import { useTrackList } from "@/hooks/useTrackList";

const Library = () => {
    const {
        user,
        currentlyPlaying,
        updateCurrentlyPlaying,
        reviewTracks,
        updateReviewTracks,
        currentReleaseTrack,
        updateCurrentReleaseTrack,
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
        <Flex px={0} position="relative" pb={20} direction="column">
            {loading && (
                <Center
                    zIndex={150}
                    top="200px"
                    right="50%"
                    transform={`translate(50%, 0)`}
                    position="absolute"
                    px={4}
                >
                    <Loading />
                </Center>
            )}
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

            {currentReleaseTrack && (
                <ReleaseHeader
                    updateReviewTracks={updateReviewTracks}
                    updatePreviousTracks={updatePreviousTracks}
                    updateCurrentReleaseTrack={updateCurrentReleaseTrack}
                    previousTracks={previousTracks}
                    currentReleaseTrack={currentReleaseTrack}
                />
            )}
            {!loading && !noTracks && (
                <Flex direction="column">
                    <LibraryTable
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        currentReleaseTrack={currentReleaseTrack}
                        reviewTracks={reviewTracks}
                        currentlyPlaying={currentlyPlaying}
                        clickDisabled={clickDisabled}
                        updateCurrentlyPlaying={updateCurrentlyPlaying}
                        setClickDisabled={setClickDisabled}
                        setTrackToBuy={setTrackToBuy}
                        setTrackToDelete={setTrackToDelete}
                        updateCurrentReleaseTrack={updateCurrentReleaseTrack}
                        updatePreviousTracks={updatePreviousTracks}
                        getTracks={getTracks}
                        updateReviewTracks={updateReviewTracks}
                        setSortBy={setSortBy}
                        setSortDirection={setSortDirection}
                    />
                </Flex>
            )}
        </Flex>
    );
};

export default Library;

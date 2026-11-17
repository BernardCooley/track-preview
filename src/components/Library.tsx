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
        if (changesMade[4] || reviewTracks[4].tracks.length === 0) {
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
        <Flex position="relative" direction="column" h="full" overflow="auto">
            {loading && (
                <Center position="absolute" inset={0} zIndex={150} pt={24}>
                    <Loading />
                </Center>
            )}

            {!loading && noTracks && (
                <Center pt={24}>
                    <Badge
                        variant="outline"
                        colorPalette="teal"
                        fontSize={["md", "lg"]}
                        px={4}
                        py={2}
                        rounded="lg"
                    >
                        Your library is empty
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
            )}
        </Flex>
    );
};

export default Library;

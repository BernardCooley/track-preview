import React, { useCallback, useEffect, useState } from "react";
import { Badge, Center, Flex } from "@chakra-ui/react";
import Loading from "./Loading";
import { buyLinks } from "../../consts";
import BuyModal from "./BuyModal";
import DeleteTrackDialog from "./DeleteTrackDialog";
import LibraryTable from "./LibraryTable";
import ReleaseHeader from "./ReleaseHeader";
import { useTrackList } from "@/hooks/useTrackList";
import { Track } from "../../types";

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
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        getTracks,
        closeBuyModal,
        closeDialog,
        deleteTrack,
        addTrackToLibrary,
        addingTrackId,
        libraryTrackIds,
        setLibraryTrackIds,
    } = useTrackList();

    const [releaseBuyTrack, setReleaseBuyTrack] = useState<Track | null>(null);
    const [playAllRequested, setPlayAllRequested] = useState(false);

    const onBuyRelease = useCallback(() => {
        if (currentReleaseTrack) {
            setReleaseBuyTrack(currentReleaseTrack);
            onBuyModalOpen();
        }
    }, [currentReleaseTrack, onBuyModalOpen]);

    const handleCloseBuyModal = useCallback(() => {
        closeBuyModal();
        setReleaseBuyTrack(null);
    }, [closeBuyModal]);

    useEffect(() => {
        if (currentReleaseTrack) return;
        if (changesMade[4] || reviewTracks[4].tracks.length === 0) {
            getTracks(null);
        }
    }, [user, changesMade[4], currentReleaseTrack]);

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

    useEffect(() => {
        if (currentReleaseTrack && previousTracks.length > 0) {
            setLibraryTrackIds(new Set(previousTracks.map(t => t.id)));
        }
    }, [currentReleaseTrack]);

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
                closeBuyModal={handleCloseBuyModal}
                buyLinks={buyLinks}
                reviewTracks={reviewTracks}
                trackToBuy={trackToBuy}
                releaseTrack={releaseBuyTrack}
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
                    onBuyRelease={onBuyRelease}
                    onPlayAll={() => setPlayAllRequested(true)}
                />
            )}

            {!loading && !noTracks && (
                <LibraryTable
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    currentReleaseTrack={currentReleaseTrack}
                    reviewTracks={reviewTracks}
                    currentlyPlaying={currentlyPlaying}
                    updateCurrentlyPlaying={updateCurrentlyPlaying}
                    setTrackToBuy={setTrackToBuy}
                    setTrackToDelete={setTrackToDelete}
                    updateCurrentReleaseTrack={updateCurrentReleaseTrack}
                    updatePreviousTracks={updatePreviousTracks}
                    getTracks={getTracks}
                    updateReviewTracks={updateReviewTracks}
                    setSortBy={setSortBy}
                    setSortDirection={setSortDirection}
                    addTrackToLibrary={addTrackToLibrary}
                    addingTrackId={addingTrackId}
                    libraryTrackIds={libraryTrackIds}
                    playAllRequested={playAllRequested}
                    onPlayAllStarted={() => setPlayAllRequested(false)}
                />
            )}
        </Flex>
    );
};

export default Library;

import { useCallback, useRef, useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import { Track } from "../../types";
import { useTrackContext } from "../../context/TrackContext";
import { fetchRelease, fetchTracks, updateTrackReviewStep, sendToLibrary } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";

export const useTrackList = () => {
    const { user } = useAuthContext();
    const {
        currentlyPlaying,
        updateCurrentlyPlaying,
        reviewTracks,
        updateReviewTracks,
        currentReleaseTrack,
        updateCurrentReleaseTrack,
        previousTracks,
        updatePreviousTracks,
        changesMade,
        updateChangesMade,
    } = useTrackContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const id = "step4-toast";
    const { open: isOpen, onOpen, onClose } = useDisclosure();
    const {
        open: buyModalIsOpen,
        onOpen: onBuyModalOpen,
        onClose: onBuyModalClose,
    } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [trackToDelete, setTrackToDelete] = useState<number | null>(null);
    const [trackToBuy, setTrackToBuy] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<keyof Track | "">("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const deleteTrack = async () => {
        if (user && (trackToDelete || trackToDelete === 0)) {
            try {
                await updateTrackReviewStep({
                    trackId: reviewTracks[4].tracks[trackToDelete].id,
                    reviewStep: 4,
                    like: false,
                    userId: user.uid,
                });

                updateCurrentlyPlaying(undefined);

                const filteredTracks: Track[] = reviewTracks[4].tracks.filter(
                    (t) => t.id !== reviewTracks[4].tracks[trackToDelete].id
                );

                if (filteredTracks.length > 0) {
                    updateReviewTracks(4, filteredTracks, 0);
                } else {
                    setNoTracks(true);
                    updateReviewTracks(4, [], 0);
                }
                onClose();
                setTrackToDelete(null);
            } catch (error) {}
        }
    };

    const showToast = useCallback(
        ({ type, title, description }: { type?: string; title?: string; description?: string }) => {
            toaster.create({
                id,
                title: title || "An error has occured.",
                description: description || "Please try again later.",
                type: (type as "success" | "error" | "warning" | "info") || "error",
                duration: 5000,
            });
        },
        []
    );

    const getTracks = useCallback(
        async (track: Track | null) => {
            updateReviewTracks(4, [], 0);
            setNoTracks(false);
            setLoading(true);
            if (user?.uid) {
                try {
                    const fetchedTracks = track
                        ? await fetchRelease({
                              releaseTitle: track.releaseTitle,
                              releaseDate: track.releaseDate,
                          })
                        : await fetchTracks({
                              userId: user.uid,
                              reviewStep: 4,
                          });

                    if (fetchedTracks && fetchedTracks.length > 0) {
                        updateReviewTracks(4, fetchedTracks, 0);
                        updateChangesMade(4, false);
                        setLoading(false);
                    } else {
                        setNoTracks(true);
                    }
                } catch (error) {
                    showToast({ type: "error" });
                }
            }
        },
        [user]
    );

    const [libraryTrackIds, setLibraryTrackIds] = useState<Set<string>>(new Set());
    const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

    const addTrackToLibrary = async (track: Track) => {
        if (!user?.uid) return;
        setAddingTrackId(track.id);
        try {
            await sendToLibrary({ trackId: track.id, userId: user.uid });
            setLibraryTrackIds(prev => new Set(prev).add(track.id));
            updateChangesMade(4, true);
            showToast({ type: "success", title: "Track added to library" });
        } catch (error) {
            showToast({ type: "error", title: "Failed to add track" });
        } finally {
            setAddingTrackId(null);
        }
    };

    const closeDialog = () => {
        onClose();
        setTrackToDelete(null);
    };

    const closeBuyModal = () => {
        onBuyModalClose();
        setTrackToBuy(null);
    };

    return {
        closeBuyModal,
        closeDialog,
        getTracks,
        showToast,
        deleteTrack,
        addTrackToLibrary,
        addingTrackId,
        libraryTrackIds,
        setLibraryTrackIds,
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
        updateChangesMade,
        loading,
        setLoading,
        noTracks,
        setNoTracks,
        id,
        isOpen,
        onOpen,
        onClose,
        buyModalIsOpen,
        onBuyModalOpen,
        onBuyModalClose,
        cancelRef,
        trackToDelete,
        setTrackToDelete,
        trackToBuy,
        setTrackToBuy,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
    };
};

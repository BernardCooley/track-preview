import { useCallback, useRef, useState } from "react";
import { ToastProps, useDisclosure, useToast } from "@chakra-ui/react";
import { Track } from "../../types";
import { useTrackContext } from "../../context/TrackContext";
import { fetchRelease, fetchTracks, updateTrackReviewStep } from "@/bff/bff";
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
    const [loading, setLoading] = useState<boolean>(true);
    const [noTracks, setNoTracks] = useState<boolean>(false);
    const toast = useToast();
    const id = "step4-toast";
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: buyModalIsOpen,
        onOpen: onBuyModalOpen,
        onClose: onBuyModalClose,
    } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [trackToDelete, setTrackToDelete] = useState<number | null>(null);
    const [trackToBuy, setTrackToBuy] = useState<number | null>(null);
    const [clickDisabled, setClickDisabled] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<keyof Track | "">("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

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
                        ? await fetchRelease({
                              releaseTitle: track.releaseTitle,
                              releaseDate: track.releaseDate,
                          })
                        : await fetchTracks({
                              userId: user.uid,
                              reviewStep: 4,
                          });

                    if (fetchedTracks && fetchedTracks.length > 0) {
                        updateReviewTracks(4, fetchedTracks);
                        updateChangesMade(4, false);
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
        toast,
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
        clickDisabled,
        setClickDisabled,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
    };
};

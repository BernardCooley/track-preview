import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Flex, ToastProps, useToast } from "@chakra-ui/react";
import ReviewTracksFilters from "./ReviewTracksFilters";
import TrackReviewCard from "./TrackReviewCard";
import { useLocalStorage } from "usehooks-ts";
import { SearchedTrack, Track } from "../../types";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import ApplyFiltersButton from "./ApplyFiltersButton";
import FilterTags from "./FilterTags";
import { fetchUserTracks, updateTrackReviewStep } from "@/bff/bff";

interface Props {
    reviewStep: number;
}

const TrackReviewStep2And3 = ({ reviewStep }: Props) => {
    const toast = useToast();
    const id = "step2And3-toast";
    const [loading, setLoading] = useState<boolean>(false);
    const [genre, setPreferredGenre] = useLocalStorage("step2And3genre", "All");
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [filtersToApply, setSetFiltersToApply] = useState<boolean>(false);
    const [preferredAutoPlay, setPreferredAutoPlay] = useLocalStorage(
        "preferredAutoPlay",
        false
    );
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const genreRef = useRef<HTMLSelectElement>(null);
    const [currentTrack, setCurrentTrack] = useState<SearchedTrack | null>(
        null
    );
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const { user } = useAuthContext();
    const [noTracks, setNoTracks] = useState<boolean>(false);

    const init = useCallback(async () => {
        setTracks([]);
        setCurrentTrack(null);
        setNoTracks(false);
        if (genre && user?.uid) {
            genreRef.current!.value = genre;
            setLoading(true);

            try {
                const userTracks = await fetchUserTracks({
                    userId: user.uid,
                    genre,
                    reviewStep,
                });

                if (userTracks && userTracks.length > 0) {
                    setAvailableGenres(
                        Array.from(new Set(userTracks.map((t) => t.genre)))
                    );

                    if (!availableGenres.includes(genre)) {
                        setPreferredGenre("All");
                    }
                    setTracks(userTracks);
                    setLoading(false);
                } else {
                    setNoTracks(true);
                }
            } catch (error) {
                showToast({ status: "error" });
            }
        }
    }, [genre, reviewStep, user, availableGenres]);

    useEffect(() => {
        init();
    }, [genre, user, reviewStep]);

    useEffect(() => {
        if (tracks.length > 0) {
            setCurrentTrack(tracks[0].searchedTrack);
            setLoading(false);
        }
    }, [tracks]);

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

    const play = () => {
        audioElementRef.current?.play();
    };

    const storeTrack = async (like: boolean) => {
        if (currentTrack) {
            await updateTrackReviewStep({
                id: tracks[0].id,
                reviewStep,
                like,
            });
        }
    };

    const likeOrDislike = async (like: boolean) => {
        try {
            setIsPlaying(false);
            storeTrack(like);
            setListened(false);

            if (currentTrack) {
                const filteredTracks: Track[] = tracks.filter(
                    (t) => t.id !== tracks[0].id
                );

                if (filteredTracks.length > 0) {
                    setTracks(filteredTracks);
                } else {
                    setNoTracks(true);
                    setTracks([]);
                }
            }
        } catch (error) {}
    };

    return (
        <Box h="90vh" position="relative">
            {loading && (
                <Loading
                    message={
                        noTracks
                            ? "All done on this step"
                            : "Loading your tracks..."
                    }
                />
            )}
            <Flex
                w={[settingsOpen ? "auto" : "full", "full"]}
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pl={settingsOpen ? 4 : [4, 0]}
                gap={2}
                mx={settingsOpen ? [4, 0] : 0}
                transition="ease-in-out 200ms"
                backgroundColor={settingsOpen ? "gray.300" : "transparent"}
                shadow={settingsOpen ? "2xl" : "none"}
                rounded="3xl"
                position="absolute"
                zIndex={200}
            >
                <Flex
                    alignItems="center"
                    gap={6}
                    justifyContent="space-between"
                    w="full"
                >
                    <ApplyFiltersButton
                        settingsOpen={settingsOpen}
                        filtersToApply={filtersToApply}
                        onClick={() => setSettingsOpen((prev) => !prev)}
                    />

                    <FilterTags
                        settingsOpen={settingsOpen}
                        genre={genre}
                        preferredAutoPlay={preferredAutoPlay}
                    />
                </Flex>
                <ReviewTracksFilters
                    showDates={false}
                    isOpen={settingsOpen}
                    onGenreSelect={async (genre: string) => {
                        setPreferredGenre(genre);
                    }}
                    selectedGenre={genre}
                    genres={availableGenres}
                    autoPlay={preferredAutoPlay}
                    onAutoPlayChange={(value) => setPreferredAutoPlay(value)}
                    ref={genreRef}
                />
            </Flex>
            <Flex
                direction="column"
                position="relative"
                top={20}
                opacity={settingsOpen ? 0.3 : 1}
                pointerEvents={settingsOpen ? "none" : "auto"}
            >
                {currentTrack && (
                    <TrackReviewCard
                        currentTrack={currentTrack}
                        queueTrack={null}
                        ignoreQueuedTrack={true}
                        loading={loading}
                        isPlaying={isPlaying}
                        listened={listened}
                        onLikeOrDislike={async (val) =>
                            await likeOrDislike(val)
                        }
                        onPlayButtonClicked={() => play()}
                        onAudioPlay={() => {
                            setIsPlaying(true);
                        }}
                        onListenedToggle={(val) => setListened(val)}
                        ref={audioElementRef}
                    />
                )}
            </Flex>
        </Box>
    );
};

export default TrackReviewStep2And3;

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Badge,
    Box,
    Center,
    Flex,
    ToastProps,
    useToast,
} from "@chakra-ui/react";
import TrackReviewCard from "./TrackReviewCard";
import { SearchedTrack, Track } from "../../types";
import { useAuthContext } from "../../Contexts/AuthContext";
import Loading from "./Loading";
import FilterTags from "./FilterTags";
import {
    fetchUserTracks,
    updateTrackReviewStep,
    updateUserAutoplay,
} from "@/bff/bff";

interface Props {
    reviewStep: number;
}

const TrackReviewStep2And3 = ({ reviewStep }: Props) => {
    const toast = useToast();
    const id = "step2And3-toast";
    const [loading, setLoading] = useState<boolean>(false);
    const [currentTrack, setCurrentTrack] = useState<SearchedTrack | null>(
        null
    );
    const [autoplay, setAutoplay] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [listened, setListened] = useState<boolean>(false);
    const [tracks, setTracks] = useState<Track[]>([]);
    const audioElementRef = useRef<HTMLAudioElement>(null);
    const { user } = useAuthContext();
    const [noTracks, setNoTracks] = useState<boolean>(false);

    useEffect(() => {
        if (noTracks) {
            setLoading(false);
        }
    }, [noTracks]);

    useEffect(() => {
        if (currentTrack && autoplay) {
            play();
        }
    }, [currentTrack]);

    const init = useCallback(async () => {
        setTracks([]);
        setCurrentTrack(null);
        setNoTracks(false);
        if (user?.uid) {
            setLoading(true);

            try {
                const userTracks = await fetchUserTracks({
                    userId: user.uid,
                    genre: "All",
                    reviewStep,
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
    }, [reviewStep, user]);

    useEffect(() => {
        init();
    }, [user, reviewStep]);

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
                    setCurrentTrack(null);
                }
            }
        } catch (error) {}
    };

    return (
        <Box position="relative">
            {loading && <Loading imageSrc="/logo_1x.png" />}
            {!loading && noTracks && (
                <Center>
                    <Badge
                        zIndex={150}
                        top="50%"
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
            <Flex
                w="full"
                alignItems="baseline"
                justifyContent="space-between"
                direction="column"
                p={4}
                pt={2}
                gap={2}
                transition="ease-in-out 200ms"
                rounded="3xl"
                zIndex={200}
            >
                <Flex
                    alignItems="center"
                    gap={6}
                    justifyContent="space-between"
                    w="full"
                >
                    {tracks && tracks.length > 0 && user?.uid && (
                        <FilterTags
                            onAutoPlayToggle={async () => {
                                await updateUserAutoplay({
                                    userId: user.uid,
                                    autoplay: !autoplay,
                                });

                                setAutoplay(!autoplay);
                            }}
                            showDates={true}
                            preferredAutoPlay={autoplay}
                        />
                    )}
                </Flex>
            </Flex>
            <Flex direction="column" position="relative">
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

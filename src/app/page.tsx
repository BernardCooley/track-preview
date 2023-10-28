"use client";

import { Box, Center, Flex, Slide, Stack } from "@chakra-ui/react";
import TrackReview from "@/components/TrackReview";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { SearchedTrack } from "../../types";
import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase/firebaseInit";
import ProgressStepper from "@/components/ProgressStepper";
import { useTrackContext } from "../../context/TrackContext";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [buyTracks, setBuyTracks] = useState<SearchedTrack[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        const reviewStep = searchParams?.get("reviewStep");
        if (!reviewStep) {
            router.push(`${pathname}?reviewStep=1`);
        }
    }, []);

    useEffect(() => {
        updateCurrentlyPlaying(undefined);
    }, [currentStep]);

    useEffect(() => {
        const reviewStep = searchParams?.get("reviewStep");

        if (reviewStep) {
            setCurrentStep(parseInt(reviewStep));
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentlyPlaying !== undefined) {
            audioElement.current?.play();
        } else {
            audioElement.current?.pause();
        }
    }, [currentlyPlaying]);

    useEffect(() => {
        if (currentStep === 4) {
            let q = query(
                collection(db, "tracks"),
                where("reviewStep", "==", 4)
            );

            const unsubscribe: any = onSnapshot(q, (querySnapshot) => {
                const tracks: SearchedTrack[] = [];
                querySnapshot.forEach((doc) => {
                    const track = {
                        ...doc.data(),
                        id: doc.id,
                    } as SearchedTrack;
                    tracks.push(track);
                });
                setBuyTracks(tracks);
            });

            return () => {
                unsubscribe();
            };
        }
    }, [currentStep]);

    return (
        <Box m={0} px={[0, 4, 8]} h="full">
            <Center h="full">
                <Flex direction="column" w="full" h="full">
                    <Stack
                        spacing="4"
                        w="full"
                        h="95vh"
                        position="relative"
                        transition="ease-in-out"
                        transitionDuration="200"
                    >
                        <ProgressStepper
                            currentStep={currentStep}
                            onStepChange={(step) => {
                                router.push(`${pathname}?reviewStep=${step}`);
                            }}
                        />
                        <TrackReview reviewStep={currentStep} />
                    </Stack>
                    <Slide
                        direction="bottom"
                        in={
                            currentStep === 4 &&
                            currentlyPlaying !== undefined &&
                            currentlyPlaying.length > 0
                        }
                        style={{ zIndex: 10 }}
                    >
                        <Box p={4} mt="4" rounded="md" shadow="md">
                            <AudioPlayer ref={audioElement} />
                        </Box>
                    </Slide>
                </Flex>
            </Center>
        </Box>
    );
}

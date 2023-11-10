"use client";

import { Box, Center, Flex, Slide, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "../../firebase/firebaseInit";
import ProgressStepper from "@/components/ProgressStepper";
import { useTrackContext } from "../../context/TrackContext";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthContext } from "../../Contexts/AuthContext";
import TrackReviewStep1 from "@/components/TrackReviewStep1";
import TrackReviewStep2And3 from "@/components/TrackReviewStep2And3";

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser } = useAuthContext();
    const reviewStep = searchParams?.get("reviewStep");

    const isUserLoggedIn = useCallback(() => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                updateUser({ email: user.email, uid: user.uid });
                return router.push(`/?reviewStep=${reviewStep || 1}`);
            } else {
                return router.push("/signin");
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

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
                        {reviewStep && Number(reviewStep) === 1 && (
                            <TrackReviewStep1 reviewStep={Number(reviewStep)} />
                        )}
                        {reviewStep &&
                            (Number(reviewStep) === 2 ||
                                Number(reviewStep) === 3) && (
                                <TrackReviewStep2And3
                                    reviewStep={Number(reviewStep)}
                                />
                            )}
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

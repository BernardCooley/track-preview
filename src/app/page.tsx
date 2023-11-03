"use client";

import { Box, Center, Flex, Slide, Stack } from "@chakra-ui/react";
import TrackReview from "@/components/TrackReview";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "../../firebase/firebaseInit";
import ProgressStepper from "@/components/ProgressStepper";
import { useTrackContext } from "../../context/TrackContext";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthContext } from "../../Contexts/AuthContext";

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser } = useAuthContext();

    const isUserLoggedIn = useCallback(() => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                updateUser({ email: user.email, uid: user.uid });
                return router.push("/");
            } else {
                return router.push("/signin");
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

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

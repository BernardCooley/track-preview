"use client";

import { Box, Center, Flex, Slide, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ProgressStepper from "@/components/ProgressStepper";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import TrackList from "@/components/TrackList";
import Header from "@/components/Header";
import { getUserProfile } from "@/bff/bff";
import { useTrackContext } from "../../../context/TrackContext";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { GetCurrentUser } from "../../../firebase/utils";
import { auth } from "../../../firebase/firebaseInit";
import TrackReview from "@/components/TrackReview";

export default function Explore() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser, user, updateUserProfile } = useAuthContext();
    const reviewStep = searchParams?.get("reviewStep");

    useEffect(() => {
        if (user?.uid) {
            (async () => {
                const userProf = await getUserProfile({ userId: user?.uid });
                updateUserProfile(userProf);
            })();
        }
    }, [user]);

    const isUserLoggedIn = useCallback(async () => {
        const user = await GetCurrentUser();
        if (user?.email && user?.uid) {
            updateUser({ email: user.email, uid: user.uid });
        }
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                updateUser({ email: user.email, uid: user.uid });
                return router.push(`/explore/?reviewStep=${reviewStep || 1}`);
            } else {
                return router.push("/loginRegister?login=true");
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
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
            <Center h="full">
                <Flex direction="column" w="full" h="full">
                    <Stack
                        spacing="4"
                        w="full"
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
                        {reviewStep &&
                            Number(reviewStep) >= 1 &&
                            reviewStep &&
                            Number(reviewStep) <= 3 && (
                                <TrackReview reviewStep={Number(reviewStep)} />
                            )}
                        {reviewStep && Number(reviewStep) === 4 && (
                            <TrackList />
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
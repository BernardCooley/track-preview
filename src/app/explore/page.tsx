"use client";

import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    Slide,
    Stack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Library from "@/components/Library";
import Header from "@/components/Header";
import { getUserProfile } from "@/bff/bff";
import { useTrackContext } from "../../../context/TrackContext";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { GetCurrentUser } from "../../../firebase/utils";
import { auth } from "../../../firebase/firebaseInit";
import TrackReview from "@/components/TrackReview";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";

export default function Explore() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentlyPlaying, updateCurrentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const { updateUser, user, updateUserProfile } = useAuthContext();
    const reviewStep = searchParams?.get("reviewStep");
    const pageRef = useRef<HTMLDivElement>(null);

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

    const tabButtons = [
        {
            name: "Step 1",
            icon: <LooksOneIcon />,
            onClick: () => router.push("/explore?reviewStep=1"),
        },
        {
            name: "Step 2",
            icon: <LooksTwoIcon />,
            onClick: () => router.push("/explore?reviewStep=2"),
        },
        {
            name: "Step 3",
            icon: <Looks3Icon />,
            onClick: () => router.push("/explore?reviewStep=3"),
        },
        {
            name: "Step 4",
            icon: <LibraryMusicIcon />,
            onClick: () => router.push("/explore?reviewStep=4"),
        },
    ];

    return (
        <Box h="full" m={0} overflowY="hidden" ref={pageRef}>
            <Header />
            <Center h="full">
                <Flex direction="column" w="full" h="full">
                    <Stack
                        spacing="4"
                        w="full"
                        position="relative"
                        transition="ease-in-out"
                        transitionDuration="200"
                        h="full"
                    >
                        <Grid templateColumns="repeat(4, 1fr)" w="full">
                            {tabButtons.map((button, index) => (
                                <Button
                                    rightIcon={<>{button.icon}</>}
                                    key={button.name}
                                    variant={
                                        currentStep === index + 1
                                            ? "tab selected"
                                            : "tab deselected"
                                    }
                                    rounded="none"
                                    onClick={() =>
                                        router.push(
                                            `/explore?reviewStep=${index + 1}`
                                        )
                                    }
                                ></Button>
                            ))}
                        </Grid>

                        {reviewStep &&
                            Number(reviewStep) >= 1 &&
                            reviewStep &&
                            Number(reviewStep) <= 3 && (
                                <TrackReview reviewStep={Number(reviewStep)} />
                            )}
                        {reviewStep && Number(reviewStep) === 4 && <Library />}
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

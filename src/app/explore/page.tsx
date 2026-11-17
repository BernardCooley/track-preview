"use client";

import {
    Box,
    Button,
    Flex,
    Grid,
    Text,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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

function ExploreContent() {
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
            audioElement.current?.play().catch(() => {});
        } else {
            audioElement.current?.pause();
        }
    }, [currentlyPlaying]);

    const tabButtons = [
        { name: "Step 1", label: "Discover", icon: <LooksOneIcon style={{ fontSize: "20px" }} /> },
        { name: "Step 2", label: "Review", icon: <LooksTwoIcon style={{ fontSize: "20px" }} /> },
        { name: "Step 3", label: "Final", icon: <Looks3Icon style={{ fontSize: "20px" }} /> },
        { name: "Step 4", label: "Library", icon: <LibraryMusicIcon style={{ fontSize: "20px" }} /> },
    ];

    const showAudioPlayer =
        currentStep === 4 &&
        currentlyPlaying !== undefined &&
        currentlyPlaying.length > 0;

    return (
        <Flex direction="column" h="100vh" ref={pageRef} bg="brand.bg">
            <Header />
            <Grid
                templateColumns="repeat(4, 1fr)"
                w="full"
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                bg="brand.bg"
            >
                {tabButtons.map((button, index) => (
                    <Button
                        key={button.name}
                        variant={currentStep === index + 1 ? "tabSelected" : "tabDeselected"}
                        onClick={() =>
                            router.push(`/explore?reviewStep=${index + 1}`)
                        }
                        gap={2}
                    >
                        {button.icon}
                        <Text
                            display={["none", "inline"]}
                            fontSize="sm"
                        >
                            {button.label}
                        </Text>
                    </Button>
                ))}
            </Grid>

            <Box flex={1} overflow="hidden" position="relative">
                {reviewStep &&
                    Number(reviewStep) >= 1 &&
                    Number(reviewStep) <= 3 && (
                        <TrackReview reviewStep={Number(reviewStep)} />
                    )}
                {reviewStep && Number(reviewStep) === 4 && <Library />}
            </Box>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                zIndex={10}
                transform={showAudioPlayer ? "translateY(0)" : "translateY(100%)"}
                transition="transform 0.3s ease-in-out"
                bg="brand.bgSubtle"
                borderTop="1px solid"
                borderTopColor="brand.border"
            >
                <Box p={3}>
                    <AudioPlayer ref={audioElement} />
                </Box>
            </Box>
        </Flex>
    );
}

export default function Explore() {
    return (
        <Suspense>
            <ExploreContent />
        </Suspense>
    );
}

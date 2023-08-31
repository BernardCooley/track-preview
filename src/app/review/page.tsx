"use client";

import {
    Box,
    Center,
    Stack,
} from "@chakra-ui/react";
import TrackReviewCard from "@/components/TrackReviewCard";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ITrack } from "../../../types";
import { useEffect, useRef, useState } from "react";
import { db } from "../../../firebase/firebaseInit";
import ProgressStepper from "@/components/ProgressStepper";
import { useTrackContext } from "../../../context/TrackContext";
import TrackList from "@/components/TrackList";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { currentlyPlaying } = useTrackContext();
    const audioElement = useRef<HTMLAudioElement>(null);
    const [buyTracks, setBuyTracks] = useState<ITrack[]>([]);
    const [currentStep, setCurrentStep] = useState<number>(1);
    
    useEffect(() => {
        const reviewStep = searchParams.get('reviewStep');
        if(!reviewStep) {
            router.push(`${pathname}?reviewStep=1`);
        }
    }, []);

    useEffect(() => {
        const reviewStep = searchParams.get('reviewStep');
        if(reviewStep) {
            setCurrentStep(parseInt(reviewStep))
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
                const tracks: ITrack[] = [];
                querySnapshot.forEach((doc) => {
                    const track = { ...doc.data(), id: doc.id } as ITrack;
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
        <Box m={0} p={[0, 4, 8]}>
            <Center>
                <Stack spacing="4" w="full" position='relative' top={currentStep === 4 ? 20 : 0} >
                    <ProgressStepper currentStep={currentStep} onStepChange={(step) => {
                        router.push(`${pathname}?reviewStep=${step}`);
                    }} />
                    {currentStep <= 3 ? (
                        <TrackReviewCard reviewStep={currentStep} />
                    ) : (
                        <TrackList tracks={buyTracks} />
                    )}
                </Stack>
                {currentStep === 4 && (
                    <AudioPlayer ref={audioElement} />
                )}
            </Center>
        </Box>
    );
}

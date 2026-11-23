"use client";

import { Box, Center, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseInit";
import { useAuthContext } from "../../../../Contexts/AuthContext";
import { getUserProfile } from "@/bff/bff";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const { updateUser, updateUserProfile } = useAuthContext();
    const [status, setStatus] = useState<"polling" | "success">("polling");
    const started = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser || started.current) return;
            started.current = true;

            updateUser({
                email: firebaseUser.email || "",
                uid: firebaseUser.uid,
            });

            let attempts = 0;
            const maxAttempts = 10;

            const poll = async () => {
                attempts++;
                const profile = await getUserProfile({
                    userId: firebaseUser.uid,
                });
                if (profile?.subscriptionTier === "PRO") {
                    updateUserProfile(profile);
                    setStatus("success");
                    setTimeout(() => router.replace("/explore"), 2000);
                    return;
                }
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000);
                } else {
                    setStatus("success");
                    setTimeout(() => router.replace("/explore"), 2000);
                }
            };

            poll();
        });

        return unsubscribe;
    }, [router, updateUser, updateUserProfile]);

    return (
        <Center
            minH="100dvh"
            bg="brand.bg"
            flexDirection="column"
            gap={6}
            px={[4, 6]}
        >
            {status === "polling" ? (
                <>
                    <Text
                        fontSize={["3xl", "4xl"]}
                        fontFamily="brand"
                        color="brand.textPrimary"
                        letterSpacing="wider"
                    >
                        PHONIQUEST
                    </Text>
                    <Text color="brand.textSecondary" fontSize="md">
                        Activating your Pro subscription...
                    </Text>
                    <BouncingDotsLoader />
                </>
            ) : (
                <>
                    <Box
                        w="64px"
                        h="64px"
                        rounded="full"
                        bg="brand.successSubtle"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="brand.success"
                        fontSize="2xl"
                    >
                        ✓
                    </Box>
                    <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                    >
                        Welcome to Pro!
                    </Text>
                    <Text
                        fontSize="md"
                        color="brand.textSecondary"
                        textAlign="center"
                        maxW="320px"
                    >
                        Your subscription is active. Redirecting you back to
                        explore...
                    </Text>
                </>
            )}
        </Center>
    );
}

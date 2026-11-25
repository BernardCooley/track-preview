"use client";

import { Box, Center, Text } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseInit";
import { useAuthContext } from "../../../../Contexts/AuthContext";
import { getUserProfile, verifyCheckout } from "@/bff/bff";
import SubscriptionSuccessSkeleton from "@/components/skeletons/SubscriptionSuccessSkeleton";

export default function SubscriptionSuccessPage() {
    return (
        <Suspense>
            <SubscriptionSuccess />
        </Suspense>
    );
}

function SubscriptionSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { updateUser, updateUserProfile } = useAuthContext();
    const [status, setStatus] = useState<"polling" | "success">("polling");
    const showSkeleton = useDelayedLoading(status === "polling");
    const started = useRef(false);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser || started.current) return;
            started.current = true;

            updateUser({
                email: firebaseUser.email || "",
                uid: firebaseUser.uid,
            });

            const activate = async () => {
                if (sessionId) {
                    try {
                        await verifyCheckout({ sessionId });
                    } catch {}
                }

                const profile = await getUserProfile({
                    userId: firebaseUser.uid,
                });
                if (profile) updateUserProfile(profile);

                setStatus("success");
                setTimeout(() => router.replace("/explore"), 2000);
            };

            activate();
        });

        return unsubscribe;
    }, [router, searchParams, updateUser, updateUserProfile]);

    if (status === "polling") {
        return showSkeleton ? <SubscriptionSuccessSkeleton /> : null;
    }

    return (
        <Center
            minH="100dvh"
            bg="brand.bg"
            flexDirection="column"
            gap={6}
            px={[4, 6]}
        >
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
        </Center>
    );
}

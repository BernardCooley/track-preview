"use client";

import { Center, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";

export default function HomeClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const showSkeleton = useDelayedLoading(loading);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                router.push("/explore");
            } else {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, [router]);

    return (
        <>
            {showSkeleton && (
                <Center
                    position="fixed"
                    inset={0}
                    zIndex={50}
                    bg="brand.bg"
                    h="100dvh"
                >
                    <HomeSkeleton />
                </Center>
            )}

            <Flex
                as="main"
                minH="100dvh"
                direction="column"
                alignItems="center"
                px={[6, 8]}
                style={loading ? { visibility: "hidden" } : undefined}
            >
                {children}
            </Flex>
        </>
    );
}

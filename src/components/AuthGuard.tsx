"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseInit";
import { useRouter } from "next/navigation";
import { Center, Text } from "@chakra-ui/react";
import BouncingDotsLoader from "./BouncingLoaderDots";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.uid) {
                setAuthenticated(true);
            } else {
                router.replace("/");
            }
            setChecked(true);
        });
        return unsubscribe;
    }, [router]);

    if (!checked || !authenticated) {
        return (
            <Center h="100dvh" flexDirection="column" gap={8}>
                <Text
                    fontSize={["3xl", "4xl", "5xl"]}
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wider"
                >
                    PHONIQUEST
                </Text>
                <BouncingDotsLoader />
            </Center>
        );
    }

    return <>{children}</>;
};

export default AuthGuard;

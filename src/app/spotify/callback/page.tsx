"use client";

import { Center, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseInit";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";

export default function SpotifyCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"processing" | "success" | "error">(
        "processing"
    );
    const [errorMessage, setErrorMessage] = useState("");
    const started = useRef(false);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setAuthReady(true);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");

        if (error) {
            setStatus("error");
            setErrorMessage("Spotify authorization was denied.");
            return;
        }

        if (!code || !state) {
            setStatus("error");
            setErrorMessage("Missing authorization parameters.");
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await fetch("/api/spotify/callback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, state }),
                });

                if (!res.ok) throw new Error("Token exchange failed");

                setStatus("success");
            } catch {
                setStatus("error");
                setErrorMessage("Failed to connect Spotify account.");
            }
        };

        exchangeCode();
    }, []);

    useEffect(() => {
        if (!authReady) return;
        if (status === "success") {
            setTimeout(() => router.replace("/explore"), 2000);
        } else if (status === "error") {
            setTimeout(() => router.replace("/explore"), 3000);
        }
    }, [authReady, status, router]);

    return (
        <Center
            minH="100dvh"
            bg="brand.bg"
            flexDirection="column"
            gap={6}
            px={[4, 6]}
        >
            {status === "processing" && (
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
                        Connecting your Spotify account...
                    </Text>
                    <BouncingDotsLoader />
                </>
            )}
            {status === "success" && (
                <>
                    <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                    >
                        Spotify Connected!
                    </Text>
                    <Text
                        fontSize="md"
                        color="brand.textSecondary"
                        textAlign="center"
                        maxW="320px"
                    >
                        Redirecting you back...
                    </Text>
                </>
            )}
            {status === "error" && (
                <>
                    <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                    >
                        Connection Failed
                    </Text>
                    <Text
                        fontSize="md"
                        color="brand.textSecondary"
                        textAlign="center"
                        maxW="320px"
                    >
                        {errorMessage} Redirecting you back...
                    </Text>
                </>
            )}
        </Center>
    );
}

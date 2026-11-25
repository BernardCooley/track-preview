"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { isMobile } from "react-device-detect";
import GetAppIcon from "@mui/icons-material/GetApp";
import CloseIcon from "@mui/icons-material/Close";
import IosShareIcon from "@mui/icons-material/IosShare";

const DISMISSED_KEY = "pwa-install-dismissed";
const LIBRARY_THRESHOLD = 20;

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt({
    libraryCount,
}: {
    libraryCount: number;
}) {
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (!isMobile) return;
        if (libraryCount < LIBRARY_THRESHOLD) return;
        if (localStorage.getItem(DISMISSED_KEY)) return;
        if (window.matchMedia("(display-mode: standalone)").matches) return;

        const ios =
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !("MSStream" in window);

        if (ios) {
            setIsIOS(true);
            setShow(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            deferredPrompt.current = e as BeforeInstallPromptEvent;
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [libraryCount]);

    const dismiss = () => {
        setShow(false);
        localStorage.setItem(DISMISSED_KEY, "1");
    };

    const install = async () => {
        if (deferredPrompt.current) {
            await deferredPrompt.current.prompt();
            const { outcome } = await deferredPrompt.current.userChoice;
            if (outcome === "accepted") dismiss();
            deferredPrompt.current = null;
        }
    };

    if (!show) return null;

    return (
        <Box
            mx={4}
            mb={4}
            p={4}
            rounded="lg"
            bg="brand.cardBg"
            border="1px solid"
            borderColor="brand.border"
        >
            <Flex justifyContent="space-between" alignItems="flex-start" gap={3}>
                <Flex direction="column" gap={2} flex={1}>
                    <Flex alignItems="center" gap={2}>
                        <GetAppIcon
                            style={{ fontSize: "20px", color: "var(--chakra-colors-brand-primary)" }}
                        />
                        <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                        >
                            Install Phoniquest
                        </Text>
                    </Flex>
                    {isIOS ? (
                        <Text fontSize="xs" color="brand.textSecondary">
                            Tap{" "}
                            <IosShareIcon style={{ fontSize: "14px", verticalAlign: "middle" }} />
                            {" "}then &quot;Add to Home Screen&quot; for quick access.
                        </Text>
                    ) : (
                        <Flex gap={2} alignItems="center">
                            <Text fontSize="xs" color="brand.textSecondary">
                                Add to your home screen for quick access.
                            </Text>
                            <Button
                                size="xs"
                                variant="solid"
                                bg="brand.primary"
                                color="white"
                                onClick={install}
                                flexShrink={0}
                            >
                                Install
                            </Button>
                        </Flex>
                    )}
                </Flex>
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={dismiss}
                    color="brand.textMuted"
                    minW="auto"
                    p={1}
                    aria-label="Dismiss"
                >
                    <CloseIcon style={{ fontSize: "16px" }} />
                </Button>
            </Flex>
        </Box>
    );
}

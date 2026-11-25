"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, Flex, Image, Text, VStack } from "@chakra-ui/react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { createCheckoutSession, dismissUpgradePrompt } from "@/bff/bff";
import { proFeatures } from "@/config/proFeatures";
import { useProPrice } from "@/hooks/useProPrice";
import { useSubscription } from "@/hooks/useSubscription";

const LIBRARY_THRESHOLD = 40;
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

const getThresholdOverride = (): boolean => {
    if (typeof document === "undefined") return false;
    const match = document.cookie.match(/(?:^|;\s*)upgrade_threshold_override=([^;]*)/);
    return match?.[1] === "1";
};

interface Props {
    libraryCount: number;
}

const ProUpgradePrompt = ({ libraryCount }: Props) => {
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const { isPro } = useSubscription();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const proPrice = useProPrice();

    useEffect(() => {
        if (isPro) return;
        const threshold = getThresholdOverride() ? 0 : LIBRARY_THRESHOLD;
        if (libraryCount < threshold) return;

        const dismissedAt = userProfile?.upgradePromptDismissedAt;
        if (dismissedAt) {
            const elapsed = Date.now() - new Date(dismissedAt).getTime();
            if (elapsed < SIX_MONTHS_MS) return;
        }

        setOpen(true);
    }, [isPro, libraryCount, userProfile?.upgradePromptDismissedAt]);

    const handleDismiss = async () => {
        setOpen(false);
        if (!user?.uid || !userProfile) return;
        await dismissUpgradePrompt({ userId: userProfile.id });
        updateUserProfile({
            ...userProfile,
            upgradePromptDismissedAt: new Date(),
        });
    };

    const handleSubscribe = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const result = await createCheckoutSession({ userId: user.uid });
            if (result?.url) {
                window.location.href = result.url;
            }
        } catch {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => {
                if (!details.open) handleDismiss();
            }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="modal"
                    overflow="hidden"
                >
                    <Flex direction="column">
                        <Flex
                            px={[4, 5]}
                            pt={[4, 5]}
                            pb={3}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Flex alignItems="center" gap={2.5}>
                                <Image
                                    src="/logo_1x.png"
                                    alt="Phoniquest"
                                    h={6}
                                    w="auto"
                                />
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                    letterSpacing="-0.01em"
                                >
                                    Upgrade to Pro
                                </Text>
                            </Flex>
                            <Dialog.CloseTrigger
                                position="relative"
                                top="auto"
                                right="auto"
                                color="brand.textMuted"
                                _hover={{ color: "brand.textPrimary" }}
                            />
                        </Flex>

                        <Box h="1px" bg="brand.divider" mx={[4, 5]} />

                        <Box px={[4, 5]} py={5}>
                            <Flex direction="column" gap={3}>
                                <Text
                                    color="brand.textSecondary"
                                    fontSize="sm"
                                >
                                    You&apos;ve built up a great collection
                                    with {libraryCount} tracks in your library.
                                    As a regular user, you might benefit from
                                    some of the extra features in Pro.
                                </Text>
                                <Text
                                    color="brand.textMuted"
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                >
                                    Pro includes
                                </Text>
                                <VStack
                                    gap={2}
                                    align="stretch"
                                    pl={1}
                                >
                                    {proFeatures.map((b) => (
                                        <Text
                                            key={b.text}
                                            color="brand.textSecondary"
                                            fontSize="sm"
                                        >
                                            • {b.text}
                                        </Text>
                                    ))}
                                </VStack>
                                {proPrice && (
                                    <Text
                                        color="brand.textPrimary"
                                        fontSize="sm"
                                        fontWeight="semibold"
                                    >
                                        {proPrice.formatted} / {proPrice.interval}
                                    </Text>
                                )}
                            </Flex>
                        </Box>

                        <Flex
                            gap={3}
                            px={[4, 5]}
                            py={4}
                            justifyContent="flex-end"
                            css={{
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                background:
                                    "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                borderTop:
                                    "1px solid var(--chakra-colors-brand-divider)",
                            }}
                        >
                            <Button variant="outline" onClick={handleDismiss}>
                                No thanks
                            </Button>
                            <Button
                                variant="primary"
                                loading={loading}
                                onClick={handleSubscribe}
                            >
                                Upgrade
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

ProUpgradePrompt.displayName = "ProUpgradePrompt";

export default ProUpgradePrompt;

"use client";

import React, { useState } from "react";
import { Box, Button, Dialog, Flex, Text, VStack } from "@chakra-ui/react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { createCheckoutSession } from "@/bff/bff";

interface Props {
    featureName: string | null;
    onClose: () => void;
}

const UpgradePrompt = ({ featureName, onClose }: Props) => {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);

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
            open={!!featureName}
            onOpenChange={(details) => {
                if (!details.open) onClose();
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
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                letterSpacing="-0.01em"
                            >
                                Upgrade to Pro
                            </Text>
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
                                    <Text
                                        as="span"
                                        fontWeight="semibold"
                                        color="brand.textPrimary"
                                    >
                                        {featureName}
                                    </Text>{" "}
                                    is a Pro feature. Upgrade to unlock the
                                    full Phoniquest experience:
                                </Text>
                                <VStack
                                    gap={2}
                                    align="stretch"
                                    pl={1}
                                >
                                    <Text
                                        color="brand.textSecondary"
                                        fontSize="sm"
                                    >
                                        • Unlimited library
                                    </Text>
                                    <Text
                                        color="brand.textSecondary"
                                        fontSize="sm"
                                    >
                                        • Advanced filters and curated mode
                                    </Text>
                                    <Text
                                        color="brand.textSecondary"
                                        fontSize="sm"
                                    >
                                        • Support independent music discovery
                                    </Text>
                                </VStack>
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
                            <Button variant="outline" onClick={onClose}>
                                Maybe later
                            </Button>
                            <Button
                                variant="primary"
                                loading={loading}
                                onClick={handleSubscribe}
                            >
                                Subscribe
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

UpgradePrompt.displayName = "UpgradePrompt";

export default UpgradePrompt;

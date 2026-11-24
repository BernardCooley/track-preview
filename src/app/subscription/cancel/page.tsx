"use client";

import { Button, Center, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function SubscriptionCancelPage() {
    const router = useRouter();

    return (
        <Center minH="100dvh" bg="brand.bg" flexDirection="column" gap={6} px={[4, 6]}>
            <Text
                fontSize={["3xl", "4xl"]}
                fontFamily="brand"
                color="brand.textPrimary"
                letterSpacing="wider"
            >
                PHONIQUEST
            </Text>
            <Text
                fontSize="md"
                color="brand.textSecondary"
                textAlign="center"
                maxW="320px"
            >
                No worries — you can upgrade anytime. Your free account is still ready.
            </Text>
            <Button
                variant="primary"
                onClick={() => router.push("/explore")}
            >
                Back to explore
            </Button>
        </Center>
    );
}

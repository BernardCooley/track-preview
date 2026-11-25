"use client";

import { Button, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function HomeActions({ variant }: { variant: "learn-more" | "auth-buttons" | "footer-links" }) {
    const router = useRouter();

    if (variant === "learn-more") {
        return (
            <Flex
                as="li"
                alignItems="center"
                gap={4}
                cursor="pointer"
                userSelect={["none", "auto"]}
                onClick={() => router.push("/how-it-works")}
                _hover={{ "& p": { color: "brand.textPrimary" } }}
                transition="all 0.2s ease"
            >
                <Flex
                    w="40px"
                    h="40px"
                    minW="40px"
                    alignItems="center"
                    justifyContent="center"
                    rounded="lg"
                    bg="brand.primarySubtle"
                    color="brand.primary"
                    aria-hidden="true"
                >
                    →
                </Flex>
                <Text
                    fontSize={["sm", "md"]}
                    color="brand.primary"
                    fontWeight="medium"
                    lineHeight="short"
                    transition="color 0.2s ease"
                >
                    Learn more
                </Text>
            </Flex>
        );
    }

    if (variant === "auth-buttons") {
        return (
            <Flex as="nav" direction="column" gap={5} w="full" maxW="320px" alignItems="center">
                <Flex gap={3} w="full">
                    <Button
                        flex={1}
                        variant="primary"
                        size="lg"
                        onClick={() => router.push("/loginRegister?login=true")}
                    >
                        Sign in
                    </Button>
                    <Button
                        flex={1}
                        variant="outline"
                        size="lg"
                        onClick={() => router.push("/loginRegister?login=false")}
                    >
                        Register
                    </Button>
                </Flex>
            </Flex>
        );
    }

    return (
        <Text
            fontSize="xs"
            color="brand.textMuted"
            cursor="pointer"
            _hover={{ color: "brand.textSecondary" }}
            onClick={() => router.push("/legal")}
        >
            Legal
        </Text>
    );
}

import { Box, Flex, Skeleton, VStack } from "@chakra-ui/react";

export default function HomeSkeleton() {
    return (
        <Flex
            as="main"
            minH="100dvh"
            direction="column"
            alignItems="center"
            px={[6, 8]}
        >
            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                justifyContent="center"
                w="full"
                maxW="520px"
                gap={[10, 24]}
            >
                <VStack gap={4}>
                    <Skeleton h="36px" w="220px" />
                    <Skeleton h="18px" w="320px" />
                </VStack>

                <VStack gap={6} w="full" alignItems="center">
                    <Box
                        w="full"
                        bg="brand.cardBg"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="card"
                        p={[5, 6]}
                    >
                        <VStack gap={4} align="stretch">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Flex key={i} alignItems="center" gap={4}>
                                    <Skeleton h="40px" w="40px" minW="40px" rounded="lg" />
                                    <Skeleton h="14px" flex={1} />
                                </Flex>
                            ))}
                        </VStack>
                    </Box>

                    <Flex gap={3} w="full" maxW="320px">
                        <Skeleton h="48px" flex={1} rounded="lg" />
                        <Skeleton h="48px" flex={1} rounded="lg" />
                    </Flex>
                </VStack>
            </Flex>
        </Flex>
    );
}

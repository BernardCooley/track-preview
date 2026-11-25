import { Box, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";

export default function ExploreSkeleton() {
    return (
        <Flex direction="column" h="100dvh" bg="brand.bg">
            <Box
                w="full"
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                bg="brand.bg"
            >
                <Flex
                    maxW={["none", "none", "none", "1000px"]}
                    mx="auto"
                    alignItems="center"
                    px={[3, 4]}
                    py={1}
                    gap={1}
                    h="52px"
                >
                    <Skeleton h="20px" w="110px" />
                    <Flex flex={1} justifyContent="center" gap={1}>
                        <Skeleton h="44px" w="80px" rounded="lg" />
                        <Skeleton h="44px" w="80px" rounded="lg" />
                    </Flex>
                    <Skeleton h="32px" w="32px" rounded="md" />
                </Flex>
            </Box>

            <Flex flex={1} direction="column" alignItems="center" pt={6} px={[4, 6]} gap={6}>
                <Flex gap={2} w="full" maxW={["none", "none", "none", "1000px"]} px={[0, 2]}>
                    <Skeleton h="32px" w="80px" rounded="full" />
                    <Skeleton h="32px" w="100px" rounded="full" />
                </Flex>

                <Flex
                    direction="column"
                    alignItems="center"
                    w="full"
                    maxW="480px"
                    gap={5}
                >
                    <Skeleton h="280px" w="280px" rounded="lg" />
                    <Flex direction="column" alignItems="center" gap={2} w="full">
                        <Skeleton h="20px" w="200px" />
                        <Skeleton h="16px" w="140px" />
                        <Skeleton h="14px" w="100px" />
                    </Flex>
                    <Skeleton h="48px" w="full" rounded="lg" />
                    <Flex gap={4} w="full" justifyContent="center">
                        <SkeletonCircle size="48px" />
                        <SkeletonCircle size="48px" />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}

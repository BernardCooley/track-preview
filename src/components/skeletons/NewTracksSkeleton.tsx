import { Box, Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";

export default function NewTracksSkeleton() {
    return (
        <Flex direction="column" h="100dvh" bg="brand.bg">
            <Box
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                px={[4, 6]}
                py={3}
            >
                <Flex alignItems="center" gap={3}>
                    <Skeleton h="24px" w="24px" rounded="md" />
                    <Skeleton h="20px" w="100px" />
                </Flex>
            </Box>

            <Flex flex={1} direction="column" alignItems="center" pt={6} px={[4, 6]} gap={5}>
                <Skeleton h="280px" w="280px" rounded="lg" />
                <Flex direction="column" alignItems="center" gap={2} w="full" maxW="480px">
                    <Skeleton h="20px" w="200px" />
                    <Skeleton h="16px" w="140px" />
                    <Skeleton h="14px" w="100px" />
                </Flex>
                <Skeleton h="48px" w="full" maxW="480px" rounded="lg" />
                <Flex gap={4} justifyContent="center">
                    <SkeletonCircle size="48px" />
                    <SkeletonCircle size="48px" />
                </Flex>
            </Flex>
        </Flex>
    );
}

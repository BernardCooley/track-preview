import { Flex, Skeleton, SkeletonCircle } from "@chakra-ui/react";

export default function TrackCardSkeleton() {
    return (
        <Flex direction="column" flex={1} alignItems="center" pt={2} px={[4, 6]} gap={5}>
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
    );
}

import { Center, Flex, Skeleton } from "@chakra-ui/react";

export default function AuthGuardSkeleton() {
    return (
        <Center h="100dvh" bg="brand.bg">
            <Flex direction="column" alignItems="center" gap={6}>
                <Skeleton h="36px" w="220px" />
                <Flex gap={2}>
                    <Skeleton h="8px" w="8px" rounded="full" />
                    <Skeleton h="8px" w="8px" rounded="full" />
                    <Skeleton h="8px" w="8px" rounded="full" />
                </Flex>
            </Flex>
        </Center>
    );
}

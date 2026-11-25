import { Center, Flex, Skeleton } from "@chakra-ui/react";

export default function SubscriptionSuccessSkeleton() {
    return (
        <Center
            minH="100dvh"
            bg="brand.bg"
            flexDirection="column"
            gap={6}
            px={[4, 6]}
        >
            <Skeleton h="36px" w="220px" />
            <Skeleton h="18px" w="260px" />
            <Flex gap={2}>
                <Skeleton h="8px" w="8px" rounded="full" />
                <Skeleton h="8px" w="8px" rounded="full" />
                <Skeleton h="8px" w="8px" rounded="full" />
            </Flex>
        </Center>
    );
}

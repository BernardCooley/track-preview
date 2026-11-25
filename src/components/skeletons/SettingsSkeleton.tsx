import { Box, Flex, Skeleton } from "@chakra-ui/react";

export default function SettingsSkeleton() {
    return (
        <Flex direction="column" gap={6}>
            <Flex alignItems="center" justifyContent="space-between" mb={2}>
                <Skeleton h="22px" w="160px" />
            </Flex>

            {Array.from({ length: 3 }).map((_, i) => (
                <Flex
                    key={i}
                    alignItems="center"
                    justifyContent="space-between"
                    gap={3}
                    px={3}
                    py={2}
                >
                    <Flex direction="column" gap={1}>
                        <Skeleton h="14px" w={`${100 + i * 20}px`} />
                        <Skeleton h="12px" w={`${140 + i * 20}px`} />
                    </Flex>
                    <Skeleton h="24px" w="44px" rounded="full" />
                </Flex>
            ))}
        </Flex>
    );
}

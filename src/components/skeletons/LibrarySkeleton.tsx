import { Box, Flex, Skeleton } from "@chakra-ui/react";

export default function LibrarySkeleton() {
    return (
        <Flex direction="column" gap={0} h="full" overflow="hidden" pt={2}>
            <Flex
                px={[4, 6]}
                py={3}
                justifyContent="space-between"
                alignItems="center"
            >
                <Flex gap={2}>
                    <Skeleton h="32px" w="70px" rounded="full" />
                    <Skeleton h="32px" w="50px" rounded="full" />
                </Flex>
                <Skeleton h="32px" w="32px" rounded="md" />
            </Flex>

            <Flex direction="column" px={[4, 6]} gap={0}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <Flex
                        key={i}
                        py={3}
                        gap={3}
                        alignItems="center"
                        borderBottom="1px solid"
                        borderBottomColor="brand.divider"
                    >
                        <Skeleton h="44px" w="44px" rounded="md" flexShrink={0} />
                        <Flex direction="column" gap={1.5} flex={1}>
                            <Skeleton h="14px" w={`${60 + (i % 3) * 15}%`} />
                            <Skeleton h="12px" w={`${40 + (i % 4) * 10}%`} />
                        </Flex>
                        <Skeleton h="24px" w="24px" rounded="full" />
                    </Flex>
                ))}
            </Flex>
        </Flex>
    );
}

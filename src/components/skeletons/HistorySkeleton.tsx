import { Box, Flex, Skeleton } from "@chakra-ui/react";

export default function HistorySkeleton() {
    return (
        <Box maxW={["none", "none", "none", "1000px"]} mx="auto">
            <Flex px={[3, 4]} pt={3} pb={2} gap={2.5} direction="column">
                <Skeleton h="22px" w="80px" />
                <Skeleton h="28px" w="full" rounded="md" />
                <Flex gap={1.5}>
                    <Skeleton h="28px" w="50px" rounded="md" />
                    <Skeleton h="28px" w="90px" rounded="md" />
                </Flex>
            </Flex>

            <Flex direction="column" px={[3, 4]}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <Flex
                        key={i}
                        py={2.5}
                        gap={3}
                        alignItems="center"
                        borderBottom="1px solid"
                        borderBottomColor="brand.divider"
                    >
                        <Skeleton h="44px" w="44px" rounded="lg" flexShrink={0} />
                        <Flex direction="column" gap={1.5} flex={1}>
                            <Skeleton h="14px" w={`${55 + (i % 3) * 15}%`} />
                            <Skeleton h="12px" w={`${35 + (i % 4) * 10}%`} />
                            <Flex gap={2}>
                                <Skeleton h="16px" w="55px" rounded="full" />
                                <Skeleton h="12px" w="80px" />
                            </Flex>
                        </Flex>
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
}

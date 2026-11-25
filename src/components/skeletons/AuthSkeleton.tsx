import { Box, Flex, Skeleton, VStack } from "@chakra-ui/react";

export default function AuthSkeleton() {
    return (
        <Flex
            h="100dvh"
            direction="column"
            alignItems="center"
            px={[4, 6]}
        >
            <Flex pt={[10, 12]} pb={[4, 6]} justifyContent="center">
                <Skeleton h="36px" w="220px" />
            </Flex>

            <Box
                w="full"
                maxW="480px"
                flex={1}
                bg="brand.cardBg"
                border="1px solid"
                borderColor="brand.border"
                roundedTop="card"
                roundedBottom="none"
                overflow="hidden"
            >
                <Flex borderBottom="1px solid" borderBottomColor="brand.border">
                    <Skeleton h="48px" flex={1} />
                    <Skeleton h="48px" flex={1} />
                </Flex>

                <VStack gap={5} p={[5, 6]} align="stretch">
                    <VStack gap={2} align="stretch">
                        <Skeleton h="12px" w="60px" />
                        <Skeleton h="44px" w="full" rounded="lg" />
                    </VStack>
                    <VStack gap={2} align="stretch">
                        <Skeleton h="12px" w="70px" />
                        <Skeleton h="44px" w="full" rounded="lg" />
                    </VStack>
                    <Skeleton h="48px" w="full" rounded="lg" />
                    <Skeleton h="14px" w="140px" mx="auto" />
                </VStack>
            </Box>
        </Flex>
    );
}

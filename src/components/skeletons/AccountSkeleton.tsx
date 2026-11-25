import { Box, Flex, Skeleton } from "@chakra-ui/react";

export default function AccountSkeleton() {
    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <Box
                borderBottom="1px solid"
                borderBottomColor="brand.divider"
                px={[4, 6]}
                py={3}
            >
                <Flex alignItems="center" gap={3}>
                    <Skeleton h="24px" w="24px" rounded="md" />
                    <Skeleton h="20px" w="80px" />
                </Flex>
            </Box>

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
            >
                <Box
                    w="full"
                    maxW="520px"
                    bg="brand.cardBg"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="card"
                    p={[5, 6]}
                    mb={4}
                >
                    <Skeleton h="22px" w="120px" mb={6} />
                    <Flex direction="column" gap={4}>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Flex direction="column" gap={1}>
                                <Skeleton h="12px" w="90px" />
                                <Skeleton h="16px" w="50px" />
                            </Flex>
                        </Flex>
                        <Box borderTop="1px solid" borderTopColor="brand.divider" pt={4}>
                            <Skeleton h="36px" w="140px" rounded="lg" />
                        </Box>
                    </Flex>
                </Box>

                <Box
                    w="full"
                    maxW="520px"
                    bg="brand.cardBg"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="card"
                    p={[5, 6]}
                >
                    <Skeleton h="22px" w="160px" mb={6} />
                    <Flex direction="column" gap={6}>
                        <Flex direction="column" gap={2}>
                            <Skeleton h="12px" w="100px" />
                            <Skeleton h="16px" w="200px" />
                        </Flex>
                        <Box borderTop="1px solid" borderTopColor="brand.divider" pt={6}>
                            <Flex direction="column" gap={2}>
                                <Skeleton h="12px" w="70px" />
                                <Skeleton h="16px" w="100px" />
                            </Flex>
                        </Box>
                        <Box borderTop="1px solid" borderTopColor="brand.divider" pt={6}>
                            <Flex direction="column" gap={2}>
                                <Skeleton h="12px" w="60px" />
                                <Skeleton h="16px" w="120px" />
                            </Flex>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
}

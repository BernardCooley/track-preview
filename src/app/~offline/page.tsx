import { Box, Flex, Text } from "@chakra-ui/react";

export default function OfflinePage() {
    return (
        <Flex
            direction="column"
            minH="100dvh"
            bg="brand.bg"
            alignItems="center"
            justifyContent="center"
            px={4}
        >
            <Box textAlign="center" maxW="400px">
                <Text
                    fontSize="2xl"
                    fontWeight="semibold"
                    fontFamily="brand"
                    color="brand.textPrimary"
                    mb={2}
                >
                    You&apos;re offline
                </Text>
                <Text fontSize="sm" color="brand.textSecondary">
                    Phoniquest needs an internet connection to discover and
                    play music. Please check your connection and try again.
                </Text>
            </Box>
        </Flex>
    );
}

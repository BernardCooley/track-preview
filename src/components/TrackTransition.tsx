"use client";

import { Box, Flex } from "@chakra-ui/react";

const TrackTransition = () => {
    return (
        <Flex
            direction="column"
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap={8}
            pb={16}
            animation="fadeIn 0.3s ease-out"
            css={{
                "@keyframes fadeIn": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                "@keyframes spin": {
                    from: { transform: "rotate(0deg)" },
                    to: { transform: "rotate(360deg)" },
                },
                "@keyframes pulse": {
                    "0%, 100%": { opacity: 0.3 },
                    "50%": { opacity: 0.6 },
                },
            }}
        >
            <Box position="relative">
                <Box
                    w={["140px", "170px"]}
                    h={["140px", "170px"]}
                    borderRadius="full"
                    bg="brand.surface"
                    animation="spin 3s linear infinite"
                    position="relative"
                    overflow="hidden"
                    _before={{
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        w: "35%",
                        h: "35%",
                        borderRadius: "full",
                        bg: "brand.bg",
                        zIndex: 2,
                    }}
                    _after={{
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        w: "12%",
                        h: "12%",
                        borderRadius: "full",
                        bg: "brand.primaryMuted",
                        zIndex: 3,
                    }}
                >
                    {[30, 42, 54, 66, 78].map((pct) => (
                        <Box
                            key={pct}
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            w={`${pct}%`}
                            h={`${pct}%`}
                            borderRadius="full"
                            border="1px solid"
                            borderColor="brand.border"
                        />
                    ))}
                </Box>
            </Box>

            <Flex direction="column" alignItems="center" gap={3} w="60%">
                <Box
                    h="20px"
                    w="70%"
                    borderRadius="md"
                    bg="brand.surface"
                    animation="pulse 1.5s ease-in-out infinite"
                />
                <Box
                    h="16px"
                    w="50%"
                    borderRadius="md"
                    bg="brand.surface"
                    animation="pulse 1.5s ease-in-out infinite 0.2s"
                />
                <Box
                    h="12px"
                    w="35%"
                    borderRadius="md"
                    bg="brand.surface"
                    animation="pulse 1.5s ease-in-out infinite 0.4s"
                />
            </Flex>
        </Flex>
    );
};

export default TrackTransition;

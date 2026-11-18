"use client";

import { Box, Flex } from "@chakra-ui/react";
import BouncingDotsLoader from "./BouncingLoaderDots";

const TrackTransition = () => {
    return (
        <Flex
            direction="column"
            flex={1}
            alignItems="center"
            justifyContent="center"
            gap={8}
            pb={16}
        >
            <Box
                position="relative"
                css={{
                    "@keyframes spin": {
                        from: { transform: "rotate(0deg)" },
                        to: { transform: "rotate(360deg)" },
                    },
                }}
            >
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

            <BouncingDotsLoader />
        </Flex>
    );
};

export default TrackTransition;

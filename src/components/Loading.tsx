import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import BouncingDotsLoader from "./BouncingLoaderDots";
import { Circle } from "rc-progress";

interface Props {
    progress?: number;
    loadingText?: string;
    showLoadingBar?: boolean;
}

const Loading = ({
    progress,
    loadingText = "Loading",
    showLoadingBar = false,
}: Props) => {
    return (
        <Flex
            gap={2}
            direction="column"
            alignItems="center"
            w={["full", "70%", "50%", "400px"]}
            position="absolute"
            top="100%"
            transform="translate(50%, 0)"
            right="50%"
            bg="brand.backgroundTertiaryOpaque2"
            p={10}
            pt={6}
            rounded={20}
            shadow="2xl"
            border="1px solid"
            borderColor="brand.primary"
        >
            <Flex alignItems="center" gap={2} direction="column">
                <Text color="brand.primary" fontSize="xl">
                    {loadingText}
                </Text>
                <BouncingDotsLoader />
            </Flex>
            {progress !== undefined && showLoadingBar && (
                <Flex
                    direction="column"
                    alignItems="center"
                    position="relative"
                >
                    <Text
                        fontSize="xl"
                        position="absolute"
                        top="50%"
                        transform="translate(0, -50%)"
                        color="brand.primary"
                    >
                        {Math.ceil(progress)}%
                    </Text>
                    <Circle
                        style={{ height: "100px" }}
                        percent={progress}
                        strokeWidth={4}
                        strokeColor="#11999e"
                    />
                </Flex>
            )}
        </Flex>
    );
};

export default Loading;

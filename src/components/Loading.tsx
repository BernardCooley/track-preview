import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import BouncingDotsLoader from "./BouncingLoaderDots";
import { Circle } from "rc-progress";

interface Props {
    progress?: number;
    loadingText?: string;
    showLoadingBar?: boolean;
}

const Loading = ({ progress, loadingText, showLoadingBar = false }: Props) => {
    return (
        <Flex
            gap={3}
            direction="column"
            alignItems="center"
        >
            <Flex alignItems="center" gap={2} direction="column">
                {loadingText && (
                    <Text
                        textAlign="center"
                        color="brand.primary"
                        fontSize="md"
                    >
                        {loadingText}
                    </Text>
                )}
                <BouncingDotsLoader />
            </Flex>
            {progress !== undefined && showLoadingBar && (
                <Flex
                    direction="column"
                    alignItems="center"
                    position="relative"
                >
                    <Text
                        fontSize="lg"
                        position="absolute"
                        top="50%"
                        transform="translate(0, -50%)"
                        color="brand.primary"
                        fontWeight="medium"
                    >
                        {Math.ceil(progress)}%
                    </Text>
                    <Circle
                        style={{ height: "80px" }}
                        percent={progress}
                        strokeWidth={4}
                        strokeColor="#11999e"
                        trailColor="rgba(255,255,255,0.08)"
                    />
                </Flex>
            )}
        </Flex>
    );
};

export default Loading;

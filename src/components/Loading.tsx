import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import BouncingDotsLoader from "./BouncingLoaderDots";
import { Line } from "rc-progress";

interface Props {
    progress?: number;
}

const Loading = ({ progress }: Props) => {
    return (
        <Flex
            gap={2}
            direction="column"
            alignItems="center"
            position="absolute"
            top="100%"
            transform="translate(50%, 0)"
            right="50%"
        >
            <Flex alignItems="center" gap={2}>
                <Text color="teal" fontSize="xl">
                    Loading
                </Text>
                <BouncingDotsLoader />
            </Flex>
            {progress !== undefined && (
                <Flex direction="column" alignItems="center">
                    <Text>{Math.ceil(progress)}%</Text>
                    <Line
                        style={{ height: "10px" }}
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

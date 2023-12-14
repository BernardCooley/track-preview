import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";
import BouncingDotsLoader from "./BouncingLoaderDots";
import { Line } from "rc-progress";

interface Props {
    imageSrc: string;
    progress?: number;
}

const Loading = ({ imageSrc, progress }: Props) => {
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
            <Image src={imageSrc} alt="logo" width={150} height={100} />
            <Flex alignItems="center" gap={2}>
                <Text color="teal" fontSize="xl">
                    Loading
                </Text>
                <BouncingDotsLoader />
            </Flex>
            {progress !== undefined && (
                <Line
                    style={{ height: "10px" }}
                    percent={progress}
                    strokeWidth={4}
                    strokeColor="#11999e"
                />
            )}
        </Flex>
    );
};

export default Loading;

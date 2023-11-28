import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";
import BouncingDotsLoader from "./BouncingLoaderDots";

interface Props {
    imageSrc: string;
}

const Loading = ({ imageSrc }: Props) => {
    return (
        <Flex
            className="loading"
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
        </Flex>
    );
};

export default Loading;

import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";

interface Props {
    genre: string;
    imageSrc: string;
}

const Loading = ({ genre, imageSrc }: Props) => {
    return (
        <Flex
            gap={2}
            direction="column"
            alignItems="center"
            position="absolute"
            top="40%"
            transform="translate(50%, 0)"
            right="50%"
        >
            <Image src={imageSrc} alt="logo" width={150} height={100} />
            <Text color="teal" fontSize="xl">
                {`Loading ${
                    genre.toLowerCase() === "all" ? "" : genre.toLowerCase()
                } track...`}
            </Text>
        </Flex>
    );
};

export default Loading;

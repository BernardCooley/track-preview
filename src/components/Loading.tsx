import { Badge, Center } from "@chakra-ui/react";
import React from "react";

interface Props {
    message: string;
}

const Loading = ({ message }: Props) => {
    return (
        <Center>
            <Badge
                zIndex={150}
                top="50%"
                position="absolute"
                variant="outline"
                colorScheme="green"
                fontSize={["24px", "36px"]}
                px={4}
            >
                {message}
            </Badge>
        </Center>
    );
};

export default Loading;

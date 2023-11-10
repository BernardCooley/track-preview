import { Badge, Center } from "@chakra-ui/react";
import React from "react";

const Loading = () => {
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
                {`Loading more Tracks...`}
            </Badge>
        </Center>
    );
};

export default Loading;

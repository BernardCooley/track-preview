import React from "react";
import { Button } from "@chakra-ui/react";

interface Props {
    toggleTracklist: () => void;
    isShowingTracklist: boolean;
}

const ToggleTracklist = ({ toggleTracklist, isShowingTracklist }: Props) => {
    return (
        <Button
            position="absolute"
            onClick={toggleTracklist}
            variant="ghost"
            right={[1, 4]}
            top={0}
            fontSize="md"
            colorScheme="teal"
            _hover={{
                bg: "transparent",
                color: "brand.primary",
            }}
            shadow="none"
        >
            {isShowingTracklist ? "Show player" : "Show tracklist"}
        </Button>
    );
};

export default ToggleTracklist;

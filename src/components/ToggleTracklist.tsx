import React from "react";
import { Button } from "@chakra-ui/react";

interface Props {
    toggleTracklist: () => void;
    isShowingTracklist: boolean;
}

const ToggleTracklist = ({ toggleTracklist, isShowingTracklist }: Props) => {
    return (
        <Button
            variant="ghost"
            onClick={toggleTracklist}
            fontSize="sm"
            color="whiteAlpha.900"
            rounded="none"
            roundedBottomLeft="lg"
            bg="blackAlpha.500"
            backdropFilter="blur(4px)"
            _hover={{
                bg: "brand.surfaceHover",
                color: "brand.textPrimary",
            }}
            shadow="none"
            height="36px"
            px={3}
        >
            {`Show ${isShowingTracklist ? "player" : "tracklist"}`}
        </Button>
    );
};

export default ToggleTracklist;

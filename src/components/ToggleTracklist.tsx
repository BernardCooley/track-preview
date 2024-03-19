import React from "react";
import { Button } from "@chakra-ui/react";

interface Props {
    toggleTracklist: () => void;
    isShowingTracklist: boolean;
}

const ToggleTracklist = ({ toggleTracklist, isShowingTracklist }: Props) => {
    return (
        <Button
            rounded="none"
            roundedBottomLeft={isShowingTracklist ? 0 : 8}
            bg={
                isShowingTracklist
                    ? "transparent"
                    : "brand.backgroundTertiaryOpaque3"
            }
            color="brand.textPrimaryLight"
            position="absolute"
            onClick={toggleTracklist}
            variant="ghost"
            right={0}
            top={0}
            fontSize="md"
            colorScheme="teal"
            _hover={{
                bg: "brand.backgroundTertiaryOpaque",
                color: "brand.textPrimary",
            }}
            shadow="none"
        >
            {isShowingTracklist ? "Show player" : "Show tracklist"}
        </Button>
    );
};

export default ToggleTracklist;

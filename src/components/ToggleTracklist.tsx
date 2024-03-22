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
            roundedBottomLeft={8}
            bg={
                isShowingTracklist
                    ? "transparent"
                    : "brand.backgroundTertiaryOpaque3"
            }
            color={
                isShowingTracklist
                    ? "brand.textPrimaryLight"
                    : "brand.textPrimary"
            }
            onClick={toggleTracklist}
            variant="ghost"
            fontSize="md"
            colorScheme="teal"
            _hover={{
                bg: "brand.backgroundTertiaryOpaque",
            }}
            shadow="none"
        >
            {`Show ${isShowingTracklist ? "player" : "tracklist"}`}
        </Button>
    );
};

export default ToggleTracklist;

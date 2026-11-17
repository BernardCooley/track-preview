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
            color={isShowingTracklist ? "brand.textMuted" : "brand.textSecondary"}
            rounded="none"
            roundedBottomLeft="lg"
            bg={isShowingTracklist ? "transparent" : "brand.surface"}
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

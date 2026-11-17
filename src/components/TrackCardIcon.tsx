import { IconButton } from "@chakra-ui/react";
import React, { ElementType } from "react";

interface Props {
    Icon: ElementType;
    colorPalette?: string;
    onClick: () => void;
    ariaLabel: string;
    isDisabled?: boolean;
    canHover?: boolean;
}

const TrackCardIcon = ({
    Icon,
    colorPalette = "black",
    onClick,
    ariaLabel,
    isDisabled = false,
    canHover = true,
}: Props) => {
    return (
        <IconButton
            disabled={isDisabled}
            p={[4, 5]}
            shadow="none"
            onClick={onClick}
            variant="ghost"
            w="auto"
            h="auto"
            colorPalette={colorPalette}
            aria-label={ariaLabel}
            fontSize={["44px", "56px", "64px"]}
            bg="brand.surface"
            border="1px solid"
            borderColor="brand.border"
            rounded="full"
            transition="all 0.2s ease"
            _hover={
                canHover
                    ? {
                          transform: "scale(1.1)",
                          shadow: "lg",
                          borderColor: "brand.borderHover",
                      }
                    : {}
            }
            _active={
                canHover
                    ? {
                          transform: "scale(0.95)",
                      }
                    : {}
            }
        >
            <Icon fontSize="inherit" />
        </IconButton>
    );
};

export default TrackCardIcon;

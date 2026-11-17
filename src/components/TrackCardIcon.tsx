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
            p={[4, 6]}
            shadow="none"
            onClick={onClick}
            variant="ghost"
            w="auto"
            h="auto"
            colorPalette={colorPalette}
            aria-label={ariaLabel}
            fontSize={["50px", "60px", "70px"]}
            backgroundColor="brand.backgroundTertiaryOpaque"
            rounded="full"
            _selected={
                canHover
                    ? {
                          transform: "scale(1.2)",
                      }
                    : {}
            }
            _hover={
                canHover
                    ? {
                          transform: "scale(1.2)",
                      }
                    : {}
            }
        >
            <Icon fontSize="inherit" />
        </IconButton>
    );
};

export default TrackCardIcon;

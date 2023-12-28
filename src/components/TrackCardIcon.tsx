import { IconButton } from "@chakra-ui/react";
import React, { ElementType } from "react";

interface Props {
    Icon: ElementType;
    colorScheme?: string;
    onClick: () => void;
    ariaLabel: string;
    isDisabled?: boolean;
    canHover?: boolean;
}

const TrackCardIcon = ({
    Icon,
    colorScheme = "black",
    onClick,
    ariaLabel,
    isDisabled = false,
    canHover = true,
}: Props) => {
    return (
        <IconButton
            isDisabled={isDisabled}
            p={[4, 6]}
            shadow="none"
            onClick={onClick}
            variant="ghost"
            w="auto"
            h="auto"
            colorScheme={colorScheme}
            aria-label={ariaLabel}
            fontSize={["50px", "60px", "70px"]}
            backgroundColor="brand.backgroundTertiaryOpaque"
            rounded="full"
            icon={<Icon fontSize="inherit" />}
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
        />
    );
};

export default TrackCardIcon;

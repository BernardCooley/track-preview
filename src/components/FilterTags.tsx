import { Flex, Tag } from "@chakra-ui/react";
import React from "react";

interface Props {
    settingsOpen: boolean;
    genre: string;
    preferredYearRange?: {
        from: number;
        to: number;
    };
    preferredAutoPlay: boolean;
    showDates: boolean;
}

const FilterTags = ({
    settingsOpen,
    genre,
    preferredYearRange,
    preferredAutoPlay,
    showDates,
}: Props) => {
    return (
        <Flex opacity={settingsOpen ? 0 : 1} transition="opacity 200ms" h={8}>
            <Flex gap={2}>
                <Tag
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    px={3}
                    rounded="full"
                    colorScheme="teal"
                    variant="solid"
                >
                    {genre.toLowerCase() === "all" ? "All genres" : genre}
                </Tag>
                {preferredYearRange && showDates && (
                    <Tag
                        px={3}
                        rounded="full"
                        colorScheme="teal"
                        variant="solid"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        whiteSpace="nowrap"
                    >
                        {Number(preferredYearRange?.from) === 0
                            ? "All years"
                            : `${Number(preferredYearRange?.from)} -
                        ${preferredYearRange?.to}`}
                    </Tag>
                )}
                <Tag
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    px={3}
                    rounded="full"
                    colorScheme="teal"
                    variant={preferredAutoPlay ? "solid" : "outline"}
                >
                    AutoPlay
                </Tag>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

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
}

const FilterTags = ({
    settingsOpen,
    genre,
    preferredYearRange,
    preferredAutoPlay,
}: Props) => {
    return (
        <Flex opacity={settingsOpen ? 0 : 1} transition="opacity 200ms" h={8}>
            <Flex gap={2}>
                <Tag colorScheme="teal" variant="solid">
                    {genre}
                </Tag>
                {preferredYearRange && (
                    <Tag colorScheme="teal" variant="solid">
                        {Number(preferredYearRange?.from) === 0
                            ? "All"
                            : `${Number(preferredYearRange?.from)} -
                        ${preferredYearRange?.to}`}
                    </Tag>
                )}
                <Tag
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

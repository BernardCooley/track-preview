import { Box, Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React from "react";
import { getCurrentYear } from "../../utils";
import { YearRange } from "../../types";

interface Props {
    genre?: string | null;
    yearRange?: YearRange | null;
    profileLoaded: boolean;
    onGenreClick?: () => void;
    onYearClick?: () => void;
    reviewStep: number;
}

const FilterTags = ({
    genre,
    yearRange,
    profileLoaded,
    onGenreClick,
    onYearClick,
    reviewStep,
}: Props) => {
    return (
        <Flex transition="opacity 0.3s" opacity={reviewStep === 1 ? 1 : 0}>
            <Flex gap={2} w="full" flexWrap="wrap">
                <Tag
                    w={genre ? "auto" : "86px"}
                    key={`${genre}`}
                    variant="filter"
                    pointerEvents={profileLoaded ? "auto" : "none"}
                    onClick={onGenreClick}
                >
                    {genre ? (
                        <Text userSelect="none">
                            {genre.toLowerCase() === "all"
                                ? "All genres"
                                : genre}
                        </Text>
                    ) : (
                        <Box w="full">
                            <Spinner color="brand.primary" size="xs" />
                        </Box>
                    )}
                </Tag>

                <Tag
                    w={yearRange && profileLoaded ? "auto" : "76px"}
                    variant="filter"
                    onClick={onYearClick}
                    pointerEvents={profileLoaded ? "auto" : "none"}
                >
                    {yearRange && profileLoaded ? (
                        <Text userSelect="none">
                            {yearRange.from === 1960 &&
                            yearRange.to === getCurrentYear()
                                ? "All years"
                                : `${yearRange.from} -
                         ${yearRange?.to}`}
                        </Text>
                    ) : (
                        <Box w="full">
                            <Spinner color="brand.primary" size="xs" />
                        </Box>
                    )}
                </Tag>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

import { Box, Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React from "react";
import { getCurrentYear } from "../../utils";
import { YearRange } from "../../types";

interface Props {
    genres?: string[] | null;
    yearRange?: YearRange | null;
    profileLoaded: boolean;
    onGenreClick?: () => void;
    onYearClick?: () => void;
    reviewStep: number;
}

function getGenreLabel(genres?: string[] | null): string {
    if (!genres || genres.length === 0) return "All genres";
    if (genres.some((g) => g.toLowerCase() === "all")) return "All genres";
    if (genres.length === 1) return genres[0];
    return `${genres.length} genres`;
}

const FilterTags = ({
    genres,
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
                    w={genres ? "auto" : "86px"}
                    variant="filter"
                    pointerEvents={profileLoaded ? "auto" : "none"}
                    onClick={onGenreClick}
                >
                    {genres ? (
                        <Text userSelect="none">
                            {getGenreLabel(genres)}
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

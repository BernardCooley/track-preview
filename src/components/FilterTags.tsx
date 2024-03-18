import { Box, Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React from "react";
import { getCurrentYear } from "../../utils";
import { YearRange } from "../../types";

interface Props {
    genre?: string | null;
    yearRange?: YearRange | null;
    showDates: boolean;
    showGenre: boolean;
    profileLoaded: boolean;
    onGenreClick?: () => void;
    onYearClick?: () => void;
}

const FilterTags = ({
    genre,
    yearRange,
    showDates,
    showGenre,
    profileLoaded,
    onGenreClick,
    onYearClick,
}: Props) => {
    return (
        <Flex transition="opacity 200ms">
            <Flex gap={2} w="full" flexWrap="wrap">
                {showGenre && (
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
                )}

                {showDates ? (
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
                ) : null}
            </Flex>
        </Flex>
    );
};

export default FilterTags;

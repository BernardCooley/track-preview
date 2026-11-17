import { Flex, Spinner, Text } from "@chakra-ui/react";
import React from "react";
import { getCurrentYear } from "../../utils";
import { YearRange } from "../../types";
import { Button } from "@chakra-ui/react";

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

function hasGenreFilter(genres?: string[] | null): boolean {
    if (!genres || genres.length === 0) return false;
    if (genres.some((g) => g.toLowerCase() === "all")) return false;
    return true;
}

function hasYearFilter(yearRange?: YearRange | null): boolean {
    if (!yearRange) return false;
    return yearRange.from !== 1960 || yearRange.to !== getCurrentYear();
}

const FilterTags = ({
    genres,
    yearRange,
    profileLoaded,
    onGenreClick,
    onYearClick,
    reviewStep,
}: Props) => {
    const genreActive = hasGenreFilter(genres);
    const yearActive = hasYearFilter(yearRange);

    return (
        <Flex
            transition="opacity 0.3s"
            opacity={reviewStep === 1 ? 1 : 0}
            gap={2}
            flexWrap="wrap"
        >
            <Button
                variant={genreActive ? "subtle" : "surface"}
                onClick={onGenreClick}
                pointerEvents={profileLoaded ? "auto" : "none"}
                minW="80px"
            >
                {genres ? (
                    <Text userSelect="none" fontSize="sm">
                        {getGenreLabel(genres)}
                    </Text>
                ) : (
                    <Spinner color="brand.primary" size="xs" />
                )}
            </Button>

            <Button
                variant={yearActive ? "subtle" : "surface"}
                onClick={onYearClick}
                pointerEvents={profileLoaded ? "auto" : "none"}
                minW="70px"
            >
                {yearRange && profileLoaded ? (
                    <Text userSelect="none" fontSize="sm">
                        {yearRange.from === 1960 &&
                        yearRange.to === getCurrentYear()
                            ? "All years"
                            : `${yearRange.from} - ${yearRange?.to}`}
                    </Text>
                ) : (
                    <Spinner color="brand.primary" size="xs" />
                )}
            </Button>
        </Flex>
    );
};

export default FilterTags;

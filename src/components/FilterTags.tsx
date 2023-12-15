import { Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React from "react";
import { isMobile } from "react-device-detect";
import { getCurrentYear } from "../../utils";

interface Props {
    genre?: string | null;
    yearRange?: {
        from: number;
        to: number;
    } | null;
    preferredAutoPlay: boolean;
    showDates: boolean;
    onAutoPlayToggle: () => void;
    onGenreClick?: () => void;
    onYearClick?: () => void;
}

const FilterTags = ({
    genre,
    yearRange,
    preferredAutoPlay,
    showDates,
    onAutoPlayToggle,
    onGenreClick,
    onYearClick,
}: Props) => {
    return (
        <Flex transition="opacity 200ms">
            <Flex gap={2} w="full" flexWrap="wrap">
                <Tag key={`${genre}`} variant="filter" onClick={onGenreClick}>
                    {genre ? (
                        <Text>
                            {genre.toLowerCase() === "all"
                                ? "All genres"
                                : genre}
                        </Text>
                    ) : (
                        <Spinner color="brand.primary" size="xs" />
                    )}
                </Tag>

                {showDates ? (
                    <Tag variant="filter" onClick={onYearClick}>
                        {yearRange ? (
                            <Text>
                                {yearRange.from === 1960 &&
                                yearRange.to === getCurrentYear()
                                    ? "All years"
                                    : `${yearRange.from} -
                         ${yearRange?.to}`}
                            </Text>
                        ) : (
                            <Spinner color="brand.primary" size="xs" />
                        )}
                    </Tag>
                ) : null}

                <Tag
                    onClick={onAutoPlayToggle}
                    bg={
                        preferredAutoPlay
                            ? "brand.primaryOpaque"
                            : "transparent"
                    }
                    borderColor={
                        preferredAutoPlay
                            ? "brand.primaryLight"
                            : "brand.primaryOpaque"
                    }
                    _hover={
                        isMobile
                            ? {}
                            : {
                                  cursor: "pointer",
                                  bg: preferredAutoPlay
                                      ? "transparent"
                                      : "brand.primaryOpaque",
                                  borderColor: preferredAutoPlay
                                      ? "brand.primaryOpaque"
                                      : "brand.primaryLight",
                              }
                    }
                    variant="filter"
                >
                    AutoPlay
                </Tag>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

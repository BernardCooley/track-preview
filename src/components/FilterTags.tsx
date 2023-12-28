import { Box, Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React from "react";
import { isMobile } from "react-device-detect";
import { getCurrentYear } from "../../utils";
import { YearRange } from "../../types";

interface Props {
    genre?: string | null;
    yearRange?: YearRange | null;
    preferredAutoPlay: boolean;
    showDates: boolean;
    showGenre: boolean;
    profileLoaded: boolean;
    onAutoPlayToggle: () => void;
    onGenreClick?: () => void;
    onYearClick?: () => void;
    autoplayLoading?: boolean;
}

const FilterTags = ({
    genre,
    yearRange,
    preferredAutoPlay,
    showDates,
    showGenre,
    profileLoaded,
    onAutoPlayToggle,
    onGenreClick,
    onYearClick,
    autoplayLoading = false,
}: Props) => {
    return (
        <Flex transition="opacity 200ms">
            <Flex gap={2} w="full" flexWrap="wrap">
                {showGenre && (
                    <Tag
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
                            <Spinner color="brand.primary" size="xs" />
                        )}
                    </Tag>
                )}

                {showDates ? (
                    <Tag
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
                            <Spinner color="brand.primary" size="xs" />
                        )}
                    </Tag>
                ) : null}

                <Tag
                    w="102px"
                    onClick={onAutoPlayToggle}
                    pointerEvents={profileLoaded ? "auto" : "none"}
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
                    {profileLoaded && !autoplayLoading ? (
                        <Text userSelect="none">AutoPlay</Text>
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

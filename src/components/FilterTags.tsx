import { Flex, Tag } from "@chakra-ui/react";
import React from "react";
import { isMobile } from "react-device-detect";

interface Props {
    genre?: string;
    preferredYearRange?: {
        from: number;
        to: number;
    };
    preferredAutoPlay: boolean;
    showDates: boolean;
    onAutoPlayToggle: () => void;
    onGenreClick?: () => void;
    onYearClick?: () => void;
}

const FilterTags = ({
    genre,
    preferredYearRange,
    preferredAutoPlay,
    showDates,
    onAutoPlayToggle,
    onGenreClick,
    onYearClick,
}: Props) => {
    return (
        <Flex transition="opacity 200ms">
            <Flex gap={2} w="full" flexWrap="wrap">
                {genre && (
                    <Tag variant="filter" onClick={onGenreClick}>
                        {genre.toLowerCase() === "all" ? "All genres" : genre}
                    </Tag>
                )}

                {preferredYearRange && showDates && (
                    <Tag variant="filter" onClick={onYearClick}>
                        {Number(preferredYearRange?.from) === 0
                            ? "All years"
                            : `${Number(preferredYearRange?.from)} -
                         ${preferredYearRange?.to}`}
                    </Tag>
                )}

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

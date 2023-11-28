import { Button, Flex } from "@chakra-ui/react";
import React from "react";

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
}

const FilterTags = ({
    genre,
    preferredYearRange,
    preferredAutoPlay,
    showDates,
    onAutoPlayToggle,
    onGenreClick,
}: Props) => {
    return (
        <Flex transition="opacity 200ms">
            <Flex gap={2} w="full" flexWrap="wrap">
                {genre && (
                    <Button variant="filter" onClick={onGenreClick}>
                        {genre.toLowerCase() === "all" ? "All genres" : genre}
                    </Button>
                )}
                {preferredYearRange && showDates && (
                    <Button variant="filter">
                        {Number(preferredYearRange?.from) === 0
                            ? "All years"
                            : `${Number(preferredYearRange?.from)} -
                         ${preferredYearRange?.to}`}
                    </Button>
                )}

                <Button
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
                    _hover={{
                        bg: preferredAutoPlay
                            ? "transparent"
                            : "brand.primaryOpaque",
                        borderColor: preferredAutoPlay
                            ? "brand.primaryOpaque"
                            : "brand.primaryLight",
                    }}
                    variant="filter"
                >
                    AutoPlay
                </Button>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

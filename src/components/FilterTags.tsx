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
                <Tag.Root
                    w={genres ? "auto" : "86px"}
                    paddingY="6px"
                    paddingX="10px"
                    border="1px solid"
                    borderColor="brand.primary"
                    backgroundColor="brand.backgroundTertiary"
                    _hover={{
                        shadow: "xl",
                        border: "1px solid",
                        borderColor: "brand.primaryLight",
                        bg: "brand.primaryOpaque",
                        cursor: "pointer",
                    }}
                    _active={{
                        shadow: "xl",
                        border: "1px solid",
                        borderColor: "brand.primaryLight",
                        bg: "brand.primaryOpaque",
                    }}
                    color="white"
                    fontSize="14px"
                    fontWeight="normal"
                    rounded="full"
                    userSelect="none"
                    textAlign="center"
                    whiteSpace="nowrap"
                    bg="brand.backgroundTertiaryOpaque"
                    pointerEvents={profileLoaded ? "auto" : "none"}
                    onClick={onGenreClick}
                >
                    <Tag.Label w="full">
                        {genres ? (
                            <Text userSelect="none">
                                {getGenreLabel(genres)}
                            </Text>
                        ) : (
                            <Box w="full">
                                <Spinner color="brand.primary" size="xs" />
                            </Box>
                        )}
                    </Tag.Label>
                </Tag.Root>

                <Tag.Root
                    w={yearRange && profileLoaded ? "auto" : "76px"}
                    paddingY="6px"
                    paddingX="10px"
                    border="1px solid"
                    borderColor="brand.primary"
                    backgroundColor="brand.backgroundTertiary"
                    _hover={{
                        shadow: "xl",
                        border: "1px solid",
                        borderColor: "brand.primaryLight",
                        bg: "brand.primaryOpaque",
                        cursor: "pointer",
                    }}
                    _active={{
                        shadow: "xl",
                        border: "1px solid",
                        borderColor: "brand.primaryLight",
                        bg: "brand.primaryOpaque",
                    }}
                    color="white"
                    fontSize="14px"
                    fontWeight="normal"
                    rounded="full"
                    userSelect="none"
                    textAlign="center"
                    whiteSpace="nowrap"
                    bg="brand.backgroundTertiaryOpaque"
                    onClick={onYearClick}
                    pointerEvents={profileLoaded ? "auto" : "none"}
                >
                    <Tag.Label w="full">
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
                    </Tag.Label>
                </Tag.Root>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

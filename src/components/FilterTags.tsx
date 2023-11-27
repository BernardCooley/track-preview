import { Flex, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
    settingsOpen: boolean;
    genre: string;
    preferredYearRange?: {
        from: number;
        to: number;
    };
    preferredAutoPlay: boolean;
    showDates: boolean;
}

const FilterTags = ({
    settingsOpen,
    genre,
    preferredYearRange,
    preferredAutoPlay,
    showDates,
}: Props) => {
    const TagContainer = ({
        children,
        background,
        borderColor = background,
    }: {
        children: React.ReactNode;
        background: string;
        borderColor?: string;
    }) => {
        return (
            <Flex
                pointerEvents="none"
                userSelect="none"
                textAlign="center"
                whiteSpace="nowrap"
                px={3}
                rounded="full"
                bg={background}
                alignItems="center"
                border="1px solid"
                borderColor={borderColor}
            >
                {children}
            </Flex>
        );
    };

    return (
        <Flex
            opacity={settingsOpen ? 0 : 1}
            transition="opacity 200ms"
            h={8}
            w="80%"
        >
            <Flex gap={2} w="full" overflowX="scroll">
                <TagContainer background="brand.primaryOpaque">
                    <Text>
                        {genre.toLowerCase() === "all" ? "All genres" : genre}
                    </Text>
                </TagContainer>
                {preferredYearRange && showDates && (
                    <TagContainer background="brand.primaryOpaque">
                        {Number(preferredYearRange?.from) === 0
                            ? "All years"
                            : `${Number(preferredYearRange?.from)} -
                        ${preferredYearRange?.to}`}
                    </TagContainer>
                )}
                <TagContainer
                    background={
                        preferredAutoPlay
                            ? "brand.primaryOpaque"
                            : "transparent"
                    }
                    borderColor={
                        preferredAutoPlay
                            ? "transparent"
                            : "brand.primaryOpaque"
                    }
                >
                    <Text>AutoPlay</Text>
                </TagContainer>
            </Flex>
        </Flex>
    );
};

export default FilterTags;

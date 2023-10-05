import React, { LegacyRef, forwardRef } from "react";
import { Flex, Select, Switch, Text } from "@chakra-ui/react";

interface Props {
    onGenreSelect: (genre: string) => void;
    selectedGenre: string | null;
    genres: string[];
    autoPlay: boolean;
    onAutoPlayChange: (autoPlay: boolean) => void;
}

const ReviewTracksFilters = forwardRef(
    (
        {
            onGenreSelect,
            selectedGenre,
            genres,
            autoPlay,
            onAutoPlayChange,
        }: Props,
        ref: LegacyRef<HTMLSelectElement>
    ) => {
        return (
            <Flex
                alignItems="center"
                position="absolute"
                direction="column"
                zIndex={150}
                w="full"
                top="-10px"
            >
                <Flex
                    gap={10}
                    zIndex="100"
                    justifyContent="space-between"
                    mx={4}
                    alignItems="center"
                    w="full"
                    px={4}
                >
                    <Flex alignItems="center" gap={4}>
                        <Select
                            _focusVisible={{
                                boxShadow: "none",
                            }}
                            ref={ref}
                            variant="outline"
                            placeholder="Select genre"
                            onChange={(e) => onGenreSelect(e.target.value)}
                            defaultValue={selectedGenre || ""}
                        >
                            {genres.sort().map((style) => (
                                <option key={style} value={style}>
                                    {style}
                                </option>
                            ))}
                        </Select>
                    </Flex>
                    <Flex direction="row" gap={4}>
                        <Text>Autoplay </Text>
                        <Switch
                            isChecked={autoPlay}
                            onChange={(e) => {
                                onAutoPlayChange(e.target.checked);
                            }}
                            colorScheme="teal"
                            size="lg"
                        />
                    </Flex>
                </Flex>
            </Flex>
        );
    }
);

ReviewTracksFilters.displayName = "ReviewTracksFilters";

export default ReviewTracksFilters;

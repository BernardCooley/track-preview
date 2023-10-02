import React, { useState } from "react";
import { Collapse, Flex, Select, Switch, Text } from "@chakra-ui/react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface Props {
    onGenreSelect: (genre: string) => void;
    selectedGenre: string;
    genres: string[];
    autoPlay: boolean;
    onAutoPlayChange: (autoPlay: boolean) => void;
}

const ReviewTracksFilters = ({
    onGenreSelect,
    selectedGenre,
    genres,
    autoPlay,
    onAutoPlayChange,
}: Props) => {
    const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

    return (
        <Flex alignItems="center" position="relative" direction="column">
            <Collapse in={filtersOpen}>
                <Flex
                    gap={10}
                    mb={4}
                    zIndex="100"
                    justifyContent="space-between"
                    mx={4}
                    alignItems="center"
                >
                    <Flex alignItems="center" gap={4}>
                        <Select
                            variant="outline"
                            placeholder="Select option"
                            onChange={(e) => onGenreSelect(e.target.value)}
                            defaultValue={selectedGenre}
                        >
                            {genres.map((style) => (
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
            </Collapse>
            <Flex w="full" justifyContent="center">
                <KeyboardArrowDownIcon
                    fontSize="large"
                    onClick={() => setFiltersOpen((prev) => !prev)}
                    sx={{
                        transform: filtersOpen ? "rotate(180deg)" : "",
                    }}
                />
            </Flex>
        </Flex>
    );
};

export default ReviewTracksFilters;

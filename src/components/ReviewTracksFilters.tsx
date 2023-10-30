import React, { LegacyRef, forwardRef } from "react";
import {
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    Select,
    Switch,
} from "@chakra-ui/react";
import { arrayRange } from "../../utils";

interface Props {
    onGenreSelect: (genre: string) => void;
    onYearSelect: (genre: string) => void;
    selectedGenre: string | null;
    selectedYear: string | null;
    genres: string[];
    autoPlay: boolean;
    onAutoPlayChange: (autoPlay: boolean) => void;
    isOpen: boolean;
}

const ReviewTracksFilters = forwardRef(
    (
        {
            onGenreSelect,
            onYearSelect,
            selectedGenre,
            selectedYear,
            genres,
            autoPlay,
            onAutoPlayChange,
            isOpen,
        }: Props,
        ref: LegacyRef<HTMLSelectElement>
    ) => {
        return (
            <Collapse in={isOpen} animateOpacity>
                <Flex
                    alignItems="center"
                    direction="column"
                    zIndex={150}
                    w="full"
                >
                    <Flex
                        gap={2}
                        zIndex="100"
                        justifyContent="space-between"
                        mx={4}
                        alignItems="center"
                        w="full"
                        px={4}
                        flexWrap="wrap"
                        mb={1}
                    >
                        <Flex alignItems="center" gap={4}>
                            <Select
                                boxShadow="md"
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
                        <Flex alignItems="center" gap={4}>
                            <Select
                                boxShadow="md"
                                _focusVisible={{
                                    boxShadow: "none",
                                }}
                                variant="outline"
                                placeholder="Select year"
                                onChange={(e) => onYearSelect(e.target.value)}
                                defaultValue={selectedYear || ""}
                            >
                                {arrayRange(1900, new Date().getFullYear(), 1)
                                    .reverse()
                                    .map((year) => (
                                        <option
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </option>
                                    ))}
                            </Select>
                        </Flex>
                        <FormControl
                            display="flex"
                            alignItems="center"
                            w="auto"
                            boxShadow="md"
                            rounded={6}
                            h="40px"
                            px={4}
                            _hover={{
                                cursor: "pointer",
                            }}
                        >
                            <FormLabel
                                _hover={{
                                    cursor: "pointer",
                                }}
                                htmlFor="autoplay"
                                mb="0"
                            >
                                AutoPlay
                            </FormLabel>
                            <Switch
                                isChecked={autoPlay}
                                id="autoplay"
                                onChange={(e) => {
                                    onAutoPlayChange(e.target.checked);
                                }}
                                size="md"
                                rounded={6}
                            />
                        </FormControl>
                    </Flex>
                </Flex>
            </Collapse>
        );
    }
);

ReviewTracksFilters.displayName = "ReviewTracksFilters";

export default ReviewTracksFilters;

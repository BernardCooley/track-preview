import React, { LegacyRef, forwardRef, useEffect, useRef } from "react";
import {
    Box,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Select,
    Switch,
} from "@chakra-ui/react";
import { arrayRange } from "../../utils";
import { useReadLocalStorage } from "usehooks-ts";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";

interface Props {
    onGenreSelect: (genre: string) => void;
    onYearFromSelect: (genre: string) => void;
    onYearToSelect: (genre: string) => void;
    selectedGenre: string | null;
    selectedYearFrom: number;
    selectedYearTo: number;
    genres: string[];
    autoPlay: boolean;
    onAutoPlayChange: (autoPlay: boolean) => void;
    isOpen: boolean;
    onConfirm: () => void;
    preferredYearRange: { from: number; to: number };
}

const ReviewTracksFilters = forwardRef(
    (
        {
            onGenreSelect,
            onYearFromSelect,
            onYearToSelect,
            selectedGenre,
            selectedYearFrom,
            selectedYearTo,
            genres,
            autoPlay,
            onAutoPlayChange,
            isOpen,
            onConfirm,
            preferredYearRange,
        }: Props,
        ref: LegacyRef<HTMLSelectElement>
    ) => {
        const router = useRouter();
        const yearFromRef = useRef<HTMLSelectElement>(null);
        const yearToRef = useRef<HTMLSelectElement>(null);
        const autoPlayRef = useRef<HTMLInputElement>(null);
        const preferredAutoPlay: any = useReadLocalStorage("preferredAutoPlay");

        useEffect(() => {
            if (yearFromRef?.current?.value) {
                yearFromRef.current.value = preferredYearRange.from.toString();
            }
            if (yearToRef?.current?.value) {
                yearToRef.current.value = preferredYearRange.to.toString();
            }
        }, [preferredYearRange]);

        useEffect(() => {
            if (autoPlayRef?.current?.value) {
                autoPlayRef.current.value = preferredAutoPlay;
            }
        }, [preferredAutoPlay]);

        return (
            <Box w="full">
                <Collapse in={isOpen} animateOpacity>
                    <Flex
                        alignItems="center"
                        zIndex={150}
                        w="full"
                        justifyContent="space-between"
                    >
                        <Flex
                            gap={6}
                            zIndex="100"
                            justifyContent="flex-start"
                            alignItems="center"
                            w="full"
                            flexWrap="wrap"
                            mb={1}
                        >
                            <Flex
                                alignItems="flex-start"
                                gap={2}
                                direction="column"
                            >
                                <FormLabel fontSize="md" mb={0}>
                                    <Box>Genre</Box>
                                </FormLabel>
                                <Select
                                    boxShadow="md"
                                    _focusVisible={{
                                        boxShadow: "none",
                                    }}
                                    ref={ref}
                                    variant="outline"
                                    placeholder="Select genre"
                                    onChange={(e) =>
                                        onGenreSelect(e.target.value)
                                    }
                                    defaultValue={selectedGenre || "All"}
                                >
                                    <option value="all">All</option>
                                    {genres.sort().map((style) => (
                                        <option key={style} value={style}>
                                            {style}
                                        </option>
                                    ))}
                                </Select>
                            </Flex>
                            <Flex
                                alignItems="flex-start"
                                gap={2}
                                direction="column"
                            >
                                <FormLabel fontSize="md" mb={0}>
                                    <Box>Year from</Box>
                                </FormLabel>
                                <Select
                                    ref={yearFromRef}
                                    boxShadow="md"
                                    _focusVisible={{
                                        boxShadow: "none",
                                    }}
                                    variant="outline"
                                    placeholder="Year from"
                                    onChange={(e) =>
                                        onYearFromSelect(e.target.value)
                                    }
                                    defaultValue={selectedYearFrom}
                                >
                                    <option value={0}>All</option>
                                    {arrayRange(
                                        1950,
                                        new Date().getFullYear(),
                                        1
                                    )
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
                            {selectedYearFrom !== 0 && (
                                <Flex
                                    alignItems="flex-start"
                                    gap={2}
                                    direction="column"
                                >
                                    <FormLabel fontSize="md" mb={0}>
                                        <Box>Year to</Box>
                                    </FormLabel>
                                    <Select
                                        ref={yearToRef}
                                        boxShadow="md"
                                        _focusVisible={{
                                            boxShadow: "none",
                                        }}
                                        variant="outline"
                                        placeholder="Year to"
                                        onChange={(e) =>
                                            onYearToSelect(e.target.value)
                                        }
                                        defaultValue={selectedYearTo || ""}
                                    >
                                        {arrayRange(
                                            Number(selectedYearFrom) + 1,
                                            new Date().getFullYear(),
                                            1
                                        )
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
                            )}
                            <Flex
                                alignItems="flex-start"
                                gap={2}
                                direction="column"
                            >
                                <FormLabel fontSize="md" mb={0}>
                                    <Box>AutoPlay</Box>
                                </FormLabel>
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
                                    <Switch
                                        colorScheme="teal"
                                        ref={autoPlayRef}
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
                        <Box position="absolute" top={3} right={2}>
                            <IconButton
                                rounded="full"
                                onClick={() => router.push("/settings")}
                                variant="ghost"
                                colorScheme="teal"
                                aria-label="settings page"
                                fontSize="3xl"
                                icon={<AccountCircleIcon fontSize="inherit" />}
                            />
                        </Box>
                    </Flex>
                </Collapse>
            </Box>
        );
    }
);

ReviewTracksFilters.displayName = "ReviewTracksFilters";

export default ReviewTracksFilters;

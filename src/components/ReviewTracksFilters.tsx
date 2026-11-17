import React, { LegacyRef, forwardRef, useEffect, useRef } from "react";
import {
    Box,
    Collapsible,
    Field,
    Flex,
    IconButton,
    NativeSelect,
    Switch,
} from "@chakra-ui/react";
import { arrayRange, getCurrentYear } from "../../utils";
import { useReadLocalStorage } from "usehooks-ts";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";

interface Props {
    showDates: boolean;
    onGenreSelect: (genre: string) => void;
    onYearFromSelect?: (genre: string) => void;
    onYearToSelect?: (genre: string) => void;
    selectedGenre: string | null;
    selectedYearFrom?: number;
    selectedYearTo?: number;
    genres: string[];
    autoPlay: boolean;
    onAutoPlayChange: (autoPlay: boolean) => void;
    isOpen: boolean;
    preferredYearRange?: { from: number; to: number };
}

const ReviewTracksFilters = forwardRef(
    (
        {
            showDates,
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
            if (yearFromRef?.current?.value && preferredYearRange) {
                yearFromRef.current.value = preferredYearRange.from.toString();
            }
            if (yearToRef?.current?.value && preferredYearRange) {
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
                <Collapsible.Root open={isOpen}>
                    <Collapsible.Content>
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
                                    <Field.Label fontSize="md" mb={0}>
                                        <Box>Genre</Box>
                                    </Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            boxShadow="md"
                                            _focusVisible={{
                                                boxShadow: "none",
                                            }}
                                            ref={ref}
                                            onChange={(e) =>
                                                onGenreSelect(e.target.value)
                                            }
                                            defaultValue={selectedGenre || "All"}
                                            height="50px"
                                            border="1px solid"
                                            borderColor="brand.backgroundPrimary"
                                            shadow="md"
                                            backgroundColor="brand.backgroundTertiaryOpaque"
                                            color="white"
                                            _focus={{
                                                shadow: "xl",
                                                borderColor: "brand.primary",
                                            }}
                                        >
                                            <option value="all">All</option>
                                            {genres.sort().map((style) => (
                                                <option key={style} value={style}>
                                                    {style}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Flex>
                                {showDates && (
                                    <Flex
                                        alignItems="flex-start"
                                        gap={2}
                                        direction="column"
                                    >
                                        <Field.Label fontSize="md" mb={0}>
                                            <Box>Year from</Box>
                                        </Field.Label>
                                        <NativeSelect.Root>
                                            <NativeSelect.Field
                                                ref={yearFromRef}
                                                boxShadow="md"
                                                _focusVisible={{
                                                    boxShadow: "none",
                                                }}
                                                onChange={(e) => {
                                                    if (onYearFromSelect) {
                                                        onYearFromSelect(
                                                            e.target.value
                                                        );
                                                    }
                                                }}
                                                defaultValue={selectedYearFrom}
                                                height="50px"
                                                border="1px solid"
                                                borderColor="brand.backgroundPrimary"
                                                shadow="md"
                                                backgroundColor="brand.backgroundTertiaryOpaque"
                                                color="white"
                                                _focus={{
                                                    shadow: "xl",
                                                    borderColor: "brand.primary",
                                                }}
                                            >
                                                <option value={0}>All</option>
                                                {arrayRange(1950, getCurrentYear(), 1)
                                                    .reverse()
                                                    .map((year) => (
                                                        <option
                                                            key={year}
                                                            value={year.toString()}
                                                        >
                                                            {year}
                                                        </option>
                                                    ))}
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Flex>
                                )}
                                {selectedYearFrom !== 0 && showDates && (
                                    <Flex
                                        alignItems="flex-start"
                                        gap={2}
                                        direction="column"
                                    >
                                        <Field.Label fontSize="md" mb={0}>
                                            <Box>Year to</Box>
                                        </Field.Label>
                                        <NativeSelect.Root>
                                            <NativeSelect.Field
                                                ref={yearToRef}
                                                boxShadow="md"
                                                _focusVisible={{
                                                    boxShadow: "none",
                                                }}
                                                onChange={(e) => {
                                                    if (onYearToSelect) {
                                                        onYearToSelect(e.target.value);
                                                    }
                                                }}
                                                defaultValue={selectedYearTo || ""}
                                                height="50px"
                                                border="1px solid"
                                                borderColor="brand.backgroundPrimary"
                                                shadow="md"
                                                backgroundColor="brand.backgroundTertiaryOpaque"
                                                color="white"
                                                _focus={{
                                                    shadow: "xl",
                                                    borderColor: "brand.primary",
                                                }}
                                            >
                                                {arrayRange(
                                                    Number(selectedYearFrom) + 1,
                                                    getCurrentYear(),
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
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Flex>
                                )}
                                <Flex
                                    alignItems="flex-start"
                                    gap={2}
                                    direction="column"
                                >
                                    <Field.Label fontSize="md" mb={0}>
                                        <Box>AutoPlay</Box>
                                    </Field.Label>
                                    <Field.Root
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
                                        <Switch.Root
                                            colorPalette="teal"
                                            checked={autoPlay}
                                            onCheckedChange={(details) => {
                                                onAutoPlayChange(details.checked);
                                            }}
                                            size="md"
                                        >
                                            <Switch.Control rounded={6}>
                                                <Switch.Thumb />
                                            </Switch.Control>
                                        </Switch.Root>
                                    </Field.Root>
                                </Flex>
                            </Flex>
                            <Box position="absolute" top={3} right={[6, 2]}>
                                <IconButton
                                    rounded="full"
                                    onClick={() => router.push("/settings")}
                                    variant="ghost"
                                    colorPalette="teal"
                                    aria-label="settings page"
                                    fontSize="3xl"
                                >
                                    <AccountCircleIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        </Flex>
                    </Collapsible.Content>
                </Collapsible.Root>
            </Box>
        );
    }
);

ReviewTracksFilters.displayName = "ReviewTracksFilters";

export default ReviewTracksFilters;

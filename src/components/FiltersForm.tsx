import {
    Box,
    Button,
    Collapse,
    Flex,
    FormControl,
    FormLabel,
    IconButton,
    Select,
    Switch,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { arrayRange, getCurrentYear } from "../../utils";
import ApplyFiltersButton from "./ApplyFiltersButton";
import { useRouter } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export interface FormData {
    genre: string;
    yearFrom: number;
    yearTo: number;
    autoplay: boolean;
}

interface Props {
    genre: string;
    preferredYearRange: {
        from: number;
        to: number;
    };
    genres: string[];
    onApplyFilters: (formData: FormData) => void;
    onSettingsToggle: () => void;
    isOpen: boolean;
    showDates: boolean;
    autoplay: boolean;
    settingsOpen: boolean;
    onAutoplayToggle: (autoPlayValue: boolean) => void;
}

const FiltersForm = ({
    genre,
    preferredYearRange,
    genres,
    onApplyFilters,
    onSettingsToggle,
    isOpen,
    showDates,
    autoplay,
    settingsOpen,
    onAutoplayToggle,
}: Props) => {
    const [isDirty, setIsDirty] = useState(false);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { dirtyFields },
        watch,
        setValue,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            genre: genre,
            yearFrom: preferredYearRange.from,
            yearTo: preferredYearRange.to,
            autoplay,
        },
    });

    useEffect(() => {
        if (genre === "All") {
            setValue("genre", "all");
        }
    }, [genre, setValue]);

    const watchYearFrom = watch("yearFrom");
    const watchYearTo = watch("yearTo");
    const watchGenre = watch("genre");
    const watchAutoplay = watch("autoplay");

    useEffect(() => {
        onAutoplayToggle(watchAutoplay);
    }, [watchAutoplay]);

    useEffect(() => {
        if (
            dirtyFields.genre! ||
            dirtyFields.yearFrom! ||
            dirtyFields.yearTo!
        ) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [dirtyFields, watchYearFrom, watchYearTo, watchGenre]);

    return (
        <Flex>
            <Collapse in={isOpen} animateOpacity>
                {settingsOpen && (
                    <Flex gap={4} mb={2}>
                        <ApplyFiltersButton
                            settingsOpen={settingsOpen}
                            filtersToApply={isDirty}
                            onClick={handleSubmit((formData) => {
                                if (settingsOpen && isDirty) {
                                    onApplyFilters(formData);
                                } else {
                                    onSettingsToggle();
                                }
                            })}
                        />
                        {isDirty && (
                            <Button
                                onClick={() => {
                                    onSettingsToggle();
                                    reset({
                                        genre,
                                        yearFrom: preferredYearRange.from,
                                        yearTo: preferredYearRange.to,
                                    });
                                }}
                                colorScheme="red"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        )}
                    </Flex>
                )}
                <form
                    onSubmit={handleSubmit((formData) =>
                        onApplyFilters(formData)
                    )}
                    style={{ height: "100%" }}
                >
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
                                <FormControl>
                                    <FormLabel fontSize="md" mb={0}>
                                        <Box>Genre</Box>
                                    </FormLabel>
                                    <Select
                                        boxShadow="md"
                                        _focusVisible={{
                                            boxShadow: "none",
                                        }}
                                        {...register("genre")}
                                        variant="outline"
                                    >
                                        <option value="all">All</option>
                                        {genres.sort().map((style) => (
                                            <option key={style} value={style}>
                                                {style}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Flex>
                            {showDates && (
                                <Flex
                                    alignItems="flex-start"
                                    gap={2}
                                    direction="column"
                                >
                                    <FormControl>
                                        <FormLabel fontSize="md" mb={0}>
                                            <Box>Year from</Box>
                                        </FormLabel>
                                        <Select
                                            {...register("yearFrom")}
                                            boxShadow="md"
                                            _focusVisible={{
                                                boxShadow: "none",
                                            }}
                                            variant="outline"
                                        >
                                            <option value={0}>All</option>
                                            {arrayRange(
                                                1950,
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
                                        </Select>
                                    </FormControl>
                                </Flex>
                            )}
                            {Number(watchYearFrom) !== 0 && showDates && (
                                <Flex
                                    alignItems="flex-start"
                                    gap={2}
                                    direction="column"
                                >
                                    <FormControl>
                                        <FormLabel fontSize="md" mb={0}>
                                            <Box>Year to</Box>
                                        </FormLabel>
                                        <Select
                                            {...register("yearTo")}
                                            boxShadow="md"
                                            _focusVisible={{
                                                boxShadow: "none",
                                            }}
                                            variant="outline"
                                        >
                                            {arrayRange(
                                                Number(watchYearFrom) + 1,
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
                                        </Select>
                                    </FormControl>
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
                                        {...register("autoplay")}
                                        colorScheme="teal"
                                        id="autoplay"
                                        size="md"
                                        rounded={6}
                                    />
                                </FormControl>
                            </Flex>
                        </Flex>
                        <Box position="absolute" top={3} right={[6, 2]}>
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
                </form>
            </Collapse>
        </Flex>
    );
};

export default FiltersForm;

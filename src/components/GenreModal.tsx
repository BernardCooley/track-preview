import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { TextInput } from "./TextInput";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import SearchTwoToneIcon from "@mui/icons-material/SearchTwoTone";

interface Props {
    showGenreSelector: boolean;
    setShowGenreSelector: React.Dispatch<React.SetStateAction<boolean>>;
    selectedGenres: string[];
    onApply: (genres: string[]) => void;
    availableGenres: string[];
    onFavouriteClearClick?: () => void;
    recentGenres?: string[];
    onCancel: () => void;
}

const GenreModal = ({
    showGenreSelector,
    setShowGenreSelector,
    selectedGenres,
    onApply,
    availableGenres,
    onFavouriteClearClick,
    recentGenres,
    onCancel,
}: Props) => {
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [localSelection, setLocalSelection] = useState<string[]>(selectedGenres);

    useEffect(() => {
        if (showGenreSelector) {
            setLocalSelection(selectedGenres);
        }
    }, [showGenreSelector]);

    useEffect(() => {
        if (isSearching) {
            searchRef.current?.focus();
        }
    }, [isSearching]);

    useEffect(() => {
        if (searchValue.length > 0 && filteredGenres.length > 0) {
            setGenres(filteredGenres);
        } else {
            setGenres(availableGenres);
        }
    }, [filteredGenres]);

    useEffect(() => {
        if (searchValue.length > 0) {
            const searchValueLower = searchValue.toLowerCase();
            setFilteredGenres(
                availableGenres.filter((gen) =>
                    gen.toLowerCase().includes(searchValueLower)
                )
            );
        }
    }, [searchValue]);

    const isSelected = (gen: string) => localSelection.includes(gen);
    const isAllSelected =
        localSelection.length === 0 ||
        localSelection.some((g) => g.toLowerCase() === "all");

    const toggleGenre = (gen: string) => {
        setLocalSelection((prev) => {
            const withoutAll = prev.filter((g) => g.toLowerCase() !== "all");
            if (prev.includes(gen)) {
                const next = withoutAll.filter((g) => g !== gen);
                return next.length === 0 ? ["all"] : next;
            }
            return [...withoutAll, gen];
        });
    };

    const selectAll = () => {
        setLocalSelection(["all"]);
    };

    const handleClose = () => {
        setShowGenreSelector(false);
        setSearchValue("");
        setIsSearching(false);
        setFilteredGenres([]);
    };

    const getFormattedGenres = (genres: string[]) => {
        const firstCharacters = Array.from(
            new Set(genres.map((gen) => gen.charAt(0)))
        );
        return firstCharacters
            .map((char) => ({
                letter: char,
                genres: genres.filter((g) => g.charAt(0) === char),
            }))
            .sort((a, b) => a.letter.localeCompare(b.letter));
    };

    const GenreTag = ({ gen, isActive }: { gen: string; isActive: boolean }) => (
        <Button
            variant={isActive ? "subtle" : "surface"}
            onClick={() => toggleGenre(gen)}
            height="32px"
            fontSize="xs"
            px={3}
        >
            {gen}
        </Button>
    );

    return (
        <Dialog.Root
            open={showGenreSelector}
            onOpenChange={(details) => { if (!details.open) handleClose(); }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    h="88vh"
                    rounded="modal"
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                >
                    <Flex
                        h="full"
                        w="full"
                        rounded="modal"
                        p={showGenreSelector ? [3, 4] : 0}
                        direction="column"
                        gap={3}
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            textAlign="center"
                            color="brand.textPrimary"
                        >
                            Select genres
                        </Text>

                        {isSearching ? (
                            <TextInput
                                ref={searchRef}
                                allowHelperText={false}
                                allowErrors={false}
                                title=""
                                size="md"
                                height="40px"
                                placeholder="Search genres"
                                fieldProps={{
                                    defaultValue: "",
                                    value: searchValue,
                                    onChange: (e) => setSearchValue(e.target.value),
                                }}
                                rightIcon={
                                    <IconButton
                                        position="absolute"
                                        right={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        variant="tertiary"
                                        onClick={() => {
                                            setSearchValue("");
                                            setIsSearching(false);
                                            setFilteredGenres([]);
                                        }}
                                        aria-label="Clear search"
                                        color="brand.textMuted"
                                        size="sm"
                                    >
                                        <CloseTwoToneIcon fontSize="small" />
                                    </IconButton>
                                }
                            />
                        ) : (
                            <Flex justifyContent="flex-start">
                                <IconButton
                                    variant="tertiary"
                                    onClick={() => setIsSearching(true)}
                                    aria-label="Search genres"
                                    color="brand.textSecondary"
                                    size="sm"
                                >
                                    <SearchTwoToneIcon fontSize="small" />
                                </IconButton>
                            </Flex>
                        )}

                        {!isSearching && recentGenres && recentGenres.length > 0 && (
                            <Box
                                border="1px solid"
                                borderColor="brand.border"
                                rounded="lg"
                                p={3}
                            >
                                <Flex justifyContent="space-between" mb={2}>
                                    <Text fontSize="sm" color="brand.textMuted">
                                        Recent
                                    </Text>
                                    {recentGenres.length > 1 && (
                                        <Button
                                            onClick={() => {
                                                setLocalSelection(["all"]);
                                                onFavouriteClearClick?.();
                                            }}
                                            variant="ghost"
                                            color="brand.primary"
                                            height="auto"
                                            px={1}
                                            fontSize="xs"
                                            shadow="none"
                                        >
                                            clear
                                        </Button>
                                    )}
                                </Flex>
                                <Flex flexWrap="wrap" gap={1.5}>
                                    {recentGenres.map((gen) => (
                                        <GenreTag
                                            key={gen}
                                            gen={gen}
                                            isActive={isSelected(gen)}
                                        />
                                    ))}
                                </Flex>
                            </Box>
                        )}

                        <Box
                            flex={1}
                            overflow="auto"
                            border="1px solid"
                            borderColor="brand.border"
                            rounded="lg"
                            p={3}
                            mb="60px"
                            css={{
                                "&::-webkit-scrollbar": {
                                    width: "4px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "rgba(255,255,255,0.1)",
                                    borderRadius: "4px",
                                },
                            }}
                        >
                            {!isSearching && (
                                <Box mb={3}>
                                    <Button
                                        variant={isAllSelected ? "subtle" : "surface"}
                                        onClick={selectAll}
                                        height="32px"
                                        fontSize="xs"
                                        px={3}
                                    >
                                        All genres
                                    </Button>
                                </Box>
                            )}
                            <Flex gap={4} direction="column">
                                {getFormattedGenres(genres).map((genreSection) => (
                                    <Box key={genreSection.letter}>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="brand.textMuted"
                                            mb={2}
                                            textTransform="uppercase"
                                        >
                                            {genreSection.letter}
                                        </Text>
                                        <Flex flexWrap="wrap" gap={1.5}>
                                            {genreSection.genres.map((gen) => (
                                                <GenreTag
                                                    key={gen}
                                                    gen={gen}
                                                    isActive={isSelected(gen)}
                                                />
                                            ))}
                                        </Flex>
                                    </Box>
                                ))}
                            </Flex>
                        </Box>

                        <Flex
                            position="absolute"
                            bottom={[3, 4]}
                            left={[3, 4]}
                            right={[3, 4]}
                            gap={3}
                        >
                            <Button
                                flex="0 0 auto"
                                onClick={onCancel}
                                variant="cancel"
                                height="44px"
                                px={5}
                            >
                                Cancel
                            </Button>
                            <Button
                                flex={1}
                                onClick={() => {
                                    onApply(localSelection);
                                    setSearchValue("");
                                    setIsSearching(false);
                                    setFilteredGenres([]);
                                }}
                                variant="primary"
                                height="44px"
                            >
                                Apply
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default GenreModal;

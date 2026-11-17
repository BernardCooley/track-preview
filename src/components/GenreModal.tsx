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
    const [localSelection, setLocalSelection] = useState<string[]>(selectedGenres);

    const isSearchActive = searchValue.length > 0;

    useEffect(() => {
        if (showGenreSelector) {
            setLocalSelection(selectedGenres);
        }
    }, [showGenreSelector]);

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

    const GenreTag = ({ gen, isActive, onClick }: { gen: string; isActive: boolean; onClick?: () => void }) => (
        <Box
            as="button"
            onClick={onClick ?? (() => toggleGenre(gen))}
            px={3}
            py={1.5}
            fontSize="xs"
            fontWeight={isActive ? "medium" : "normal"}
            rounded="md"
            cursor="pointer"
            position="relative"
            transition="all 0.15s ease"
            color={isActive ? "brand.primary" : "brand.textPrimary"}
            borderLeft={isActive ? "2px solid" : "2px solid transparent"}
            borderLeftColor={isActive ? "brand.primary" : "transparent"}
            css={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: isActive
                    ? "color-mix(in srgb, var(--chakra-colors-brand-primary) 10%, transparent)"
                    : "var(--chakra-colors-brand-surface)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                "&:hover": {
                    background: isActive
                        ? "color-mix(in srgb, var(--chakra-colors-brand-primary) 15%, transparent)"
                        : "var(--chakra-colors-brand-surface-hover)",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                },
            }}
        >
            {gen}
        </Box>
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
                    overflow="hidden"
                >
                    <Flex
                        h="full"
                        w="full"
                        direction="column"
                    >
                        <Flex
                            px={[4, 5]}
                            pt={[4, 5]}
                            pb={3}
                            direction="column"
                            gap={3}
                            flexShrink={0}
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                letterSpacing="-0.01em"
                            >
                                Genres
                            </Text>

                            <Box position="relative">
                                <TextInput
                                    ref={searchRef}
                                    allowHelperText={false}
                                    allowErrors={false}
                                    title=""
                                    size="md"
                                    height="38px"
                                    placeholder="Search genres..."
                                    fieldProps={{
                                        defaultValue: "",
                                        value: searchValue,
                                        onChange: (e) => setSearchValue(e.target.value),
                                    }}
                                    rightIcon={
                                        searchValue ? (
                                            <IconButton
                                                position="absolute"
                                                right={2}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                variant="tertiary"
                                                onClick={() => {
                                                    setSearchValue("");
                                                    setFilteredGenres([]);
                                                }}
                                                aria-label="Clear search"
                                                color="brand.textMuted"
                                                size="sm"
                                            >
                                                <CloseTwoToneIcon fontSize="small" />
                                            </IconButton>
                                        ) : (
                                            <Box
                                                position="absolute"
                                                right={3}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                color="brand.textMuted"
                                                display="flex"
                                                pointerEvents="none"
                                            >
                                                <SearchTwoToneIcon fontSize="small" />
                                            </Box>
                                        )
                                    }
                                />
                            </Box>
                        </Flex>

                        <Box
                            h="1px"
                            bg="brand.divider"
                            mx={[4, 5]}
                            flexShrink={0}
                        />

                        <Box
                            flex={1}
                            overflow="auto"
                            px={[4, 5]}
                            pt={3}
                            pb="80px"
                            css={{
                                "&::-webkit-scrollbar": {
                                    width: "3px",
                                },
                                "&::-webkit-scrollbar-track": {
                                    background: "transparent",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    background: "var(--chakra-colors-brand-scrollbar-thumb)",
                                    borderRadius: "3px",
                                },
                            }}
                        >
                            {!isSearchActive && recentGenres && recentGenres.length > 0 && (
                                <Box mb={4}>
                                    <Flex justifyContent="space-between" alignItems="center" mb={2}>
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color="brand.textMuted"
                                            textTransform="uppercase"
                                            letterSpacing="0.05em"
                                        >
                                            Recent
                                        </Text>
                                        {recentGenres.length > 1 && (() => {
                                            const hasRecentSelected = recentGenres.some((g) => isSelected(g));
                                            return (
                                                <Button
                                                    onClick={() => {
                                                        setLocalSelection(["all"]);
                                                        onFavouriteClearClick?.();
                                                    }}
                                                    variant="ghost"
                                                    color={hasRecentSelected ? "brand.primary" : "brand.textMuted"}
                                                    fontWeight={hasRecentSelected ? "medium" : "normal"}
                                                    height="auto"
                                                    px={1}
                                                    fontSize="xs"
                                                    shadow="none"
                                                    _hover={{ color: hasRecentSelected ? "brand.primaryHover" : "brand.primary" }}
                                                >
                                                    Clear
                                                </Button>
                                            );
                                        })()}
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

                            {!isSearchActive && (
                                <Box mb={4}>
                                    <GenreTag gen="All genres" isActive={isAllSelected} onClick={selectAll} />
                                </Box>
                            )}

                            <Flex gap={4} direction="column">
                                {getFormattedGenres(genres).map((genreSection) => (
                                    <Box key={genreSection.letter}>
                                        <Text
                                            fontSize="11px"
                                            fontWeight="semibold"
                                            color="brand.textMuted"
                                            mb={2}
                                            textTransform="uppercase"
                                            letterSpacing="0.08em"
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
                            bottom={0}
                            left={0}
                            right={0}
                            gap={3}
                            px={[4, 5]}
                            py={4}
                            css={{
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                borderTop: "1px solid var(--chakra-colors-brand-divider)",
                            }}
                        >
                            <Button
                                flex="0 0 auto"
                                onClick={onCancel}
                                variant="cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                flex={1}
                                onClick={() => {
                                    onApply(localSelection);
                                    setSearchValue("");
                                    setFilteredGenres([]);
                                }}
                                variant="primary"
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

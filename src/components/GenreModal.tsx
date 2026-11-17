import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    Tag,
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
            .map((char) => {
                return {
                    letter: char,
                    genres: genres.filter((g) => g.charAt(0) === char),
                };
            })
            .sort((a, b) => a.letter.localeCompare(b.letter));
    };

    return (
        <Dialog.Root
            open={showGenreSelector}
            onOpenChange={(details) => { if (!details.open) handleClose(); }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    h="88vh"
                    rounded={20}
                    m={6}
                    bg="brand.backgroundPrimary"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.primary"
                >
                    <Flex
                        h="full"
                        w="full"
                        bg="brand.backgroundPrimary"
                        rounded={20}
                        p={showGenreSelector ? 4 : 0}
                        direction="column"
                        gap={4}
                        alignItems="flex-end"
                    >
                        <Flex
                            h="full"
                            width="full"
                            direction="column"
                            gap={4}
                            alignItems="flex-end"
                        >
                            <Text fontSize="xl" textAlign="center" w="full">
                                Select genres
                            </Text>
                            {isSearching ? (
                                <TextInput
                                    ref={searchRef}
                                    allowHelperText={false}
                                    allowErrors={false}
                                    title=""
                                    size="lg"
                                    placeholder="Search genres"
                                    fieldProps={{
                                        defaultValue: "",
                                        value: searchValue,
                                        onChange: (e) =>
                                            setSearchValue(e.target.value),
                                    }}
                                    rightIcon={
                                        <IconButton
                                            pr={4}
                                            position="absolute"
                                            right={6}
                                            top={9}
                                            height="30px"
                                            fontSize="3xl"
                                            h={1 / 2}
                                            color="brand.primary"
                                            bg="transparent"
                                            shadow="none"
                                            onClick={() => {
                                                setSearchValue("");
                                                setIsSearching(false);
                                                setFilteredGenres([]);
                                            }}
                                            left={1}
                                            rounded="full"
                                            variant="ghost"
                                            aria-label="settings page"
                                            _hover={{
                                                bg: "transparent",
                                                transform: "scale(1.2)",
                                            }}
                                        >
                                            <CloseTwoToneIcon fontSize="inherit" />
                                        </IconButton>
                                    }
                                />
                            ) : (
                                <Flex justifyContent="flex-start" w="full">
                                    <IconButton
                                        color="brand.primary"
                                        fontSize="2xl"
                                        bg="transparent"
                                        shadow="none"
                                        onClick={() => setIsSearching(true)}
                                        left={1}
                                        position="relative"
                                        rounded="full"
                                        variant="ghost"
                                        aria-label="settings page"
                                        _hover={{
                                            bg: "transparent",
                                            transform: "scale(1.2)",
                                        }}
                                        _focusVisible={{
                                            outline: "none",
                                        }}
                                    >
                                        <SearchTwoToneIcon fontSize="inherit" />
                                    </IconButton>
                                </Flex>
                            )}
                            {!isSearching &&
                                recentGenres &&
                                recentGenres.length > 0 && (
                                    <Flex
                                        w="full"
                                        direction="column"
                                        border="1px solid"
                                        borderColor="brand.backgroundTertiary"
                                        rounded={6}
                                        p={2}
                                        gap={3}
                                        position="relative"
                                    >
                                        <Flex justifyContent="space-between">
                                            <Text>Recent</Text>
                                            {recentGenres.length > 1 && (
                                                <Button
                                                    onClick={() => {
                                                        setLocalSelection(["all"]);
                                                        onFavouriteClearClick?.();
                                                    }}
                                                    variant="plain"
                                                    shadow="none"
                                                    color="brand.primary"
                                                    p={0}
                                                    pr={2}
                                                    h="auto"
                                                    _hover={{
                                                        bg: "transparent",
                                                        transform: "scale(1.2)",
                                                    }}
                                                >
                                                    clear
                                                </Button>
                                            )}
                                        </Flex>
                                        <Flex flexWrap="wrap" gap={2}>
                                            {recentGenres.map((gen) => (
                                                <Tag.Root
                                                    width="auto"
                                                    userSelect="none"
                                                    padding={2}
                                                    onClick={() => toggleGenre(gen)}
                                                    bg={
                                                        isSelected(gen)
                                                            ? "brand.primaryOpaque"
                                                            : "transparent"
                                                    }
                                                    borderColor={
                                                        isSelected(gen)
                                                            ? "brand.primaryLight"
                                                            : "brand.primaryOpaque"
                                                    }
                                                    _hover={
                                                        isMobile
                                                            ? {}
                                                            : {
                                                                  cursor: "pointer",
                                                                  bg: isSelected(gen)
                                                                      ? "transparent"
                                                                      : "brand.primaryOpaque",
                                                                  borderColor: isSelected(gen)
                                                                      ? "brand.primaryOpaque"
                                                                      : "brand.primaryLight",
                                                              }
                                                    }
                                                    border="1px solid"
                                                    color="white"
                                                    fontSize="12px"
                                                    fontWeight="normal"
                                                    rounded="full"
                                                    textAlign="center"
                                                    whiteSpace="nowrap"
                                                    key={gen}
                                                    size="sm"
                                                >
                                                    <Tag.Label>{gen}</Tag.Label>
                                                </Tag.Root>
                                            ))}
                                        </Flex>
                                    </Flex>
                                )}

                            <Flex
                                w="full"
                                flexWrap="wrap"
                                overflow="scroll"
                                gap={4}
                                border="1px solid"
                                borderColor="brand.backgroundTertiary"
                                rounded={6}
                                p={2}
                                mb="56px"
                            >
                                {!isSearching && (
                                    <Tag.Root
                                        width="auto"
                                        onClick={selectAll}
                                        bg={
                                            isAllSelected
                                                ? "brand.primaryOpaque"
                                                : "transparent"
                                        }
                                        borderColor={
                                            isAllSelected
                                                ? "brand.primaryLight"
                                                : "brand.primaryOpaque"
                                        }
                                        _hover={
                                            isMobile
                                                ? {}
                                                : {
                                                      cursor: "pointer",
                                                      bg: isAllSelected
                                                          ? "transparent"
                                                          : "brand.primaryOpaque",
                                                      borderColor: isAllSelected
                                                          ? "brand.primaryOpaque"
                                                          : "brand.primaryLight",
                                                  }
                                        }
                                        border="1px solid"
                                        color="white"
                                        fontSize="14px"
                                        fontWeight="normal"
                                        rounded="full"
                                        userSelect="none"
                                        textAlign="center"
                                        whiteSpace="nowrap"
                                        size="sm"
                                        m={1}
                                    >
                                        <Tag.Label>All genres</Tag.Label>
                                    </Tag.Root>
                                )}
                                <Flex gap={4} direction="column">
                                    {getFormattedGenres(genres).map(
                                        (genreSection) => (
                                            <Box key={genreSection.letter}>
                                                <Box>{genreSection.letter}</Box>
                                                <Box>
                                                    {genreSection.genres.map(
                                                        (gen) => (
                                                            <Tag.Root
                                                                width="auto"
                                                                onClick={() => toggleGenre(gen)}
                                                                bg={
                                                                    isSelected(gen)
                                                                        ? "brand.primaryOpaque"
                                                                        : "transparent"
                                                                }
                                                                borderColor={
                                                                    isSelected(gen)
                                                                        ? "brand.primaryLight"
                                                                        : "brand.primaryOpaque"
                                                                }
                                                                _hover={
                                                                    isMobile
                                                                        ? {}
                                                                        : {
                                                                              cursor: "pointer",
                                                                              bg: isSelected(gen)
                                                                                  ? "transparent"
                                                                                  : "brand.primaryOpaque",
                                                                              borderColor: isSelected(gen)
                                                                                  ? "brand.primaryOpaque"
                                                                                  : "brand.primaryLight",
                                                                          }
                                                                }
                                                                border="1px solid"
                                                                color="white"
                                                                fontSize="14px"
                                                                fontWeight="normal"
                                                                rounded="full"
                                                                userSelect="none"
                                                                textAlign="center"
                                                                whiteSpace="nowrap"
                                                                key={gen}
                                                                size="sm"
                                                                m={1}
                                                            >
                                                                <Tag.Label>{gen}</Tag.Label>
                                                            </Tag.Root>
                                                        )
                                                    )}
                                                </Box>
                                            </Box>
                                        )
                                    )}
                                </Flex>
                            </Flex>
                            <Flex
                                position="absolute"
                                bottom="16px"
                                gap={3}
                                w="calc(100% - 32px)"
                            >
                                <Button
                                    p={4}
                                    w="100px"
                                    onClick={onCancel}
                                    variant="cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    p={4}
                                    flex={1}
                                    onClick={() => {
                                        onApply(localSelection);
                                        setSearchValue("");
                                        setIsSearching(false);
                                        setFilteredGenres([]);
                                    }}
                                    variant="solid"
                                    bg="brand.primary"
                                    color="brand.backgroundPrimary"
                                    _hover={{
                                        bg: "brand.primaryLight",
                                    }}
                                >
                                    Apply
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default GenreModal;

import {
    Button,
    Flex,
    IconButton,
    Modal,
    ModalContent,
    ModalOverlay,
    Tag,
    Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { TextInput } from "./TextInput";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import SearchTwoToneIcon from "@mui/icons-material/SearchTwoTone";

interface Props {
    showGenreSelector: boolean;
    setShowGenreSelector: React.Dispatch<React.SetStateAction<boolean>>;
    genre: string;
    onGenreSelect: (genre: string) => void;
    availableGenres: string[];
    onFavouriteClearClick?: () => void;
    recentGenres?: string[];
    onCancel: () => void;
}

const GenreModal = ({
    showGenreSelector,
    setShowGenreSelector,
    genre,
    onGenreSelect,
    availableGenres,
    onFavouriteClearClick,
    recentGenres,
    onCancel,
}: Props) => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [filteredGenres, setFilteredGenres] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

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

    return (
        <Modal
            isOpen={showGenreSelector}
            onClose={() => {
                setShowGenreSelector(false);
                setSearchValue("");
                setIsSearching(false);
                setFilteredGenres([]);
            }}
        >
            <ModalOverlay />
            <ModalContent rounded="3xl" mx={4}>
                <Flex
                    h="full"
                    w="full"
                    bg="brand.backgroundSecondary"
                    rounded="3xl"
                    p={showGenreSelector ? 4 : 0}
                    direction="column"
                    gap={8}
                    alignItems="flex-end"
                >
                    <Flex width="full" direction="column" gap={4}>
                        <Text fontSize="xl" textAlign="center">
                            Select genre
                        </Text>
                        {!isSearching &&
                            recentGenres &&
                            recentGenres.length > 0 && (
                                <Flex
                                    direction="column"
                                    border="1px solid"
                                    borderColor="brand.backgroundTertiary"
                                    p={2}
                                    gap={3}
                                    position="relative"
                                >
                                    <Flex justifyContent="space-between">
                                        <Text>Recent</Text>
                                        {recentGenres.length > 1 && (
                                            <Button
                                                onClick={onFavouriteClearClick}
                                                variant="unstyled"
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
                                    <Flex flexWrap="wrap" gap={4}>
                                        {recentGenres.map((gen) => (
                                            <Tag
                                                userSelect="none"
                                                padding={2}
                                                onClick={() =>
                                                    onGenreSelect(gen)
                                                }
                                                bg={
                                                    genre === gen
                                                        ? "brand.primaryOpaque"
                                                        : "transparent"
                                                }
                                                borderColor={
                                                    genre === gen
                                                        ? "brand.primaryLight"
                                                        : "brand.primaryOpaque"
                                                }
                                                _hover={
                                                    isMobile
                                                        ? {}
                                                        : {
                                                              cursor: "pointer",
                                                              bg:
                                                                  genre === gen
                                                                      ? "transparent"
                                                                      : "brand.primaryOpaque",
                                                              borderColor:
                                                                  genre === gen
                                                                      ? "brand.primaryOpaque"
                                                                      : "brand.primaryLight",
                                                          }
                                                }
                                                variant="filter"
                                                key={genre}
                                                size="xs"
                                                fontSize="12px"
                                            >
                                                {gen}
                                            </Tag>
                                        ))}
                                    </Flex>
                                </Flex>
                            )}
                        {isSearching ? (
                            <TextInput
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
                                        icon={
                                            <CloseTwoToneIcon fontSize="inherit" />
                                        }
                                        _hover={{
                                            bg: "transparent",
                                            transform: "scale(1.2)",
                                        }}
                                    />
                                }
                            />
                        ) : (
                            <Flex justifyContent="flex-start">
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
                                    icon={
                                        <SearchTwoToneIcon fontSize="inherit" />
                                    }
                                    _hover={{
                                        bg: "transparent",
                                        transform: "scale(1.2)",
                                    }}
                                    _focusVisible={{
                                        outline: "none",
                                    }}
                                />
                            </Flex>
                        )}
                        <Flex
                            flexWrap="wrap"
                            maxH="300px"
                            overflow="scroll"
                            gap={4}
                        >
                            {genres.sort().map((gen) => (
                                <Tag
                                    onClick={() => {
                                        onGenreSelect(gen);
                                        setSearchValue("");
                                        setIsSearching(false);
                                        setFilteredGenres([]);
                                    }}
                                    bg={
                                        genre === gen
                                            ? "brand.primaryOpaque"
                                            : "transparent"
                                    }
                                    borderColor={
                                        genre === gen
                                            ? "brand.primaryLight"
                                            : "brand.primaryOpaque"
                                    }
                                    _hover={
                                        isMobile
                                            ? {}
                                            : {
                                                  cursor: "pointer",
                                                  bg:
                                                      genre === gen
                                                          ? "transparent"
                                                          : "brand.primaryOpaque",
                                                  borderColor:
                                                      genre === gen
                                                          ? "brand.primaryOpaque"
                                                          : "brand.primaryLight",
                                              }
                                    }
                                    variant="filter"
                                    key={genre}
                                    size="xs"
                                    fontSize="14px"
                                >
                                    {gen}
                                </Tag>
                            ))}
                        </Flex>
                    </Flex>
                    <Button w="100px" onClick={onCancel} variant="cancel">
                        Cancel
                    </Button>
                </Flex>
            </ModalContent>
        </Modal>
    );
};

export default GenreModal;

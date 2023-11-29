import { Divider, Flex, IconButton, Tag, Text } from "@chakra-ui/react";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { isMobile } from "react-device-detect";

interface Props {
    genres: string[];
    selectedGenre: string;
    onGenreSelect: (genre: string) => void;
    recentGenres?: string[];
    onFavouriteClearClick?: () => void;
}

const GenreSelector = ({
    genres,
    selectedGenre,
    onGenreSelect,
    recentGenres,
    onFavouriteClearClick,
}: Props) => {
    return (
        <Flex width="full" direction="column" gap={4}>
            <Text fontSize="xl" textAlign="center">
                Select Genre
            </Text>
            {recentGenres && recentGenres.length > 0 && (
                <Flex
                    direction="column"
                    border="1px solid"
                    borderColor="brand.backgroundTertiary"
                    p={2}
                    gap={3}
                    position="relative"
                >
                    <IconButton
                        onClick={onFavouriteClearClick}
                        top={1}
                        right={1}
                        position="absolute"
                        rounded="full"
                        variant="ghost"
                        aria-label="settings page"
                        fontSize="xl"
                        icon={<DeleteOutlineIcon fontSize="inherit" />}
                        color="brand.textPrimary"
                        _hover={{
                            color: "brand.backgroundPrimary",
                            bg: "brand.textPrimary",
                        }}
                    />
                    <Text>Recent</Text>
                    <Flex flexWrap="wrap" gap={4}>
                        {recentGenres.map((genre) => (
                            <Tag
                                padding={2}
                                onClick={() => onGenreSelect(genre)}
                                bg={
                                    selectedGenre === genre
                                        ? "brand.primaryOpaque"
                                        : "transparent"
                                }
                                borderColor={
                                    selectedGenre === genre
                                        ? "brand.primaryLight"
                                        : "brand.primaryOpaque"
                                }
                                _hover={
                                    isMobile
                                        ? {}
                                        : {
                                              cursor: "pointer",
                                              bg:
                                                  selectedGenre === genre
                                                      ? "transparent"
                                                      : "brand.primaryOpaque",
                                              borderColor:
                                                  selectedGenre === genre
                                                      ? "brand.primaryOpaque"
                                                      : "brand.primaryLight",
                                          }
                                }
                                variant="filter"
                                key={genre}
                                size="xs"
                                fontSize="12px"
                            >
                                {genre}
                            </Tag>
                        ))}
                    </Flex>
                </Flex>
            )}
            <Divider orientation="horizontal" />
            <Flex flexWrap="wrap" h="300px" overflow="scroll" gap={4}>
                {genres.sort().map((genre, index) => (
                    <Tag
                        onClick={() => onGenreSelect(genre)}
                        bg={
                            selectedGenre === genre
                                ? "brand.primaryOpaque"
                                : "transparent"
                        }
                        borderColor={
                            selectedGenre === genre
                                ? "brand.primaryLight"
                                : "brand.primaryOpaque"
                        }
                        _hover={
                            isMobile
                                ? {}
                                : {
                                      cursor: "pointer",
                                      bg:
                                          selectedGenre === genre
                                              ? "transparent"
                                              : "brand.primaryOpaque",
                                      borderColor:
                                          selectedGenre === genre
                                              ? "brand.primaryOpaque"
                                              : "brand.primaryLight",
                                  }
                        }
                        variant="filter"
                        key={genre}
                        size="xs"
                        fontSize="14px"
                    >
                        {genre}
                    </Tag>
                ))}
            </Flex>
        </Flex>
    );
};

export default GenreSelector;

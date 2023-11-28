import { Button, Divider, Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Props {
    genres: string[];
    selectedGenre: string;
    onGenreSelect: (genre: string) => void;
    favouriteGenres?: string[];
    onFavouriteClearClick?: () => void;
}

const GenreSelector = ({
    genres,
    selectedGenre,
    onGenreSelect,
    favouriteGenres,
    onFavouriteClearClick,
}: Props) => {
    return (
        <Flex width="full" direction="column" gap={4}>
            <Text fontSize="xl" textAlign="center">
                Select Genre
            </Text>
            {favouriteGenres && favouriteGenres.length > 0 && (
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
                    <Text>Favourites</Text>
                    <Flex flexWrap="wrap" gap={4}>
                        {favouriteGenres.map((genre) => (
                            <Button
                                onClick={() => onGenreSelect(genre)}
                                isActive={selectedGenre === genre}
                                variant="filter"
                                key={genre}
                                size="xs"
                                fontSize="14px"
                            >
                                {genre}
                            </Button>
                        ))}
                    </Flex>
                </Flex>
            )}
            <Divider orientation="horizontal" />
            <Flex flexWrap="wrap" h="300px" overflow="scroll" gap={4}>
                {genres.sort().map((genre, index) => (
                    <Button
                        onClick={() => onGenreSelect(genre)}
                        isActive={selectedGenre === genre}
                        variant="filter"
                        key={genre}
                    >
                        {genre}
                    </Button>
                ))}
            </Flex>
        </Flex>
    );
};

export default GenreSelector;

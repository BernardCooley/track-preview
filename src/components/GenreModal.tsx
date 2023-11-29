import {
    Divider,
    Flex,
    IconButton,
    Modal,
    ModalContent,
    ModalOverlay,
    Tag,
    Text,
} from "@chakra-ui/react";
import React from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { isMobile } from "react-device-detect";

interface Props {
    showGenreSelector: boolean;
    setShowGenreSelector: React.Dispatch<React.SetStateAction<boolean>>;
    genre: string;
    onGenreSelect: (genre: string) => void;
    availableGenres: string[];
    onFavouriteClearClick?: () => void;
    recentGenres?: string[];
}

const GenreModal = ({
    showGenreSelector,
    setShowGenreSelector,
    genre,
    onGenreSelect,
    availableGenres,
    onFavouriteClearClick,
    recentGenres,
}: Props) => {
    return (
        <Modal
            isCentered={true}
            isOpen={showGenreSelector}
            onClose={() => setShowGenreSelector(false)}
        >
            <ModalOverlay />
            <ModalContent rounded="3xl" mx={4}>
                <Flex
                    h="full"
                    w="full"
                    bg="brand.backgroundSecondary"
                    rounded="3xl"
                    p={showGenreSelector ? 4 : 0}
                >
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
                                    icon={
                                        <DeleteOutlineIcon fontSize="inherit" />
                                    }
                                    color="brand.textPrimary"
                                    _hover={{
                                        color: "brand.backgroundPrimary",
                                        bg: "brand.textPrimary",
                                    }}
                                />
                                <Text>Recent</Text>
                                <Flex flexWrap="wrap" gap={4}>
                                    {recentGenres.map((gen) => (
                                        <Tag
                                            padding={2}
                                            onClick={() => onGenreSelect(gen)}
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
                        <Divider orientation="horizontal" />
                        <Flex
                            flexWrap="wrap"
                            h="300px"
                            overflow="scroll"
                            gap={4}
                        >
                            {availableGenres.sort().map((gen) => (
                                <Tag
                                    onClick={() => onGenreSelect(gen)}
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
                </Flex>
            </ModalContent>
        </Modal>
    );
};

export default GenreModal;

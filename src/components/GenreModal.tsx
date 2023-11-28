import {
    Collapse,
    Flex,
    Modal,
    ModalContent,
    ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import GenreSelector from "./GenreSelector";

interface Props {
    showGenreSelect: boolean;
    setShowGenreSelect: React.Dispatch<React.SetStateAction<boolean>>;
    genre: string;
    onGenreSelect: (genre: string) => void;
    availableGenres: string[];
    onFavouriteClearClick?: () => void;
    favouriteGenres?: string[];
}

const GenreModal = ({
    showGenreSelect,
    setShowGenreSelect,
    genre,
    onGenreSelect,
    availableGenres,
    onFavouriteClearClick,
    favouriteGenres,
}: Props) => {
    return (
        <Modal
            isCentered={true}
            isOpen={showGenreSelect}
            onClose={() => setShowGenreSelect(false)}
        >
            <ModalOverlay />
            <ModalContent rounded="3xl" mx={4}>
                <Flex
                    h="full"
                    w="full"
                    bg="brand.backgroundSecondary"
                    rounded="3xl"
                    p={showGenreSelect ? 4 : 0}
                >
                    <Collapse in={showGenreSelect} animateOpacity>
                        <GenreSelector
                            onFavouriteClearClick={onFavouriteClearClick}
                            favouriteGenres={favouriteGenres}
                            genres={availableGenres}
                            selectedGenre={genre}
                            onGenreSelect={(gen) => onGenreSelect(gen)}
                        />
                    </Collapse>
                </Flex>
            </ModalContent>
        </Modal>
    );
};

export default GenreModal;

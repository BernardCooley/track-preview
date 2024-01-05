import {
    Button,
    Grid,
    GridItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import BuyLink from "./BuyLink";
import { IBuyLink, ReviewTracks } from "../../types";

interface Props {
    buyModalIsOpen: boolean;
    closeBuyModal: () => void;
    buyLinks: IBuyLink[];
    reviewTracks: ReviewTracks;
    trackToBuy: number | null;
}

const BuyModal = ({
    buyModalIsOpen,
    closeBuyModal,
    buyLinks,
    reviewTracks,
    trackToBuy,
}: Props) => {
    return (
        <Modal
            isCentered
            blockScrollOnMount={false}
            isOpen={buyModalIsOpen}
            onClose={closeBuyModal}
            closeOnEsc={true}
        >
            <ModalOverlay />
            <ModalContent
                minH="352px"
                m={6}
                bg="brand.backgroundPrimary"
                shadow="2xl"
                border="1px solid"
                borderColor="brand.primary"
            >
                <ModalHeader>Buy</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                        {buyLinks.map((buyLink) => (
                            <GridItem
                                transition={"all .1s ease-in-out"}
                                _hover={{
                                    transform: "scale(1.2)",
                                }}
                                key={buyLink.platform}
                                w="100%"
                            >
                                <BuyLink
                                    track={reviewTracks[4][trackToBuy!]}
                                    buyLink={buyLink}
                                />
                            </GridItem>
                        ))}
                    </Grid>
                </ModalBody>

                <ModalFooter>
                    <Button variant="primary" mr={3} onClick={closeBuyModal}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BuyModal;

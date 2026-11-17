import {
    Button,
    Grid,
    GridItem,
    Dialog,
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
        <Dialog.Root
            placement="center"
            open={buyModalIsOpen}
            onOpenChange={(details) => { if (!details.open) closeBuyModal(); }}
            closeOnEscape
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    minH="352px"
                    m={6}
                    bg="brand.backgroundPrimary"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.primary"
                >
                    <Dialog.Header>Buy</Dialog.Header>
                    <Dialog.CloseTrigger />
                    <Dialog.Body>
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
                                        track={reviewTracks[4].tracks[trackToBuy!]}
                                        buyLink={buyLink}
                                    />
                                </GridItem>
                            ))}
                        </Grid>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <Button variant="primary" mr={3} onClick={closeBuyModal}>
                            Close
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default BuyModal;

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
                    minH="300px"
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="modal"
                >
                    <Dialog.Header
                        color="brand.textPrimary"
                        fontWeight="semibold"
                        borderBottom="1px solid"
                        borderBottomColor="brand.divider"
                    >
                        Buy
                    </Dialog.Header>
                    <Dialog.CloseTrigger
                        color="brand.textMuted"
                        _hover={{ color: "brand.textPrimary" }}
                    />
                    <Dialog.Body py={6}>
                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            {buyLinks.map((buyLink) => (
                                <GridItem
                                    transition="transform 0.15s ease"
                                    _hover={{
                                        transform: "scale(1.05)",
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

                    <Dialog.Footer borderTop="1px solid" borderTopColor="brand.divider">
                        <Button variant="outline" onClick={closeBuyModal}>
                            Close
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default BuyModal;

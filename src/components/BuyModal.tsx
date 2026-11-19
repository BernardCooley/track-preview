import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Dialog,
    Text,
} from "@chakra-ui/react";
import React, { useMemo } from "react";
import BuyLink from "./BuyLink";
import { IBuyLink, ReviewTracks, Track } from "../../types";
import { getRelevantBuyLinks } from "../../utils";

interface Props {
    buyModalIsOpen: boolean;
    closeBuyModal: () => void;
    buyLinks: IBuyLink[];
    reviewTracks: ReviewTracks;
    trackToBuy: number | null;
    releaseTrack?: Track | null;
}

const BuyModal = ({
    buyModalIsOpen,
    closeBuyModal,
    buyLinks,
    reviewTracks,
    trackToBuy,
    releaseTrack,
}: Props) => {
    const track = releaseTrack || (trackToBuy !== null ? reviewTracks[4].tracks[trackToBuy] : null);
    const isReleaseBuy = !!releaseTrack;
    const searchTitle = isReleaseBuy ? releaseTrack!.releaseTitle : undefined;

    const filteredLinks = useMemo(
        () => (track ? getRelevantBuyLinks(buyLinks, track.genre) : buyLinks),
        [buyLinks, track]
    );

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
                    minH="auto"
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="modal"
                    overflow="hidden"
                >
                    <Flex direction="column" h="full">
                        <Flex
                            px={[4, 5]}
                            pt={[4, 5]}
                            pb={3}
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                                letterSpacing="-0.01em"
                            >
                                {isReleaseBuy ? "Buy Release" : "Buy"}
                            </Text>
                            <Dialog.CloseTrigger
                                position="relative"
                                top="auto"
                                right="auto"
                                color="brand.textMuted"
                                _hover={{ color: "brand.textPrimary" }}
                            />
                        </Flex>

                        <Box
                            h="1px"
                            bg="brand.divider"
                            mx={[4, 5]}
                        />

                        {isReleaseBuy && track && (
                            <Flex px={[4, 5]} pt={4} gap={2} direction="column">
                                <Flex gap={2} alignItems="baseline">
                                    <Text fontSize="xs" color="brand.textMuted">
                                        Artist:
                                    </Text>
                                    <Text fontSize="sm" color="brand.textPrimary">
                                        {track.artist}
                                    </Text>
                                </Flex>
                                <Flex gap={2} alignItems="baseline">
                                    <Text fontSize="xs" color="brand.textMuted">
                                        Release:
                                    </Text>
                                    <Text fontSize="sm" color="brand.textPrimary">
                                        {track.releaseTitle}
                                    </Text>
                                </Flex>
                            </Flex>
                        )}

                        <Box px={[4, 5]} py={5}>
                            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                {filteredLinks.map((buyLink) => (
                                    <GridItem
                                        key={buyLink.platform}
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        transition="transform 0.15s ease"
                                        _hover={{ transform: "scale(1.05)" }}
                                    >
                                        <BuyLink
                                            track={track!}
                                            buyLink={buyLink}
                                            searchTitle={searchTitle}
                                        />
                                    </GridItem>
                                ))}
                            </Grid>
                        </Box>

                        <Flex
                            px={[4, 5]}
                            py={4}
                            justifyContent="flex-end"
                            css={{
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                borderTop: "1px solid var(--chakra-colors-brand-divider)",
                            }}
                        >
                            <Button variant="outline" onClick={closeBuyModal}>
                                Close
                            </Button>
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default BuyModal;

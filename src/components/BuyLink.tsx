import { Flex, Image, Link, Text } from "@chakra-ui/react";
import React from "react";
import { IBuyLink, Track } from "../../types";
import { capitaliseWords, formatBuyUrl } from "../../utils";

interface Props {
    track: Track;
    buyLink: IBuyLink;
}

const BuyLink = ({ track, buyLink }: Props) => {
    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={formatBuyUrl(track, buyLink.platform)}
            transition="transform 0.15s ease"
            _hover={{
                transform: "scale(1.05)",
            }}
        >
            <Flex direction="column" alignItems="center" gap={2}>
                <Image
                    alt={buyLink.platform}
                    rounded="lg"
                    maxW={14}
                    maxH={14}
                    src={buyLink.logo}
                />
                <Text
                    textAlign="center"
                    fontSize="xs"
                    color="brand.textSecondary"
                >
                    {capitaliseWords(buyLink.platform)}
                </Text>
            </Flex>
        </Link>
    );
};

export default BuyLink;

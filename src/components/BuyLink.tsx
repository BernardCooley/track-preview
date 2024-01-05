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
            isExternal
            href={formatBuyUrl(track, buyLink.platform)}
            _hover={{
                transform: "scale(1.2)",
            }}
        >
            <Flex direction="column" alignItems="center">
                <Image
                    alt={buyLink.platform}
                    rounded="full"
                    maxW={16}
                    maxH={16}
                    src={buyLink.logo}
                ></Image>
                <Text textAlign="center">
                    {capitaliseWords(buyLink.platform)}
                </Text>
            </Flex>
        </Link>
    );
};

export default BuyLink;

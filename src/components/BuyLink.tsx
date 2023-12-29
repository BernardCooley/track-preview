import { Flex, Image, Link, Text } from "@chakra-ui/react";
import React from "react";
import { BuyPlatforms, Track } from "../../types";
import { capitaliseWords, formatBuyUrl } from "../../utils";

interface Props {
    track: Track;
    platform: BuyPlatforms;
    logo: string;
}

const BuyLink = ({ track, platform, logo }: Props) => {
    return (
        <Link
            isExternal
            href={formatBuyUrl(track, platform)}
            _hover={{
                transform: "scale(1.2)",
            }}
        >
            <Flex direction="column" alignItems="center">
                <Image
                    alt={platform}
                    rounded="full"
                    maxW={16}
                    maxH={16}
                    src={logo}
                ></Image>
                <Text textAlign="center">{capitaliseWords(platform)}</Text>
            </Flex>
        </Link>
    );
};

export default BuyLink;

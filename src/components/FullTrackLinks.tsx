import React from "react";
import { Flex, Icon, Link, Text } from "@chakra-ui/react";
import { Track } from "../../types";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { FaSpotify, FaSoundcloud } from "react-icons/fa";

interface Props {
    currentTrack: Track;
    onLinkClicked: () => void;
}

const FullTrackLinks = ({ currentTrack, onLinkClicked }: Props) => {
    const links = [
        {
            url: `https://www.youtube.com/results?search_query=${currentTrack.artist}+${currentTrack.title}+${currentTrack.releaseTitle}`,
            icon: YouTubeIcon,
            title: "Youtube",
            color: "#FF0000",
        },
        {
            url: `https://open.spotify.com/search/${currentTrack.artist}%20${currentTrack.title}%20${currentTrack.releaseTitle}`,
            icon: FaSpotify,
            title: "Spotify",
            color: "#1DB954",
        },
        {
            url: `https://soundcloud.com/search?q=${currentTrack.artist}%20${currentTrack.title}%20${currentTrack.releaseTitle}`,
            icon: FaSoundcloud,
            title: "Soundcloud",
            color: "#ff5500",
        },
    ];

    return (
        <Flex gap={2} w="full" py={2} direction="column" alignItems="center">
            <Text fontSize={[16, 20]}>Listen to the full track</Text>
            <Flex w="full" justifyContent="space-around" flexWrap="wrap">
                {links.map((link) => (
                    <Link
                        onClick={onLinkClicked}
                        rounded="12px"
                        py={1}
                        px={2}
                        key={link.title}
                        isExternal
                        href={link.url}
                        _hover={{
                            background: "brand.backgroundTertiaryOpaque3",
                        }}
                    >
                        <Flex gap={2} direction="row" alignItems="center">
                            <Icon
                                fontSize={["28px", "36px"]}
                                color={link.color}
                                as={link.icon}
                            />
                            <Text fontSize={["14px", "18px"]}>
                                {link.title}
                            </Text>
                        </Flex>
                    </Link>
                ))}
            </Flex>
        </Flex>
    );
};

export default FullTrackLinks;

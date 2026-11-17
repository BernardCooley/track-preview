import React from "react";
import { Flex, Link, Text } from "@chakra-ui/react";
import { Track } from "../../types";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { FaSpotify } from "react-icons/fa";

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
    ];

    return (
        <Flex
            gap={2}
            w="full"
            py={3}
            direction="column"
            alignItems="center"
        >
            <Text fontSize="sm" color="brand.textMuted">
                Listen to the full track
            </Text>
            <Flex gap={4} justifyContent="center" flexWrap="wrap">
                {links.map((link) => (
                    <Link
                        onClick={onLinkClicked}
                        rounded="lg"
                        py={1}
                        px={3}
                        key={link.title}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={link.url}
                        transition="all 0.2s ease"
                        _hover={{
                            bg: "brand.surfaceHover",
                        }}
                    >
                        <Flex gap={2} alignItems="center">
                            <link.icon
                                style={{ fontSize: "22px", color: link.color }}
                            />
                            <Text fontSize="sm" color="brand.textSecondary">
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

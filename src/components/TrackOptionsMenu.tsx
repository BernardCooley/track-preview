import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import React from "react";
import { Track } from "../../types";
import { Button } from "@chakra-ui/button";
import { Link } from "@chakra-ui/layout";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TrackOptionsProps {
    track: Track;
    index: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTrackDelete: (index: number) => void;
}

const TrackMenuOptions = ({
    track,
    index,
    onMouseEnter,
    onMouseLeave,
    onTrackDelete,
}: TrackOptionsProps) => {
    return (
        <Menu variant="primary">
            <MenuButton
                onClick={(e) => e.stopPropagation()}
                variant="menuButton"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                as={Button}
                rightIcon={<MoreHorizIcon />}
            ></MenuButton>
            <MenuList>
                <MenuItem
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={() => onTrackDelete(index)}
                >
                    Delete
                </MenuItem>
                <MenuItem
                    as={Link}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    variant="primary"
                    href={track.purchaseUrl}
                    isExternal
                >
                    Buy
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default TrackMenuOptions;

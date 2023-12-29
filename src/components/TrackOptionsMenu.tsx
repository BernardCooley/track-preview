import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import React from "react";
import { Button } from "@chakra-ui/button";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

interface TrackOptionsProps {
    index: number;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTrackDelete: (index: number) => void;
    onViewAlbum: (index: number) => void;
}

const TrackMenuOptions = ({
    index,
    onMouseEnter,
    onMouseLeave,
    onTrackDelete,
    onViewAlbum,
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
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onClick={() => onViewAlbum(index)}
                >
                    View album
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default TrackMenuOptions;

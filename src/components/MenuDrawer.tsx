import React from "react";
import {
    Drawer,
    Flex,
    Separator,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import MenuDrawerItem from "./MenuDrawerItem";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();

    return (
        <Drawer.Root
            open={isOpen}
            placement="end"
            onOpenChange={(details) => { if (!details.open) onClose(); }}
        >
            <Drawer.Backdrop />
            <Drawer.Positioner>
                <Drawer.Content
                    background="linear-gradient(to bottom, var(--chakra-colors-brand-background-primary), var(--chakra-colors-brand-background-secondary))"
                >
                    <Drawer.CloseTrigger top={4} fontSize="md" />
                    <Drawer.Header>Menu</Drawer.Header>
                    <Separator />
                    <Drawer.Body>
                        <Flex
                            direction="column"
                            gap={6}
                            pt={4}
                            alignItems="center"
                        >
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="Home"
                                href="/explore"
                            />
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="Account"
                                href="/account"
                            />
                        </Flex>
                    </Drawer.Body>

                    <Separator />

                    <Drawer.Footer>
                        <MenuDrawerItem
                            pathname={pathname}
                            linkText="Contact"
                            href="mailto:info@phoniquest.com"
                            icon={<OpenInNewIcon />}
                        />
                    </Drawer.Footer>
                </Drawer.Content>
            </Drawer.Positioner>
        </Drawer.Root>
    );
};

MenuDrawer.displayName = "MenuDrawer";

export default MenuDrawer;

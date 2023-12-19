import React, { forwardRef } from "react";
import {
    Divider,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    Flex,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import MenuDrawerItem from "./MenuDrawerItem";
import { auth } from "../../firebase/firebaseInit";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = forwardRef<HTMLButtonElement | undefined, Props>(
    ({ isOpen, onClose }, btnRef) => {
        const pathname = usePathname();

        return (
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef as any}
            >
                <DrawerOverlay />
                <DrawerContent bgGradient="linear(to-b, brand.backgroundPrimary, brand.backgroundSecondary)">
                    <DrawerCloseButton />
                    <DrawerHeader>Menu</DrawerHeader>
                    <Divider />
                    <DrawerBody>
                        <Flex direction="column" gap={4} pt={4}>
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
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="Settings"
                                href="/settings"
                            />
                            {auth?.currentUser?.uid ===
                                "JZj7Y57oCpU3QfNaSu6wVJpODAR2" && (
                                <MenuDrawerItem
                                    pathname={pathname}
                                    linkText="Admin"
                                    href="/admin"
                                />
                            )}
                        </Flex>
                    </DrawerBody>

                    <Divider />

                    <DrawerFooter>
                        <MenuDrawerItem
                            pathname={pathname}
                            linkText="Contact"
                            href="/contact"
                        />
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }
);

MenuDrawer.displayName = "MenuDrawer";

export default MenuDrawer;

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
                                href="/"
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
                        </Flex>
                    </DrawerBody>

                    <DrawerFooter></DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }
);

export default MenuDrawer;

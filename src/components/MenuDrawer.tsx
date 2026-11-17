import React from "react";
import {
    Box,
    Drawer,
    Flex,
    Separator,
    Text,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import MenuDrawerItem from "./MenuDrawerItem";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeContext } from "../../context/ThemeContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const { appearance, toggleAppearance } = useThemeContext();

    return (
        <Drawer.Root
            open={isOpen}
            placement="end"
            onOpenChange={(details) => { if (!details.open) onClose(); }}
        >
            <Drawer.Backdrop />
            <Drawer.Positioner>
                <Drawer.Content
                    bg="brand.bg"
                    borderLeft="1px solid"
                    borderLeftColor="brand.border"
                >
                    <Flex
                        px={5}
                        pt={5}
                        pb={3}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Text
                            fontSize="xl"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            letterSpacing="-0.01em"
                        >
                            Menu
                        </Text>
                        <Drawer.CloseTrigger
                            position="relative"
                            top="auto"
                            right="auto"
                            color="brand.textMuted"
                            _hover={{ color: "brand.textPrimary" }}
                        />
                    </Flex>
                    <Box
                        h="1px"
                        bg="brand.divider"
                        mx={5}
                    />
                    <Drawer.Body pt={6}>
                        <Flex direction="column" gap={2}>
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

                        <Separator borderColor="brand.divider" my={4} />

                        <Flex
                            alignItems="center"
                            gap={3}
                            px={3}
                            py={2}
                            rounded="lg"
                            cursor="pointer"
                            transition="all 0.2s ease"
                            _hover={{
                                bg: "brand.surfaceHover",
                            }}
                            onClick={toggleAppearance}
                        >
                            <Flex
                                color="brand.primary"
                                fontSize="sm"
                            >
                                {appearance === "light" ? (
                                    <DarkModeIcon style={{ fontSize: "20px" }} />
                                ) : (
                                    <LightModeIcon style={{ fontSize: "20px" }} />
                                )}
                            </Flex>
                            <Text
                                fontSize="md"
                                fontWeight="medium"
                                color="brand.textSecondary"
                            >
                                {appearance === "light" ? "Dark mode" : "Light mode"}
                            </Text>
                        </Flex>
                    </Drawer.Body>

                    <Separator borderColor="brand.divider" />

                    <Drawer.Footer justifyContent="flex-start">
                        <MenuDrawerItem
                            pathname={pathname}
                            linkText="Contact"
                            href="mailto:info@phoniquest.com"
                            icon={<OpenInNewIcon style={{ fontSize: "16px" }} />}
                        />
                    </Drawer.Footer>
                </Drawer.Content>
            </Drawer.Positioner>
        </Drawer.Root>
    );
};

MenuDrawer.displayName = "MenuDrawer";

export default MenuDrawer;

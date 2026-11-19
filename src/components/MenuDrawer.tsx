import React from "react";
import {
    Box,
    Drawer,
    Flex,
    Separator,
    Switch,
    Text,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import MenuDrawerItem from "./MenuDrawerItem";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeContext } from "../../context/ThemeContext";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useTrackContext } from "../../context/TrackContext";
import { mutateUserProfile } from "@/bff/bff";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const { appearance, toggleAppearance } = useThemeContext();
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const { updateChangesMade, updateReviewTracks } = useTrackContext();

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
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="How it works"
                                href="/how-it-works"
                            />
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="Legal"
                                href="/legal"
                            />
                        </Flex>

                        <Separator borderColor="brand.divider" my={4} />

                        <Text
                            fontSize="xs"
                            fontWeight="semibold"
                            color="brand.textMuted"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            px={3}
                            mb={2}
                        >
                            Settings
                        </Text>

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

                        <Flex
                            alignItems="center"
                            justifyContent="space-between"
                            gap={3}
                            px={3}
                            py={2}
                            rounded="lg"
                        >
                            <Flex direction="column">
                                <Text
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="brand.textSecondary"
                                >
                                    Curated mode
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="brand.textMuted"
                                >
                                    Review liked tracks twice before they reach your library
                                </Text>
                            </Flex>
                            <Switch.Root
                                checked={userProfile?.curatedMode ?? false}
                                onCheckedChange={async (details) => {
                                    if (user?.uid) {
                                        const newProfile = await mutateUserProfile({
                                            userId: user.uid,
                                            curatedMode: details.checked,
                                        });
                                        updateUserProfile(newProfile);
                                        updateReviewTracks(2, [], 0);
                                        updateReviewTracks(3, [], 0);
                                        updateChangesMade(2, true);
                                        updateChangesMade(3, true);
                                        updateChangesMade(4, true);
                                    }
                                }}
                            >
                                <Switch.HiddenInput />
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                            </Switch.Root>
                        </Flex>

                        <Flex
                            alignItems="center"
                            justifyContent="space-between"
                            gap={3}
                            px={3}
                            py={2}
                            rounded="lg"
                        >
                            <Flex direction="column">
                                <Text
                                    fontSize="md"
                                    fontWeight="medium"
                                    color="brand.textSecondary"
                                >
                                    Swipe mode
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color="brand.textMuted"
                                >
                                    Like or skip tracks by swiping
                                </Text>
                            </Flex>
                            <Switch.Root
                                checked={userProfile?.swipeMode ?? true}
                                onCheckedChange={async (details) => {
                                    if (user?.uid) {
                                        const newProfile = await mutateUserProfile({
                                            userId: user.uid,
                                            swipeMode: details.checked,
                                        });
                                        updateUserProfile(newProfile);
                                    }
                                }}
                            >
                                <Switch.HiddenInput />
                                <Switch.Control>
                                    <Switch.Thumb />
                                </Switch.Control>
                            </Switch.Root>
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

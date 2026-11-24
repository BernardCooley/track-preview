import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
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
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "./UpgradePrompt";
import StarIcon from "@mui/icons-material/Star";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const { appearance, toggleAppearance } = useThemeContext();
    const { user, userProfile, updateUserProfile } = useAuthContext();
    const { updateChangesMade, updateReviewTracks } = useTrackContext();
    const { isPro, requirePro, upgradeFeature, dismissUpgrade } = useSubscription();
    const [showCuratedConfirm, setShowCuratedConfirm] = useState(false);

    const disableCuratedMode = async () => {
        if (user?.uid) {
            const newProfile = await mutateUserProfile({
                userId: user.uid,
                curatedMode: false,
            });
            updateUserProfile(newProfile);
            updateReviewTracks(2, [], 0);
            updateReviewTracks(3, [], 0);
            updateChangesMade(2, true);
            updateChangesMade(3, true);
            updateChangesMade(4, true);
        }
        setShowCuratedConfirm(false);
    };

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
                                linkText="New Tracks"
                                href="/new-tracks"
                                onClick={!isPro ? () => { requirePro("New Tracks"); } : undefined}
                                badge={!isPro ? (
                                    <Flex
                                        alignItems="center"
                                        bg="brand.primarySubtle"
                                        color="brand.primary"
                                        rounded="full"
                                        px={1.5}
                                        py={0.5}
                                        gap={0.5}
                                    >
                                        <StarIcon style={{ fontSize: "10px" }} />
                                        <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                                            PRO
                                        </Text>
                                    </Flex>
                                ) : null}
                            />
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="History"
                                href="/history"
                                onClick={!isPro ? () => { requirePro("Discovery History"); } : undefined}
                                badge={!isPro ? (
                                    <Flex
                                        alignItems="center"
                                        bg="brand.primarySubtle"
                                        color="brand.primary"
                                        rounded="full"
                                        px={1.5}
                                        py={0.5}
                                        gap={0.5}
                                    >
                                        <StarIcon style={{ fontSize: "10px" }} />
                                        <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                                            PRO
                                        </Text>
                                    </Flex>
                                ) : null}
                            />
                            <MenuDrawerItem
                                pathname={pathname}
                                linkText="Settings"
                                href="/settings"
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
                            {user?.uid && (process.env.NEXT_PUBLIC_ADMIN_UID || "nWDEiOWsMVQ7qOFVLzrZvGrEqdN2,v2dWVgS1DxagPDt124tUq8hirxs1").split(",").includes(user.uid) && (
                                <MenuDrawerItem
                                    pathname={pathname}
                                    linkText="Admin"
                                    href="/admin"
                                />
                            )}
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
                                <Flex alignItems="center" gap={1.5}>
                                    <Text
                                        fontSize="md"
                                        fontWeight="medium"
                                        color="brand.textSecondary"
                                    >
                                        Curated mode
                                    </Text>
                                    {!isPro && (
                                        <Flex
                                            alignItems="center"
                                            bg="brand.primarySubtle"
                                            color="brand.primary"
                                            rounded="full"
                                            px={1.5}
                                            py={0.5}
                                            gap={0.5}
                                        >
                                            <StarIcon style={{ fontSize: "10px" }} />
                                            <Text fontSize="2xs" fontWeight="bold" lineHeight="1">
                                                PRO
                                            </Text>
                                        </Flex>
                                    )}
                                </Flex>
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
                                    if (details.checked) {
                                        if (!requirePro("Curated Mode")) return;
                                        if (user?.uid) {
                                            const newProfile = await mutateUserProfile({
                                                userId: user.uid,
                                                curatedMode: true,
                                            });
                                            updateUserProfile(newProfile);
                                            updateReviewTracks(2, [], 0);
                                            updateReviewTracks(3, [], 0);
                                            updateChangesMade(2, true);
                                            updateChangesMade(3, true);
                                            updateChangesMade(4, true);
                                        }
                                    } else {
                                        setShowCuratedConfirm(true);
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

            <Dialog.Root
                open={showCuratedConfirm}
                onOpenChange={(details) => {
                    if (!details.open) setShowCuratedConfirm(false);
                }}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content
                        m={[3, 6]}
                        bg="brand.bg"
                        shadow="2xl"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="modal"
                        overflow="hidden"
                    >
                        <Flex direction="column">
                            <Flex
                                px={[4, 5]}
                                pt={[4, 5]}
                                pb={3}
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Text
                                    fontSize="lg"
                                    fontWeight="semibold"
                                    color="brand.textPrimary"
                                    letterSpacing="-0.01em"
                                >
                                    Turn off curated mode?
                                </Text>
                                <Dialog.CloseTrigger
                                    position="relative"
                                    top="auto"
                                    right="auto"
                                    color="brand.textMuted"
                                    _hover={{ color: "brand.textPrimary" }}
                                />
                            </Flex>

                            <Box h="1px" bg="brand.divider" mx={[4, 5]} />

                            <Box px={[4, 5]} py={5}>
                                <Text color="brand.textSecondary" fontSize="sm">
                                    Any tracks currently in review will be moved to your library.
                                </Text>
                            </Box>

                            <Flex
                                gap={3}
                                px={[4, 5]}
                                py={4}
                                justifyContent="flex-end"
                                css={{
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                    borderTop: "1px solid var(--chakra-colors-brand-divider)",
                                }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCuratedConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={disableCuratedMode}
                                >
                                    Turn off
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            <UpgradePrompt featureName={upgradeFeature} onClose={dismissUpgrade} />
        </Drawer.Root>
    );
};

MenuDrawer.displayName = "MenuDrawer";

export default MenuDrawer;

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
import { useAuthContext } from "../../Contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "./UpgradePrompt";
import StarIcon from "@mui/icons-material/Star";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const MenuDrawer = ({ isOpen, onClose }: Props) => {
    const pathname = usePathname();
    const { user } = useAuthContext();
    const { isPro, subscriptionsEnabled, requirePro, upgradeFeature, dismissUpgrade } = useSubscription();

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
                                linkText="Pricing"
                                href="/pricing"
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

                        {subscriptionsEnabled && !isPro && (
                            <>
                                <Box h="1px" bg="brand.divider" mt={4} mb={3} />
                                <Flex
                                    alignItems="center"
                                    gap={2}
                                    px={3}
                                    py={2.5}
                                    rounded="lg"
                                    cursor="pointer"
                                    bg="brand.primarySubtle"
                                    color="brand.primary"
                                    fontWeight="semibold"
                                    fontSize="md"
                                    transition="all 0.2s ease"
                                    _hover={{ opacity: 0.85 }}
                                    onClick={() => requirePro("Upgrade")}
                                >
                                    <StarIcon style={{ fontSize: "16px" }} />
                                    <Text>Upgrade to Pro</Text>
                                </Flex>
                            </>
                        )}
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

            <UpgradePrompt featureName={upgradeFeature} onClose={dismissUpgrade} />
        </Drawer.Root>
    );
};

MenuDrawer.displayName = "MenuDrawer";

export default MenuDrawer;

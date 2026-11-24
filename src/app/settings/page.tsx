"use client";
import BackHeader from "@/components/BackHeader";
import AuthGuard from "@/components/AuthGuard";
import GenreModal from "@/components/GenreModal";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { mutateUserProfile, getUserProfile } from "@/bff/bff";
import { genres } from "../../../data/genres";
import { Box, Button, Dialog, Flex, Heading, Switch, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import StarIcon from "@mui/icons-material/Star";
import TuneIcon from "@mui/icons-material/Tune";
import EmailIcon from "@mui/icons-material/Email";
import LibraryExportButton from "@/components/LibraryExportButton";

const FREQUENCY_OPTIONS = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
] as const;

const SettingsContent = () => {
    const { user, updateUser, userProfile, updateUserProfile } = useAuthContext();
    const { isPro, requirePro, upgradeFeature, dismissUpgrade } = useSubscription();
    const [showGenreSelector, setShowGenreSelector] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);

    const savedGenres = userProfile?.genreAlerts ?? [];
    const savedFrequency = userProfile?.genreAlertFrequency ?? "WEEKLY";
    const savedEmailsEnabled = userProfile?.genreEmailsEnabled ?? false;

    const [localGenres, setLocalGenres] = useState<string[]>(savedGenres);
    const [localFrequency, setLocalFrequency] = useState<string>(savedFrequency);
    const [localEmailsEnabled, setLocalEmailsEnabled] = useState(savedEmailsEnabled);

    useEffect(() => {
        setLocalGenres(savedGenres);
        setLocalFrequency(savedFrequency);
        setLocalEmailsEnabled(savedEmailsEnabled);
    }, [userProfile?.genreAlerts, userProfile?.genreAlertFrequency, userProfile?.genreEmailsEnabled]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser?.uid && firebaseUser.email) {
                updateUser({ email: firebaseUser.email, uid: firebaseUser.uid });
                const profile = await getUserProfile({ userId: firebaseUser.uid });
                if (profile) {
                    updateUserProfile(profile);
                    const needsEmailSync = profile.email !== firebaseUser.email;
                    const needsGenreClear = !isPro && profile.genreAlerts.length > 0;

                    if (needsEmailSync || needsGenreClear) {
                        const updated = await mutateUserProfile({
                            userId: firebaseUser.uid,
                            ...(needsEmailSync && { email: firebaseUser.email }),
                            ...(needsGenreClear && { genreAlerts: [], genreEmailsEnabled: false }),
                        });
                        updateUserProfile(updated);
                    }
                }
            }
        });
        return unsubscribe;
    }, [isPro]);

    const hasLocalGenres = localGenres.length > 0;

    const hasGenreChanges =
        JSON.stringify(localGenres) !== JSON.stringify(savedGenres);

    const hasEmailChanges =
        localFrequency !== savedFrequency ||
        localEmailsEnabled !== savedEmailsEnabled;

    const editingGenres = hasGenreChanges;
    const editingEmail = hasEmailChanges;

    const handleOpenPicker = () => {
        setShowGenreSelector(true);
    };

    const handleGenreApply = (selected: string[]) => {
        const alertGenres = selected.some((g) => g.toLowerCase() === "all") ? [] : selected;
        setLocalGenres(alertGenres);
        setShowGenreSelector(false);
    };

    const handleSaveGenres = async () => {
        if (!user?.uid) return;
        setSaving(true);
        try {
            const updated = await mutateUserProfile({
                userId: user.uid,
                genreAlerts: localGenres,
            });
            updateUserProfile(updated);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!user?.uid) return;
        setSaving(true);
        try {
            const updated = await mutateUserProfile({
                userId: user.uid,
                genreAlertFrequency: localFrequency,
                genreEmailsEnabled: localEmailsEnabled,
            });
            updateUserProfile(updated);
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        if (!user?.uid) return;
        setClearing(true);
        try {
            const updated = await mutateUserProfile({
                userId: user.uid,
                genreAlerts: [],
            });
            updateUserProfile(updated);
        } finally {
            setClearing(false);
            setShowClearConfirm(false);
        }
    };

    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <BackHeader title="Settings" />

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
                gap={6}
            >
                {/* Genre Preferences Card */}
                <Box
                    w="full"
                    maxW="520px"
                    bg="brand.cardBg"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="card"
                    p={[5, 6]}
                    opacity={editingEmail ? 0.4 : 1}
                    pointerEvents={editingEmail ? "none" : "auto"}
                    transition="opacity 0.2s ease"
                    {...(!isPro && {
                        cursor: "pointer",
                        onClick: () => requirePro("Genre Alerts"),
                        css: { "& *": { pointerEvents: "none" } },
                    })}
                >
                    <Flex alignItems="center" justifyContent="space-between" mb={savedGenres.length > 0 ? 2 : 6}>
                        <Flex alignItems="center" gap={2}>
                            <TuneIcon style={{ fontSize: "20px", color: "var(--chakra-colors-brand-primary)" }} />
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                            >
                                Genre Preferences
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
                    </Flex>

                    {savedGenres.length > 0 && (
                        <Flex
                            as="button"
                            onClick={() => setShowClearConfirm(true)}
                            alignItems="center"
                            gap={2}
                            mb={6}
                            px={3}
                            py={2}
                            rounded="lg"
                            cursor="pointer"
                            transition="all 0.15s ease"
                            color="brand.textMuted"
                            _hover={{ color: "brand.textSecondary", bg: "brand.surfaceHover" }}
                        >
                            <Text fontSize="sm" fontWeight="medium">
                                Clear all genres
                            </Text>
                        </Flex>
                    )}

                    <Flex direction="column" gap={6}>
                        <Box>
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Followed genres
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Choose genres to follow. New tracks in these genres will appear on your New Tracks page.
                            </Text>

                            {hasLocalGenres ? (
                                <Flex flexWrap="wrap" gap={1.5} mb={4}>
                                    {localGenres.map((genre) => (
                                        <Box
                                            key={genre}
                                            px={3}
                                            py={1.5}
                                            fontSize="xs"
                                            fontWeight="medium"
                                            rounded="md"
                                            color="brand.primary"
                                            borderLeft="2px solid"
                                            borderLeftColor="brand.primary"
                                            css={{
                                                backdropFilter: "blur(8px)",
                                                WebkitBackdropFilter: "blur(8px)",
                                                background: "color-mix(in srgb, var(--chakra-colors-brand-primary) 10%, transparent)",
                                            }}
                                        >
                                            {genre}
                                        </Box>
                                    ))}
                                </Flex>
                            ) : (
                                <Text
                                    fontSize="sm"
                                    color="brand.textSecondary"
                                    mb={4}
                                >
                                    No genres selected.
                                </Text>
                            )}

                            <Button
                                variant={hasLocalGenres ? "outline" : "primary"}
                                size="sm"
                                onClick={handleOpenPicker}
                            >
                                {hasLocalGenres ? "Edit genres" : "Choose genres"}
                            </Button>
                        </Box>

                        {hasGenreChanges && (
                            <Flex
                                borderTop="1px solid"
                                borderTopColor="brand.divider"
                                pt={4}
                                justifyContent="flex-end"
                            >
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveGenres}
                                    loading={saving}
                                >
                                    Save
                                </Button>
                            </Flex>
                        )}
                    </Flex>
                </Box>

                {/* Email Notifications Card */}
                {hasLocalGenres && isPro && (
                    <Box
                        w="full"
                        maxW="520px"
                        bg="brand.cardBg"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="card"
                        p={[5, 6]}
                        opacity={editingGenres ? 0.4 : 1}
                        pointerEvents={editingGenres ? "none" : "auto"}
                        transition="opacity 0.2s ease"
                    >
                        <Flex alignItems="center" gap={2} mb={6}>
                            <EmailIcon style={{ fontSize: "20px", color: "var(--chakra-colors-brand-primary)" }} />
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="brand.textPrimary"
                            >
                                Email Notifications
                            </Text>
                        </Flex>

                        <Flex direction="column" gap={6}>
                            <Flex
                                alignItems="center"
                                justifyContent="space-between"
                                gap={3}
                            >
                                <Flex direction="column">
                                    <Text
                                        fontSize="sm"
                                        fontWeight="medium"
                                        color="brand.textSecondary"
                                    >
                                        Email me about new tracks
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color="brand.textMuted"
                                    >
                                        Get notified when new tracks are added in your followed genres.
                                    </Text>
                                </Flex>
                                <Switch.Root
                                    checked={localEmailsEnabled}
                                    onCheckedChange={(details) => setLocalEmailsEnabled(details.checked)}
                                >
                                    <Switch.HiddenInput />
                                    <Switch.Control>
                                        <Switch.Thumb />
                                    </Switch.Control>
                                </Switch.Root>
                            </Flex>

                            {localEmailsEnabled && (
                                <Box
                                    borderTop="1px solid"
                                    borderTopColor="brand.divider"
                                    pt={6}
                                >
                                    <Heading
                                        size="xs"
                                        textTransform="uppercase"
                                        fontSize="xs"
                                        letterSpacing="wider"
                                        color="brand.textMuted"
                                        mb={2}
                                    >
                                        Email frequency
                                    </Heading>
                                    <Text
                                        fontSize="xs"
                                        color="brand.textMuted"
                                        mb={3}
                                    >
                                        How often would you like to receive emails?
                                    </Text>
                                    <Flex gap={2}>
                                        {FREQUENCY_OPTIONS.map((option) => (
                                            <Box
                                                key={option.value}
                                                as="button"
                                                onClick={() => setLocalFrequency(option.value)}
                                                px={4}
                                                py={2}
                                                fontSize="sm"
                                                fontWeight={localFrequency === option.value ? "semibold" : "normal"}
                                                rounded="lg"
                                                cursor="pointer"
                                                transition="all 0.15s ease"
                                                color={localFrequency === option.value ? "brand.primary" : "brand.textSecondary"}
                                                border="1px solid"
                                                borderColor={localFrequency === option.value ? "brand.primary" : "brand.border"}
                                                css={{
                                                    background: localFrequency === option.value
                                                        ? "color-mix(in srgb, var(--chakra-colors-brand-primary) 10%, transparent)"
                                                        : "transparent",
                                                    "&:hover": {
                                                        borderColor: "var(--chakra-colors-brand-primary)",
                                                    },
                                                }}
                                            >
                                                {option.label}
                                            </Box>
                                        ))}
                                    </Flex>
                                </Box>
                            )}

                            {hasEmailChanges && (
                                <Flex
                                    borderTop="1px solid"
                                    borderTopColor="brand.divider"
                                    pt={4}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleSaveEmail}
                                        loading={saving}
                                    >
                                        Save
                                    </Button>
                                </Flex>
                            )}
                        </Flex>
                    </Box>
                )}
                {/* Export Library Card */}
                <LibraryExportButton requirePro={requirePro} isPro={isPro} variant="card" />
            </Flex>

            <GenreModal
                onCancel={() => setShowGenreSelector(false)}
                showGenreSelector={showGenreSelector}
                setShowGenreSelector={setShowGenreSelector}
                selectedGenres={hasLocalGenres ? localGenres : ["all"]}
                onApply={handleGenreApply}
                availableGenres={genres}
            />

            <UpgradePrompt featureName={upgradeFeature} onClose={dismissUpgrade} />

            <Dialog.Root
                role="alertdialog"
                open={showClearConfirm}
                onOpenChange={(details) => { if (!details.open) setShowClearConfirm(false); }}
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
                                    Clear all genres?
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
                                    This will remove all your followed genres. Your New Tracks page will be empty and email notifications will be turned off.
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
                                    onClick={() => setShowClearConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="warning"
                                    onClick={handleClear}
                                    loading={clearing}
                                >
                                    Clear all
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Flex>
    );
};

const Settings = () => (
    <AuthGuard>
        <SettingsContent />
    </AuthGuard>
);

export default Settings;

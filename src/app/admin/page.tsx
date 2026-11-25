"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import {
    Box,
    Flex,
    Heading,
    Switch,
    Text,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import BackHeader from "@/components/BackHeader";
import { useRouter } from "next/navigation";
import ExploreSkeleton from "@/components/skeletons/ExploreSkeleton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useAuthContext } from "../../../Contexts/AuthContext";
import { dismissUpgradePrompt, getUserProfile } from "@/bff/bff";

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UID || "nWDEiOWsMVQ7qOFVLzrZvGrEqdN2,v2dWVgS1DxagPDt124tUq8hirxs1").split(",").filter(Boolean);

const countries = [
    { code: "", label: "Auto (from Vercel)" },
    { code: "GB", label: "United Kingdom" },
    { code: "IE", label: "Ireland" },
    { code: "DE", label: "Germany" },
    { code: "FR", label: "France" },
    { code: "NL", label: "Netherlands" },
    { code: "BE", label: "Belgium" },
    { code: "ES", label: "Spain" },
    { code: "IT", label: "Italy" },
    { code: "PT", label: "Portugal" },
    { code: "AT", label: "Austria" },
    { code: "CH", label: "Switzerland" },
    { code: "SE", label: "Sweden" },
    { code: "NO", label: "Norway" },
    { code: "DK", label: "Denmark" },
    { code: "FI", label: "Finland" },
    { code: "PL", label: "Poland" },
    { code: "US", label: "United States" },
    { code: "CA", label: "Canada" },
    { code: "MX", label: "Mexico" },
    { code: "JP", label: "Japan" },
    { code: "AU", label: "Australia" },
    { code: "NZ", label: "New Zealand" },
    { code: "BR", label: "Brazil" },
    { code: "ZA", label: "South Africa" },
];

const getCountryCookie = (): string => {
    const match = document.cookie.match(/(?:^|;\s*)country_override=([^;]*)/);
    return match?.[1] || "";
};

const setCountryCookie = (code: string) => {
    if (code) {
        document.cookie = `country_override=${code}; path=/; max-age=86400; SameSite=Lax`;
    } else {
        document.cookie = `country_override=; path=/; max-age=0; SameSite=Lax`;
    }
};

const subscriptionOptions = [
    { value: "", label: "No override" },
    { value: "pro", label: "Force Pro" },
    { value: "free", label: "Force Free" },
];

const getSubscriptionCookie = (): string => {
    const match = document.cookie.match(/(?:^|;\s*)subscription_override=([^;]*)/);
    return match?.[1] || "";
};

const setSubscriptionCookie = (value: string) => {
    if (value) {
        document.cookie = `subscription_override=${value}; path=/; max-age=86400; SameSite=Lax`;
    } else {
        document.cookie = `subscription_override=; path=/; max-age=0; SameSite=Lax`;
    }
};

const getThresholdCookie = (): boolean => {
    const match = document.cookie.match(/(?:^|;\s*)upgrade_threshold_override=([^;]*)/);
    return match?.[1] === "1";
};

const setThresholdCookie = (on: boolean) => {
    if (on) {
        document.cookie = `upgrade_threshold_override=1; path=/; max-age=86400; SameSite=Lax`;
    } else {
        document.cookie = `upgrade_threshold_override=; path=/; max-age=0; SameSite=Lax`;
    }
};

const getAnalyticsCookie = (): boolean => {
    const match = document.cookie.match(/(?:^|;\s*)analytics_override=([^;]*)/);
    return match?.[1] === "1";
};

const setAnalyticsCookie = (on: boolean) => {
    if (on) {
        document.cookie = `analytics_override=1; path=/; max-age=86400; SameSite=Lax`;
    } else {
        document.cookie = `analytics_override=; path=/; max-age=0; SameSite=Lax`;
    }
};

const AdminPage = () => {
    const router = useRouter();
    const { userProfile, updateUserProfile } = useAuthContext();
    const [checked, setChecked] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const showSkeleton = useDelayedLoading(!checked || !authorized);
    const [country, setCountry] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [subscription, setSubscription] = useState("");
    const [subDropdownOpen, setSubDropdownOpen] = useState(false);
    const subDropdownRef = useRef<HTMLDivElement>(null);
    const [dismissedDropdownOpen, setDismissedDropdownOpen] = useState(false);
    const dismissedDropdownRef = useRef<HTMLDivElement>(null);
    const [thresholdOverride, setThresholdOverride] = useState(false);
    const [analyticsOverride, setAnalyticsOverride] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && ADMIN_UIDS.includes(user.uid)) {
                setAuthorized(true);
                setCountry(getCountryCookie());
                setSubscription(getSubscriptionCookie());
                setThresholdOverride(getThresholdCookie());
                setAnalyticsOverride(getAnalyticsCookie());
                const profile = await getUserProfile({ userId: user.uid });
                if (profile) updateUserProfile(profile);
            } else {
                router.replace("/");
            }
            setChecked(true);
        });
        return unsubscribe;
    }, [router]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (subDropdownRef.current && !subDropdownRef.current.contains(e.target as Node)) {
                setSubDropdownOpen(false);
            }
            if (dismissedDropdownRef.current && !dismissedDropdownRef.current.contains(e.target as Node)) {
                setDismissedDropdownOpen(false);
            }
        };
        if (dropdownOpen || subDropdownOpen || dismissedDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen, subDropdownOpen, dismissedDropdownOpen]);

    const handleCountryChange = (code: string) => {
        setCountry(code);
        setCountryCookie(code);
        setDropdownOpen(false);
    };

    const handleSubscriptionChange = (value: string) => {
        setSubscription(value);
        setSubscriptionCookie(value);
        setSubDropdownOpen(false);
    };

    const selectedLabel = countries.find((c) => c.code === country)?.label || "Auto (from Vercel)";

    if (!checked || !authorized) {
        return showSkeleton ? <ExploreSkeleton /> : null;
    }

    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <BackHeader title="Admin" />

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
            >
                <Box
                    w="full"
                    maxW="520px"
                    bg="brand.cardBg"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="card"
                    p={[5, 6]}
                >
                    <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                        mb={6}
                    >
                        Feature Testing
                    </Text>

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
                                Country Override
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Override the detected country to test regional store prioritisation in the buy modal.
                            </Text>

                            <Box position="relative" ref={dropdownRef}>
                                <Flex
                                    as="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    w="full"
                                    px={4}
                                    py={3}
                                    bg="brand.bg"
                                    border="1px solid"
                                    borderColor={dropdownOpen ? "brand.primary" : "brand.border"}
                                    rounded="lg"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    cursor="pointer"
                                    transition="border-color 0.2s ease"
                                >
                                    <Text fontSize="md" color="brand.textPrimary">
                                        {selectedLabel}{country ? ` (${country})` : ""}
                                    </Text>
                                    <Box
                                        color="brand.textMuted"
                                        transition="transform 0.2s ease"
                                        transform={dropdownOpen ? "rotate(180deg)" : "none"}
                                    >
                                        <KeyboardArrowDownIcon fontSize="small" />
                                    </Box>
                                </Flex>

                                {dropdownOpen && (
                                    <Box
                                        position="absolute"
                                        top="calc(100% + 4px)"
                                        left={0}
                                        right={0}
                                        bg="brand.bg"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        rounded="lg"
                                        shadow="lg"
                                        zIndex={10}
                                        maxH="300px"
                                        overflowY="auto"
                                        py={1}
                                    >
                                        {countries.map((c) => (
                                            <Flex
                                                key={c.code}
                                                as="button"
                                                onClick={() => handleCountryChange(c.code)}
                                                w="full"
                                                px={4}
                                                py={3}
                                                alignItems="center"
                                                justifyContent="space-between"
                                                cursor="pointer"
                                                bg={c.code === country ? "brand.primarySubtle" : "transparent"}
                                                color={c.code === country ? "brand.primary" : "brand.textPrimary"}
                                                fontWeight={c.code === country ? "semibold" : "normal"}
                                                _hover={{ bg: c.code === country ? "brand.primarySubtle" : "brand.surfaceHover" }}
                                                transition="background 0.15s ease"
                                            >
                                                <Text fontSize="md">
                                                    {c.label}
                                                </Text>
                                                {c.code && (
                                                    <Text fontSize="sm" color="brand.textMuted">
                                                        {c.code}
                                                    </Text>
                                                )}
                                            </Flex>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {country && (
                                <Text
                                    fontSize="xs"
                                    color="brand.primary"
                                    mt={2}
                                >
                                    Country override active: {country}
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Subscription Override
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Override subscription status to test Pro/Free gating without changing the database.
                            </Text>

                            <Box position="relative" ref={subDropdownRef}>
                                <Flex
                                    as="button"
                                    onClick={() => setSubDropdownOpen(!subDropdownOpen)}
                                    w="full"
                                    px={4}
                                    py={3}
                                    bg="brand.bg"
                                    border="1px solid"
                                    borderColor={subDropdownOpen ? "brand.primary" : "brand.border"}
                                    rounded="lg"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    cursor="pointer"
                                    transition="border-color 0.2s ease"
                                >
                                    <Text fontSize="md" color="brand.textPrimary">
                                        {subscriptionOptions.find((o) => o.value === subscription)?.label || "No override"}
                                    </Text>
                                    <Box
                                        color="brand.textMuted"
                                        transition="transform 0.2s ease"
                                        transform={subDropdownOpen ? "rotate(180deg)" : "none"}
                                    >
                                        <KeyboardArrowDownIcon fontSize="small" />
                                    </Box>
                                </Flex>

                                {subDropdownOpen && (
                                    <Box
                                        position="absolute"
                                        top="calc(100% + 4px)"
                                        left={0}
                                        right={0}
                                        bg="brand.bg"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        rounded="lg"
                                        shadow="lg"
                                        zIndex={10}
                                        py={1}
                                    >
                                        {subscriptionOptions.map((o) => (
                                            <Flex
                                                key={o.value}
                                                as="button"
                                                onClick={() => handleSubscriptionChange(o.value)}
                                                w="full"
                                                px={4}
                                                py={3}
                                                alignItems="center"
                                                cursor="pointer"
                                                bg={o.value === subscription ? "brand.primarySubtle" : "transparent"}
                                                color={o.value === subscription ? "brand.primary" : "brand.textPrimary"}
                                                fontWeight={o.value === subscription ? "semibold" : "normal"}
                                                _hover={{ bg: o.value === subscription ? "brand.primarySubtle" : "brand.surfaceHover" }}
                                                transition="background 0.15s ease"
                                            >
                                                <Text fontSize="md">
                                                    {o.label}
                                                </Text>
                                            </Flex>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {subscription && (
                                <Text
                                    fontSize="xs"
                                    color="brand.primary"
                                    mt={2}
                                >
                                    Subscription override active: {subscription}
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Upgrade Prompt Dismissed Date
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Override the dismissed date to test the upgrade prompt. The prompt re-appears after 6 months.
                            </Text>

                            <Box position="relative" ref={dismissedDropdownRef}>
                                <Flex
                                    as="button"
                                    onClick={() => setDismissedDropdownOpen(!dismissedDropdownOpen)}
                                    w="full"
                                    px={4}
                                    py={3}
                                    bg="brand.bg"
                                    border="1px solid"
                                    borderColor={dismissedDropdownOpen ? "brand.primary" : "brand.border"}
                                    rounded="lg"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    cursor="pointer"
                                    transition="border-color 0.2s ease"
                                >
                                    <Text fontSize="md" color="brand.textPrimary">
                                        {userProfile?.upgradePromptDismissedAt
                                            ? `Dismissed ${new Date(userProfile.upgradePromptDismissedAt).toLocaleDateString()}`
                                            : "Not dismissed"}
                                    </Text>
                                    <Box
                                        color="brand.textMuted"
                                        transition="transform 0.2s ease"
                                        transform={dismissedDropdownOpen ? "rotate(180deg)" : "none"}
                                    >
                                        <KeyboardArrowDownIcon fontSize="small" />
                                    </Box>
                                </Flex>

                                {dismissedDropdownOpen && (
                                    <Box
                                        position="absolute"
                                        top="calc(100% + 4px)"
                                        left={0}
                                        right={0}
                                        bg="brand.bg"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        rounded="lg"
                                        shadow="lg"
                                        zIndex={10}
                                        py={1}
                                    >
                                        {[
                                            { label: "Not dismissed", value: "clear" },
                                            { label: "7 months ago", value: "7months" },
                                            { label: "Now", value: "now" },
                                        ].map((option) => (
                                            <Flex
                                                key={option.value}
                                                as="button"
                                                onClick={async () => {
                                                    if (!userProfile?.id) return;
                                                    let newDate: Date | null = null;
                                                    if (option.value === "clear") {
                                                        await dismissUpgradePrompt({ userId: userProfile.id, reset: true });
                                                    } else if (option.value === "7months") {
                                                        newDate = new Date();
                                                        newDate.setMonth(newDate.getMonth() - 7);
                                                        await dismissUpgradePrompt({ userId: userProfile.id, date: newDate.toISOString() });
                                                    } else {
                                                        newDate = new Date();
                                                        await dismissUpgradePrompt({ userId: userProfile.id });
                                                    }
                                                    updateUserProfile({
                                                        ...userProfile,
                                                        upgradePromptDismissedAt: newDate,
                                                    });
                                                    setDismissedDropdownOpen(false);
                                                }}
                                                w="full"
                                                px={4}
                                                py={3}
                                                alignItems="center"
                                                cursor="pointer"
                                                bg="transparent"
                                                color="brand.textPrimary"
                                                _hover={{ bg: "brand.surfaceHover" }}
                                                transition="background 0.15s ease"
                                            >
                                                <Text fontSize="md">
                                                    {option.label}
                                                </Text>
                                            </Flex>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Box>
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Upgrade Prompt Threshold
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Skip the 40-track library requirement so the upgrade prompt triggers with any number of tracks.
                            </Text>

                            <Flex
                                alignItems="center"
                                justifyContent="space-between"
                                px={3}
                                py={2}
                                rounded="lg"
                            >
                                <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                                    Skip threshold
                                </Text>
                                <Switch.Root
                                    checked={thresholdOverride}
                                    onCheckedChange={(details) => {
                                        setThresholdOverride(details.checked);
                                        setThresholdCookie(details.checked);
                                    }}
                                >
                                    <Switch.HiddenInput />
                                    <Switch.Control>
                                        <Switch.Thumb />
                                    </Switch.Control>
                                </Switch.Root>
                            </Flex>

                            {thresholdOverride && (
                                <Text
                                    fontSize="xs"
                                    color="brand.primary"
                                    mt={2}
                                >
                                    Threshold override active — prompt will trigger with any library size
                                </Text>
                            )}
                        </Box>

                        <Box>
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Analytics
                            </Heading>
                            <Text
                                fontSize="xs"
                                color="brand.textMuted"
                                mb={3}
                            >
                                Enable Amplitude event tracking in non-production environments. Events are always sent in production.
                            </Text>

                            <Flex
                                alignItems="center"
                                justifyContent="space-between"
                                px={3}
                                py={2}
                                rounded="lg"
                            >
                                <Text fontSize="sm" fontWeight="medium" color="brand.textSecondary">
                                    Send events
                                </Text>
                                <Switch.Root
                                    checked={analyticsOverride}
                                    onCheckedChange={(details) => {
                                        setAnalyticsOverride(details.checked);
                                        setAnalyticsCookie(details.checked);
                                    }}
                                >
                                    <Switch.HiddenInput />
                                    <Switch.Control>
                                        <Switch.Thumb />
                                    </Switch.Control>
                                </Switch.Root>
                            </Flex>

                            {analyticsOverride && (
                                <Text
                                    fontSize="xs"
                                    color="brand.primary"
                                    mt={2}
                                >
                                    Analytics active — events will be sent to Amplitude
                                </Text>
                            )}
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default AdminPage;

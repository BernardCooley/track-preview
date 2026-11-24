"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
} from "@chakra-ui/react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import BackHeader from "@/components/BackHeader";
import { useRouter } from "next/navigation";
import { Center } from "@chakra-ui/react";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UID || "").split(",").filter(Boolean);

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
    const match = document.cookie.match(/(?:^|;\s*)country=([^;]*)/);
    return match?.[1] || "";
};

const setCountryCookie = (code: string) => {
    document.cookie = `country=${code}; path=/; max-age=86400; SameSite=Lax`;
};

const AdminPage = () => {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [country, setCountry] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("[admin] uid:", user?.uid, "allowed:", ADMIN_UIDS);
            if (user && ADMIN_UIDS.includes(user.uid)) {
                setAuthorized(true);
                setCountry(getCountryCookie());
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
        };
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    const handleCountryChange = (code: string) => {
        setCountry(code);
        setCountryCookie(code);
        setDropdownOpen(false);
    };

    const selectedLabel = countries.find((c) => c.code === country)?.label || "Auto (from Vercel)";

    if (!checked || !authorized) {
        return (
            <Center h="100dvh" flexDirection="column" gap={8}>
                <Text
                    fontSize={["3xl", "4xl", "5xl"]}
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wider"
                >
                    PHONIQUEST
                </Text>
                <BouncingDotsLoader />
            </Center>
        );
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
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default AdminPage;

"use client";

import React, { useCallback, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    Text,
} from "@chakra-ui/react";
import { exportLibrary } from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import { toaster } from "@/components/toaster";
import DownloadIcon from "@mui/icons-material/Download";
import { track } from "@amplitude/unified";
import StarIcon from "@mui/icons-material/Star";

interface Props {
    requirePro: (featureName: string) => boolean;
    isPro: boolean;
    variant?: "icon" | "card";
}

type ExportFormat = "csv" | "json";

const LibraryExportButton = ({ requirePro, isPro, variant = "icon" }: Props) => {
    const { user } = useAuthContext();
    const [open, setOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [format, setFormat] = useState<ExportFormat>("csv");

    const handleClick = useCallback(() => {
        if (!requirePro("Library Export")) return;
        setOpen(true);
        setFormat("csv");
    }, [requirePro]);

    const handleExport = useCallback(async () => {
        if (!user?.uid) return;
        setExporting(true);

        try {
            track("Export Started", { type: "file", format });
            const blob = await exportLibrary({ userId: user.uid, format });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `phoniquest-library.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setOpen(false);
            toaster.create({
                title: "Library exported!",
                description: `Downloaded as ${format.toUpperCase()}.`,
                type: "success",
                duration: 5000,
            });
        } catch {
            toaster.create({
                title: "Export failed",
                description: "Could not export library. Please try again.",
                type: "error",
                duration: 5000,
            });
        } finally {
            setExporting(false);
        }
    }, [user?.uid, format]);

    const trigger = variant === "card" ? (
        <Box
            w="full"
            maxW="520px"
            bg="brand.cardBg"
            border="1px solid"
            borderColor="brand.border"
            rounded="card"
            p={[5, 6]}
            cursor="pointer"
            onClick={handleClick}
            transition="all 0.15s ease"
            _hover={{ borderColor: "brand.primary" }}
        >
            <Flex alignItems="center" gap={2}>
                <DownloadIcon style={{ fontSize: "20px", color: "var(--chakra-colors-brand-primary)" }} />
                <Text fontSize="lg" fontWeight="semibold" color="brand.textPrimary">
                    Export Library
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
            <Text fontSize="xs" color="brand.textMuted" mt={2}>
                Download your library as CSV or JSON.
            </Text>
        </Box>
    ) : (
        <Box position="relative">
            <IconButton
                variant="surface"
                size="xs"
                h={7}
                w={7}
                px={0}
                aria-label="Export library"
                onClick={handleClick}
            >
                <DownloadIcon style={{ fontSize: "14px" }} />
            </IconButton>
            {!isPro && (
                <Flex
                    position="absolute"
                    top="-5px"
                    right="-5px"
                    alignItems="center"
                    justifyContent="center"
                    bg="brand.primarySubtle"
                    color="brand.primary"
                    rounded="full"
                    h="14px"
                    w="14px"
                    pointerEvents="none"
                >
                    <StarIcon style={{ fontSize: "9px" }} />
                </Flex>
            )}
        </Box>
    );

    return (
        <>
            {trigger}

            <Dialog.Root
                placement="center"
                open={open}
                onOpenChange={(details) => {
                    if (!details.open) setOpen(false);
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
                                    Export Library
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
                                <Flex direction="column" gap={3}>
                                    <FormatOption
                                        label="CSV"
                                        description="Spreadsheet-compatible format for Excel, Google Sheets, etc."
                                        selected={format === "csv"}
                                        onClick={() => setFormat("csv")}
                                    />
                                    <FormatOption
                                        label="JSON"
                                        description="Structured data format for developers and tools"
                                        selected={format === "json"}
                                        onClick={() => setFormat("json")}
                                    />
                                </Flex>
                            </Box>

                            <Flex
                                gap={3}
                                px={[4, 5]}
                                py={4}
                                justifyContent="flex-end"
                                css={{
                                    backdropFilter: "blur(16px)",
                                    WebkitBackdropFilter: "blur(16px)",
                                    background:
                                        "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                    borderTop:
                                        "1px solid var(--chakra-colors-brand-divider)",
                                }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    loading={exporting}
                                    onClick={handleExport}
                                    css={{
                                        "& .chakra-spinner": {
                                            WebkitAnimation:
                                                "spin 1s linear infinite",
                                            animation:
                                                "spin 1s linear infinite",
                                        },
                                    }}
                                >
                                    Download
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};

function FormatOption({
    label,
    description,
    selected,
    onClick,
}: {
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <Flex
            px={3}
            py={2.5}
            rounded="lg"
            cursor="pointer"
            border="1px solid"
            borderColor={selected ? "brand.primary" : "brand.border"}
            bg={selected ? "brand.primarySubtle" : "transparent"}
            onClick={onClick}
            direction="column"
            gap={0.5}
            transition="all 0.15s ease"
            _hover={{ borderColor: "brand.primary" }}
        >
            <Text
                fontSize="sm"
                fontWeight="semibold"
                color={selected ? "brand.primary" : "brand.textPrimary"}
            >
                {label}
            </Text>
            <Text fontSize="xs" color="brand.textMuted">
                {description}
            </Text>
        </Flex>
    );
}

LibraryExportButton.displayName = "LibraryExportButton";

export default LibraryExportButton;

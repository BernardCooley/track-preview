"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    IconButton,
    Text,
} from "@chakra-ui/react";
import {
    spotifyAuthorize,
    spotifyExportPlaylist,
    spotifyPlaylists,
    UnauthorisedError,
} from "@/bff/bff";
import { useAuthContext } from "../../Contexts/AuthContext";
import { toaster } from "@/components/toaster";
import IosShareIcon from "@mui/icons-material/IosShare";
import AddIcon from "@mui/icons-material/Add";
import StarIcon from "@mui/icons-material/Star";

interface Props {
    requirePro: (featureName: string) => boolean;
    isPro: boolean;
}

type ExportMode = "default" | "new" | "existing";

const SpotifyExportButton = ({ requirePro, isPro }: Props) => {
    const { user, userProfile } = useAuthContext();
    const [open, setOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [mode, setMode] = useState<ExportMode>("default");
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [playlists, setPlaylists] = useState<
        { id: string; name: string }[]
    >([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
        null
    );

    const isSpotifyConnected = !!userProfile?.spotifyAccessToken;

    const handleClick = useCallback(async () => {
        if (!requirePro("Spotify Export")) return;

        if (!isSpotifyConnected) {
            if (!user?.uid) return;
            const result = await spotifyAuthorize({ userId: user.uid });
            if (result?.url) {
                window.location.href = result.url;
            }
            return;
        }

        setOpen(true);
        setMode("default");
        setNewPlaylistName("");
        setSelectedPlaylistId(null);
    }, [requirePro, isSpotifyConnected, user?.uid]);

    useEffect(() => {
        if (!open || mode !== "existing" || !user?.uid) return;
        setLoadingPlaylists(true);
        spotifyPlaylists({ userId: user.uid })
            .then((result) => {
                setPlaylists(result?.playlists ?? []);
            })
            .finally(() => setLoadingPlaylists(false));
    }, [open, mode, user?.uid]);

    const handleExport = useCallback(async () => {
        if (!user?.uid) return;
        setExporting(true);

        try {
            const params: {
                userId: string;
                playlistId?: string;
                playlistName?: string;
            } = { userId: user.uid };

            if (mode === "existing" && selectedPlaylistId) {
                params.playlistId = selectedPlaylistId;
            } else if (mode === "new" && newPlaylistName.trim()) {
                params.playlistName = newPlaylistName.trim();
            }

            const result = await spotifyExportPlaylist(params);

            if (result) {
                setOpen(false);
                toaster.create({
                    title: "Playlist exported!",
                    description: `${result.matchedTracks} of ${result.totalLibraryTracks} tracks added.`,
                    type: "success",
                    duration: 8000,
                    action: {
                        label: "Open in Spotify",
                        onClick: () =>
                            window.open(result.playlistUrl, "_blank"),
                    },
                });
            }
        } catch (err) {
            if (err instanceof UnauthorisedError) {
                setOpen(false);
                const result = await spotifyAuthorize({ userId: user.uid });
                if (result?.url) {
                    window.location.href = result.url;
                }
                return;
            }
            toaster.create({
                title: "Export failed",
                description: "Could not export to Spotify. Please try again.",
                type: "error",
                duration: 5000,
            });
        } finally {
            setExporting(false);
        }
    }, [user?.uid, mode, selectedPlaylistId, newPlaylistName]);

    const canExport =
        mode === "default" ||
        (mode === "new" && newPlaylistName.trim().length > 0) ||
        (mode === "existing" && selectedPlaylistId);

    return (
        <>
            <Box position="relative">
                <IconButton
                    variant="surface"
                    size="xs"
                    h={7}
                    w={7}
                    px={0}
                    aria-label="Export to Spotify"
                    onClick={handleClick}
                >
                    <IosShareIcon style={{ fontSize: "14px" }} />
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

            <Dialog.Root
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
                                    Export to Spotify
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
                                    <ExportOption
                                        label="Update Phoniquest Library"
                                        description="Syncs your library to a single playlist"
                                        selected={mode === "default"}
                                        onClick={() => setMode("default")}
                                    />

                                    <ExportOption
                                        label="Create new playlist"
                                        description="Creates a new playlist with a custom name"
                                        selected={mode === "new"}
                                        onClick={() => setMode("new")}
                                    />

                                    {mode === "new" && (
                                        <Box pl={4}>
                                            <input
                                                type="text"
                                                placeholder="Playlist name"
                                                value={newPlaylistName}
                                                onChange={(e) =>
                                                    setNewPlaylistName(
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    width: "100%",
                                                    padding: "8px 12px",
                                                    borderRadius: "8px",
                                                    border: "1px solid var(--chakra-colors-brand-border)",
                                                    background:
                                                        "var(--chakra-colors-brand-surface)",
                                                    color: "var(--chakra-colors-brand-text-primary)",
                                                    fontSize: "14px",
                                                    outline: "none",
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <ExportOption
                                        label="Update existing playlist"
                                        description="Replaces tracks in one of your playlists"
                                        selected={mode === "existing"}
                                        onClick={() => setMode("existing")}
                                    />

                                    {mode === "existing" && (
                                        <Box
                                            pl={4}
                                            maxH="200px"
                                            overflowY="auto"
                                            css={{
                                                "&::-webkit-scrollbar": {
                                                    width: "4px",
                                                },
                                                "&::-webkit-scrollbar-thumb": {
                                                    background:
                                                        "var(--chakra-colors-brand-scrollbar-thumb)",
                                                    borderRadius: "4px",
                                                },
                                            }}
                                        >
                                            {loadingPlaylists ? (
                                                <Text
                                                    fontSize="sm"
                                                    color="brand.textMuted"
                                                >
                                                    Loading playlists...
                                                </Text>
                                            ) : playlists.length === 0 ? (
                                                <Text
                                                    fontSize="sm"
                                                    color="brand.textMuted"
                                                >
                                                    No playlists found
                                                </Text>
                                            ) : (
                                                <Flex
                                                    direction="column"
                                                    gap={1}
                                                >
                                                    {playlists.map((p) => (
                                                        <Flex
                                                            key={p.id}
                                                            px={3}
                                                            py={2}
                                                            rounded="md"
                                                            cursor="pointer"
                                                            bg={
                                                                selectedPlaylistId ===
                                                                p.id
                                                                    ? "brand.primarySubtle"
                                                                    : "transparent"
                                                            }
                                                            color={
                                                                selectedPlaylistId ===
                                                                p.id
                                                                    ? "brand.primary"
                                                                    : "brand.textSecondary"
                                                            }
                                                            _hover={{
                                                                bg: "brand.surfaceHover",
                                                            }}
                                                            onClick={() =>
                                                                setSelectedPlaylistId(
                                                                    p.id
                                                                )
                                                            }
                                                        >
                                                            <Text fontSize="sm">
                                                                {p.name}
                                                            </Text>
                                                        </Flex>
                                                    ))}
                                                </Flex>
                                            )}
                                        </Box>
                                    )}
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
                                    disabled={!canExport}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
};

function ExportOption({
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

SpotifyExportButton.displayName = "SpotifyExportButton";

export default SpotifyExportButton;

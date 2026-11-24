import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Text,
    Textarea,
} from "@chakra-ui/react";
import StarIcon from "@mui/icons-material/Star";
import { Track } from "../../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    track: Track | null;
    onSave: (notes: string | null) => void;
    saving: boolean;
    isPro: boolean;
    requirePro: (featureName: string) => boolean;
}

const TrackNotesDialog = ({ isOpen, onClose, track, onSave, saving, isPro, requirePro }: Props) => {
    const [value, setValue] = useState("");
    const [editing, setEditing] = useState(false);

    const hasExistingNote = !!track?.notes;

    useEffect(() => {
        if (isOpen && track) {
            setValue(track.notes ?? "");
            setEditing(!track.notes);
        }
    }, [isOpen, track]);

    const handleSave = () => {
        const trimmed = value.trim();
        onSave(trimmed.length > 0 ? trimmed : null);
    };

    const handleClose = () => {
        setEditing(false);
        onClose();
    };

    return (
        <Dialog.Root
            placement="center"
            open={isOpen}
            onOpenChange={(details) => {
                if (!details.open) handleClose();
            }}
            closeOnEscape
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content
                    minH="auto"
                    m={[3, 6]}
                    bg="brand.bg"
                    shadow="2xl"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="modal"
                    overflow="hidden"
                >
                    <Flex direction="column" h="full">
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
                                {editing ? (hasExistingNote ? "Edit Note" : "Add Note") : "Note"}
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
                                {track && (
                                    <Box
                                        bg="brand.surface"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        p={3}
                                        rounded="lg"
                                    >
                                        <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            color="brand.textPrimary"
                                        >
                                            {track.title}
                                        </Text>
                                        <Text fontSize="sm" color="brand.textSecondary">
                                            {track.artist}
                                        </Text>
                                    </Box>
                                )}
                                {editing ? (
                                    <Textarea
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder="Add your notes here..."
                                        rows={4}
                                        resize="vertical"
                                        bg="brand.surface"
                                        border="1px solid"
                                        borderColor="brand.border"
                                        color="brand.textPrimary"
                                        _placeholder={{ color: "brand.textMuted" }}
                                        rounded="lg"
                                        fontSize="sm"
                                        p={3}
                                        autoFocus
                                    />
                                ) : (
                                    <Text
                                        fontSize="sm"
                                        color="brand.textSecondary"
                                        css={{ whiteSpace: "pre-wrap" }}
                                    >
                                        {track?.notes}
                                    </Text>
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
                            {editing ? (
                                <>
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleSave} loading={saving}>
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {isPro && (
                                        <Button
                                            variant="warning"
                                            mr="auto"
                                            onClick={() => onSave(null)}
                                            loading={saving}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                    <Button variant="outline" onClick={handleClose}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={() => {
                                        if (!requirePro("Track Notes")) return;
                                        setEditing(true);
                                    }}>
                                        <Flex alignItems="center" gap={1.5}>
                                            <Text>Edit</Text>
                                            {!isPro && (
                                                <Flex
                                                    alignItems="center"
                                                    bg="whiteAlpha.300"
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
                                    </Button>
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};

export default TrackNotesDialog;

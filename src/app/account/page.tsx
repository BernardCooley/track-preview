"use client";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Heading,
    IconButton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Center } from "@chakra-ui/react";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";
import {
    DeleteUser,
    LogOut,
    UpdateUserEmail,
    UpdateUserPassword,
} from "../../../firebase/utils";
import { sendVerificationEmail, spotifyDisconnect, getUserProfile } from "@/bff/bff";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import EditIcon from "@mui/icons-material/Edit";
import {
    onAuthStateChanged,
    User as UserAccount,
} from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import { User } from "../../../types";
import { TextInput } from "@/components/TextInput";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AuthGuard from "@/components/AuthGuard";
import { useAuthContext } from "../../../Contexts/AuthContext";

const Settings = () => {
    const { open: isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const { userProfile, updateUserProfile } = useAuthContext();
    const [disconnectingSpotify, setDisconnectingSpotify] = useState(false);
    const [editingEmail, setEditingEmail] = useState<boolean>(false);
    const [editingPassword, setEditingPassword] = useState<boolean>(false);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [newEmail, setNewEmail] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [errors, setErrors] = useState<{
        email: string;
        currentPassword: string;
        password: string;
    }>({ email: "", currentPassword: "", password: "" });
    const id = "accountToast";
    const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [emailUpdated, setEmailUpdated] = useState<boolean>(false);
    const [updatedEmail, setUpdatedEmail] = useState<string>("");

    const showToast = useCallback(
        ({ type, title, description, duration }: { type?: string; title?: string; description?: string; duration?: number }) => {
            toaster.create({
                id,
                title: title || "An error has occured.",
                description: description || "Please try again later.",
                type: (type as "success" | "error" | "warning" | "info") || "error",
                duration: duration || 5000,
            });
        },
        []
    );

    const isUserLoggedIn = useCallback(async () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await user.reload();
                const refreshed = auth.currentUser;
                if (refreshed && refreshed.email && refreshed.uid) {
                    setUserAccount(refreshed);
                    setUser({ email: refreshed.email, uid: refreshed.uid });
                }
            }
        });
    }, []);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    useEffect(() => {
        if (!user?.uid) return;
        getUserProfile({ userId: user.uid }).then((profile) => {
            if (profile) updateUserProfile(profile);
        });
    }, [user?.uid]);

    const logout = async () => {
        LogOut(router);
    };

    const deleteAccount = async () => {
        setDeleting(true);
        try {
            await DeleteUser();
            router.push("/");
        } catch (error: any) {
            setDeleting(false);
            if (error.code === "auth/requires-recent-login") {
                showToast({
                    title: "Please log in again to delete your account.",
                    description: "Redirecting you to the login page...",
                    type: "info",
                });
                setTimeout(() => {
                    router.push("/loginRegister?login=true&isAttemptingAccountEdit=true");
                }, 5000);
            } else {
                showToast({
                    title: "Error deleting account.",
                    description: "Please try again later.",
                    type: "error",
                });
            }
        }
    };

    const updateEmailAddress = async (newEmail: string) => {
        if (userAccount) {
            try {
                await UpdateUserEmail(newEmail, userAccount);
                await sendVerificationEmail(newEmail);
                setUpdatedEmail(newEmail);
                setEmailUpdated(true);
                setTimeout(async () => {
                    await LogOut(router, "/loginRegister?login=true&verifyEmail=true");
                }, 8000);
            } catch (error: any) {
                if (error.code === "auth/requires-recent-login") {
                    showToast({
                        title: "Please log in again to make changes to your account.",
                        description: "Redirecting you to the login page...",
                        type: "info",
                    });
                    setTimeout(() => {
                        router.push(
                            "/loginRegister?login=true&isAttemptingAccountEdit=true"
                        );
                    }, 5000);
                } else {
                    showToast({
                        title: "Error updating email.",
                        description: "Please try again later.",
                        type: "error",
                    });
                }
            }
        }
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        if (userAccount) {
            try {
                await UpdateUserPassword(currentPassword, newPassword, userAccount);
                showToast({
                    title: "Password updated.",
                    description: "Your password has been updated successfully.",
                    type: "success",
                });
                resetPasswordState();
            } catch (error: any) {
                if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
                    setErrors((prev) => ({
                        ...prev,
                        currentPassword: "Current password is incorrect.",
                    }));
                } else {
                    showToast({
                        title: "Error updating password.",
                        description: "Please try again later.",
                        type: "error",
                    });
                }
            }
        }
    };

    const resetEmailState = () => {
        setEmailTouched(false);
        setEditingEmail(false);
        setNewEmail("");
        setErrors((prev) => ({ ...prev, email: "" }));
    };

    const resetPasswordState = () => {
        setPasswordTouched(false);
        setEditingPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setShowPassword(false);
        setErrors((prev) => ({ ...prev, currentPassword: "", password: "" }));
    };

    const isSpotifyConnected = !!userProfile?.spotifyAccessToken;

    const handleDisconnectSpotify = async () => {
        if (!user?.uid) return;
        setDisconnectingSpotify(true);
        try {
            await spotifyDisconnect({ userId: user.uid });
            if (userProfile) {
                updateUserProfile({
                    ...userProfile,
                    spotifyAccessToken: null,
                    spotifyRefreshToken: null,
                    spotifyTokenExpiresAt: null,
                });
            }
            showToast({
                title: "Spotify disconnected",
                description: "You can reconnect anytime from your library.",
                type: "success",
            });
        } catch {
            showToast({
                title: "Failed to disconnect Spotify",
                description: "Please try again later.",
                type: "error",
            });
        } finally {
            setDisconnectingSpotify(false);
        }
    };

    if (deleting) {
        return (
            <Center h="100dvh" flexDirection="column" gap={6} bg="brand.bg">
                <Text
                    fontSize={["3xl", "4xl", "5xl"]}
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wider"
                >
                    PHONIQUEST
                </Text>
                <Text color="brand.textSecondary" fontSize="md">
                    Deleting your account...
                </Text>
                <BouncingDotsLoader />
            </Center>
        );
    }

    if (emailUpdated) {
        return (
            <Flex direction="column" minH="100dvh" bg="brand.bg">
                <BackHeader title="Account" />
                <Center flex={1} flexDirection="column" gap={6} px={[4, 6]}>
                    <Box
                        w="64px"
                        h="64px"
                        rounded="full"
                        bg="brand.successSubtle"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="brand.success"
                        fontSize="2xl"
                    >
                        ✓
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color="brand.textPrimary">
                        Email updated
                    </Text>
                    <Text fontSize="md" color="brand.textSecondary" maxW="320px" textAlign="center">
                        A confirmation email has been sent to{" "}
                        <strong>{updatedEmail}</strong>. Please verify your new email address.
                    </Text>
                    <Text fontSize="sm" color="brand.textMuted">
                        Redirecting to sign in...
                    </Text>
                </Center>
            </Flex>
        );
    }

    return (
        <Flex direction="column" minH="100dvh" bg="brand.bg">
            <Dialog.Root
                role="alertdialog"
                open={isOpen}
                onOpenChange={(details) => { if (!details.open) onClose(); }}
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
                                    Delete Account
                                </Text>
                                <Dialog.CloseTrigger
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
                                mx={[4, 5]}
                            />

                            <Box px={[4, 5]} py={5}>
                                <Flex direction="column" gap={3}>
                                    <Text color="brand.textSecondary" fontSize="sm">
                                        {`Are you sure? You can't undo this action afterwards.`}
                                    </Text>
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
                                    background: "color-mix(in srgb, var(--chakra-colors-brand-bg) 80%, transparent)",
                                    borderTop: "1px solid var(--chakra-colors-brand-divider)",
                                }}
                            >
                                <Button
                                    ref={cancelRef}
                                    variant="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="warning"
                                    onClick={async () => {
                                        deleteAccount();
                                        onClose();
                                    }}
                                >
                                    Delete account
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            <BackHeader title="Account" />

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
                        Account Settings
                    </Text>

                    <Flex direction="column" gap={6}>
                        <Box
                            opacity={editingPassword ? 0.3 : 1}
                            pointerEvents={editingPassword ? "none" : "auto"}
                            transition="opacity 0.2s ease"
                        >
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Email address
                            </Heading>
                            <Flex
                                w="full"
                                justifyContent="space-between"
                                alignItems="center"
                                gap={3}
                            >
                                {editingEmail ? (
                                    <Flex direction="column" gap={3} flex={1}>
                                        <TextInput
                                            error={errors.email}
                                            helperText="Enter your new email address"
                                            title=""
                                            size="md"
                                            fieldProps={{
                                                onChange: (e) => {
                                                    if (e.target.value !== user?.email) {
                                                        const emailRegex =
                                                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                        if (emailRegex.test(e.target.value)) {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                email: "",
                                                            }));
                                                        } else {
                                                            setErrors((prev) => ({
                                                                ...prev,
                                                                email: "Email invalid",
                                                            }));
                                                        }
                                                        setNewEmail(e.target.value);
                                                        setEmailTouched(true);
                                                    } else {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            email: "",
                                                        }));
                                                        setNewEmail(e.target.value);
                                                        setEmailTouched(false);
                                                    }
                                                },
                                                value: newEmail,
                                            }}
                                        />
                                        <Flex gap={3} justifyContent="flex-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => resetEmailState()}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={
                                                    !emailTouched ||
                                                    errors.email !== ""
                                                }
                                                onClick={() => {
                                                    updateEmailAddress(newEmail);
                                                    resetEmailState();
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Flex>
                                    </Flex>
                                ) : (
                                    <>
                                        <Text color="brand.textPrimary" fontSize="md">
                                            {user?.email}
                                        </Text>
                                        <IconButton
                                            variant="tertiary"
                                            onClick={() => {
                                                setNewEmail(user?.email || "");
                                                setEditingEmail(true);
                                            }}
                                            aria-label="Edit"
                                            color="brand.textSecondary"
                                            size="sm"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Flex>
                        </Box>

                        <Box
                            borderTop="1px solid"
                            borderTopColor="brand.divider"
                            pt={6}
                            opacity={editingEmail ? 0.3 : 1}
                            pointerEvents={editingEmail ? "none" : "auto"}
                            transition="opacity 0.2s ease"
                        >
                            <Heading
                                size="xs"
                                textTransform="uppercase"
                                fontSize="xs"
                                letterSpacing="wider"
                                color="brand.textMuted"
                                mb={2}
                            >
                                Password
                            </Heading>
                            <Flex
                                w="full"
                                justifyContent="space-between"
                                alignItems="center"
                                gap={3}
                            >
                                {editingPassword ? (
                                    <Flex direction="column" gap={3} flex={1}>
                                        <TextInput
                                            type={showPassword ? "text" : "password"}
                                            error={errors.currentPassword}
                                            helperText="Enter your current password"
                                            title=""
                                            size="md"
                                            fieldProps={{
                                                onChange: (e) => {
                                                    setCurrentPassword(e.target.value);
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        currentPassword: "",
                                                    }));
                                                    setPasswordTouched(
                                                        e.target.value.length > 0 &&
                                                        newPassword.length >= 6
                                                    );
                                                },
                                                value: currentPassword,
                                            }}
                                            rightIcon={
                                                <IconButton
                                                    position="absolute"
                                                    right={2}
                                                    top="50%"
                                                    transform="translateY(-50%)"
                                                    variant="tertiary"
                                                    onClick={() =>
                                                        setShowPassword((prev) => !prev)
                                                    }
                                                    aria-label="Toggle password visibility"
                                                    color="brand.textMuted"
                                                    size="sm"
                                                >
                                                    {showPassword ? (
                                                        <VisibilityIcon fontSize="small" />
                                                    ) : (
                                                        <VisibilityOffIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            }
                                        />
                                        <TextInput
                                            type={showPassword ? "text" : "password"}
                                            error={errors.password}
                                            helperText="Enter your new password"
                                            title=""
                                            size="md"
                                            fieldProps={{
                                                onChange: (e) => {
                                                    if (e.target.value.length >= 6) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            password: "",
                                                        }));
                                                        setNewPassword(e.target.value);
                                                        setPasswordTouched(
                                                            currentPassword.length > 0
                                                        );
                                                    } else {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            password:
                                                                "Password must be at least 6 characters long.",
                                                        }));
                                                        setNewPassword(e.target.value);
                                                        setPasswordTouched(false);
                                                    }
                                                },
                                                value: newPassword,
                                            }}
                                        />
                                        <Flex gap={3} justifyContent="flex-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => resetPasswordState()}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={
                                                    !passwordTouched ||
                                                    errors.password !== "" ||
                                                    errors.currentPassword !== ""
                                                }
                                                onClick={() => {
                                                    updatePassword(currentPassword, newPassword);
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Flex>
                                    </Flex>
                                ) : (
                                    <>
                                        <Text color="brand.textPrimary" fontSize="md">
                                            **********
                                        </Text>
                                        <IconButton
                                            variant="tertiary"
                                            onClick={() => setEditingPassword(true)}
                                            aria-label="Edit"
                                            color="brand.textSecondary"
                                            size="sm"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}
                            </Flex>
                        </Box>

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
                                Spotify
                            </Heading>
                            <Flex
                                w="full"
                                justifyContent="space-between"
                                alignItems="center"
                                gap={3}
                            >
                                <Text color="brand.textSecondary" fontSize="sm">
                                    {isSpotifyConnected ? "Connected" : "Not connected"}
                                </Text>
                                {isSpotifyConnected && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        loading={disconnectingSpotify}
                                        onClick={handleDisconnectSpotify}
                                    >
                                        Disconnect
                                    </Button>
                                )}
                            </Flex>
                        </Box>
                    </Flex>
                </Box>

                <Flex
                    w="full"
                    maxW="520px"
                    mt={6}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Button variant="outline" onClick={logout} disabled={editingEmail || editingPassword}>
                        Log out
                    </Button>
                    <Button variant="cancel" onClick={onOpen} disabled={editingEmail || editingPassword}>
                        Delete account
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

const AccountPage = () => (
    <AuthGuard>
        <Settings />
    </AuthGuard>
);

export default AccountPage;

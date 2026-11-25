"use client";
import {
    Box,
    Button,
    Dialog,
    Flex,
    Heading,
    IconButton,
    Skeleton,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { Center } from "@chakra-ui/react";
import AccountSkeleton from "@/components/skeletons/AccountSkeleton";
import {
    DeleteUser,
    LogOut,
    UpdateUserEmail,
    UpdateUserPassword,
} from "../../../firebase/utils";
import { sendVerificationEmail, spotifyDisconnect, getUserProfile, createPortalSession, createCheckoutSession, syncSubscription, requestRefund } from "@/bff/bff";
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
import { useSubscription } from "@/hooks/useSubscription";
import { proFeatures } from "@/config/proFeatures";

const Settings = () => {
    const { open: isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const { userProfile, updateUserProfile } = useAuthContext();
    const { subscriptionsEnabled, subscriptionTier, subscriptionStatus } = useSubscription();
    const [managingSubscription, setManagingSubscription] = useState(false);
    const [requestingRefund, setRequestingRefund] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [showProFeatures, setShowProFeatures] = useState(false);
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
    const showDeletingSkeleton = useDelayedLoading(deleting);
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
        const load = async () => {
            await syncSubscription({ userId: user.uid }).catch(() => {});
            const profile = await getUserProfile({ userId: user.uid });
            if (profile) updateUserProfile(profile);
        };
        load();
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

    const handleManageSubscription = async () => {
        if (!user?.uid) return;
        setManagingSubscription(true);
        try {
            const result = await createPortalSession({ userId: user.uid });
            if (result?.url) {
                window.location.href = result.url;
            }
        } catch {
            showToast({
                title: "Failed to open billing portal",
                description: "Please try again later.",
                type: "error",
            });
            setManagingSubscription(false);
        }
    };

    const handleUpgrade = async () => {
        if (!user?.uid) return;
        setManagingSubscription(true);
        try {
            const result = await createCheckoutSession({ userId: user.uid });
            if (result?.url) {
                window.location.href = result.url;
            }
        } catch {
            showToast({
                title: "Failed to start checkout",
                description: "Please try again later.",
                type: "error",
            });
            setManagingSubscription(false);
        }
    };

    const handleRefund = async () => {
        if (!user?.uid) return;
        setRequestingRefund(true);
        try {
            await requestRefund({ userId: user.uid });
            showToast({
                title: "Refund processed",
                description: "Your refund has been issued. It may take 5-10 business days to appear.",
                type: "success",
                duration: 8000,
            });
            const profile = await getUserProfile({ userId: user.uid });
            if (profile) updateUserProfile(profile);
        } catch {
            showToast({
                title: "Failed to process refund",
                description: "Please try again or contact info@phoniquest.com.",
                type: "error",
            });
        } finally {
            setRequestingRefund(false);
            setShowRefundConfirm(false);
        }
    };

    const isWithinRefundWindow = () => {
        if (!userProfile?.subscriptionStartedAt) return false;
        const daysSince = Math.floor(
            (Date.now() - new Date(userProfile.subscriptionStartedAt).getTime()) /
                (1000 * 60 * 60 * 24)
        );
        return daysSince <= 14;
    };

    const getRefundDaysLeft = () => {
        if (!userProfile?.subscriptionStartedAt) return 0;
        const daysSince = Math.floor(
            (Date.now() - new Date(userProfile.subscriptionStartedAt).getTime()) /
                (1000 * 60 * 60 * 24)
        );
        return Math.max(0, 14 - daysSince);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const isActuallyPro = subscriptionTier === "PRO";

    const getStatusLabel = () => {
        if (!isActuallyPro) return null;
        if (subscriptionStatus === "PAST_DUE") return "Past due";
        if (subscriptionStatus === "CANCELED") return "Cancelled";
        return "Active";
    };

    const getStatusColor = () => {
        if (subscriptionStatus === "PAST_DUE") return "orange.400";
        if (subscriptionStatus === "CANCELED") return "red.400";
        return "green.400";
    };

    if (deleting) {
        return showDeletingSkeleton ? <AccountSkeleton /> : null;
    }

    if (emailUpdated) {
        return (
            <Flex direction="column" minH="100dvh" bg="brand.bg">
                <BackHeader title="Account" href="/explore" />
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

            <Dialog.Root
                role="alertdialog"
                open={showRefundConfirm}
                onOpenChange={(details) => { if (!details.open) setShowRefundConfirm(false); }}
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
                                    Request Refund
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
                                        Your Pro subscription will be cancelled immediately and a full refund will be issued. It may take 5-10 business days to appear on your statement.
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
                                    variant="outline"
                                    onClick={() => setShowRefundConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="warning"
                                    loading={requestingRefund}
                                    onClick={handleRefund}
                                >
                                    Confirm refund
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            <BackHeader title="Account" href="/explore" />

            <Flex
                flex={1}
                direction="column"
                alignItems="center"
                px={[4, 6]}
                py={[6, 8]}
            >
                {subscriptionsEnabled && !userProfile && (
                    <Box
                        w="full"
                        maxW="520px"
                        bg="brand.cardBg"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="card"
                        p={[5, 6]}
                        mb={4}
                    >
                        <Text
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            mb={6}
                        >
                            Subscription
                        </Text>

                        <Flex direction="column" gap={4}>
                            <Flex justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Heading
                                        size="xs"
                                        textTransform="uppercase"
                                        fontSize="xs"
                                        letterSpacing="wider"
                                        color="brand.textMuted"
                                        mb={1}
                                    >
                                        Current plan
                                    </Heading>
                                    <Skeleton h="20px" w="40px" />
                                </Box>
                            </Flex>

                            <Box borderTop="1px solid" borderTopColor="brand.divider" pt={4}>
                                <Flex direction="column" gap={3}>
                                    <Skeleton h="32px" w="130px" rounded="lg" />
                                    <Skeleton h="20px" w="110px" />
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                )}

                {subscriptionsEnabled && userProfile && <Box
                    w="full"
                    maxW="520px"
                    bg="brand.cardBg"
                    border="1px solid"
                    borderColor="brand.border"
                    rounded="card"
                    p={[5, 6]}
                    mb={4}
                >
                    <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color="brand.textPrimary"
                        mb={6}
                    >
                        Subscription
                    </Text>

                    <Flex direction="column" gap={4}>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Box>
                                <Heading
                                    size="xs"
                                    textTransform="uppercase"
                                    fontSize="xs"
                                    letterSpacing="wider"
                                    color="brand.textMuted"
                                    mb={1}
                                >
                                    Current plan
                                </Heading>
                                <Flex alignItems="center" gap={2}>
                                    <Text color="brand.textPrimary" fontSize="md" fontWeight="medium">
                                        {isActuallyPro ? "Pro" : "Free"}
                                    </Text>
                                    {isActuallyPro && getStatusLabel() && (
                                        <Text
                                            fontSize="xs"
                                            fontWeight="semibold"
                                            color={getStatusColor()}
                                        >
                                            {getStatusLabel()}
                                        </Text>
                                    )}
                                </Flex>
                            </Box>
                        </Flex>

                        {isActuallyPro && userProfile?.subscriptionExpiresAt && (
                            <Box>
                                <Heading
                                    size="xs"
                                    textTransform="uppercase"
                                    fontSize="xs"
                                    letterSpacing="wider"
                                    color="brand.textMuted"
                                    mb={1}
                                >
                                    {subscriptionStatus === "CANCELED" ? "Access until" : "Renews"}
                                </Heading>
                                <Text color="brand.textPrimary" fontSize="md">
                                    {formatDate(userProfile.subscriptionExpiresAt)}
                                </Text>
                                {subscriptionStatus === "CANCELED" && (
                                    <Text color="brand.textSecondary" fontSize="sm" mt={2}>
                                        Your subscription has been cancelled but you can continue using Pro features until {formatDate(userProfile.subscriptionExpiresAt)}. You can resubscribe anytime.
                                    </Text>
                                )}
                            </Box>
                        )}

                        <Box borderTop="1px solid" borderTopColor="brand.divider" pt={4}>
                            {isActuallyPro ? (
                                <Flex direction="column" gap={3}>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        loading={managingSubscription}
                                        onClick={handleManageSubscription}
                                    >
                                        Manage subscription
                                    </Button>
                                    {subscriptionStatus === "ACTIVE" && isWithinRefundWindow() && (
                                        <Text
                                            as="button"
                                            fontSize="sm"
                                            color="brand.textMuted"
                                            cursor="pointer"
                                            _hover={{ color: "brand.textSecondary" }}
                                            transition="color 0.15s ease"
                                            onClick={() => setShowRefundConfirm(true)}
                                        >
                                            Request refund ({getRefundDaysLeft()} days left)
                                        </Text>
                                    )}
                                </Flex>
                            ) : (
                                <Flex direction="column" gap={3}>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        loading={managingSubscription}
                                        onClick={handleUpgrade}
                                    >
                                        Upgrade to Pro
                                    </Button>
                                    <Box>
                                        <Text
                                            as="button"
                                            fontSize="sm"
                                            color="brand.textMuted"
                                            cursor="pointer"
                                            _hover={{ color: "brand.textSecondary" }}
                                            transition="color 0.15s ease"
                                            onClick={() => setShowProFeatures((v) => !v)}
                                        >
                                            {showProFeatures ? "Hide details" : "What's included?"}
                                        </Text>
                                        {showProFeatures && (
                                            <Flex direction="column" gap={1.5} mt={3}>
                                                {proFeatures.map((f) => (
                                                    <Text
                                                        key={f.text}
                                                        color="brand.textSecondary"
                                                        fontSize="sm"
                                                    >
                                                        • {f.text}
                                                    </Text>
                                                ))}
                                            </Flex>
                                        )}
                                    </Box>
                                </Flex>
                            )}
                        </Box>
                    </Flex>
                </Box>}

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

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
import {
    DeleteUser,
    LogOut,
    SendVerificationEmail,
    UpdateUserEmail,
    UpdateUserPassword,
} from "../../../firebase/utils";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
    getAuth,
    onAuthStateChanged,
    User as UserAccount,
} from "firebase/auth";
import { auth } from "../../../firebase/firebaseInit";
import { User } from "../../../types";
import CloseIcon from "@mui/icons-material/Close";
import { TextInput } from "@/components/TextInput";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Settings = () => {
    const { open: isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const [editingEmail, setEditingEmail] = useState<boolean>(false);
    const [editingPassword, setEditingPassword] = useState<boolean>(false);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [newEmail, setNewEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [errors, setErrors] = useState<{
        email: string;
        password: string;
    }>({ email: "", password: "" });
    const id = "accountToast";
    const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);

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
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                setUserAccount(user);
                setUser({ email: user.email, uid: user.uid });
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    const logout = async () => {
        LogOut(router);
    };

    const deleteAccount = async () => {
        try {
            await DeleteUser();
            router.push("/loginRegister?login=false?accountDeleted=true");
        } catch (error: any) {
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
                const auth = getAuth();
                if (auth?.currentUser) {
                    await SendVerificationEmail(auth.currentUser);
                }
                showToast({
                    title: "Email updated.",
                    description:
                        "Your email has been updated. A verification email has been sent to your new email address.",
                    type: "success",
                });
                setTimeout(async () => {
                    await LogOut(router, "/loginRegister?login=true");
                }, 5000);
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

    const updatePassword = async (newPassword: string) => {
        if (userAccount) {
            try {
                await UpdateUserPassword(newPassword, userAccount);
                showToast({
                    title: "Password updated.",
                    description:
                        "Your password has been updated. Please log in again with your new password.",
                    type: "success",
                });
                setTimeout(async () => {
                    await LogOut(router, "/loginRegister?login=true");
                }, 5000);
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

    const resetEmailState = () => {
        setEmailTouched(false);
        setEditingEmail(false);
        setErrors((prev) => ({ ...prev, email: "" }));
    };

    const resetPasswordState = () => {
        setPasswordTouched(false);
        setEditingPassword(false);
        setErrors((prev) => ({ ...prev, password: "" }));
    };

    interface FieldIconsProps {
        isEditing: boolean;
        touched: boolean;
        isErrors: boolean;
        onSaveClick: () => void;
        onEditClick: () => void;
        onCancelClick: () => void;
    }

    const FieldIcons = ({
        isEditing,
        touched,
        isErrors,
        onSaveClick,
        onEditClick,
        onCancelClick,
    }: FieldIconsProps) => {
        return (
            <Flex gap={1} alignItems="center">
                {touched && !isErrors && (
                    <IconButton
                        variant="tertiary"
                        onClick={onSaveClick}
                        aria-label="Save"
                        color="brand.success"
                        size="sm"
                    >
                        <SaveIcon fontSize="small" />
                    </IconButton>
                )}
                <IconButton
                    variant="tertiary"
                    onClick={() => {
                        if (!isEditing) {
                            onEditClick();
                        } else {
                            onCancelClick();
                        }
                    }}
                    aria-label={isEditing ? "Cancel" : "Edit"}
                    color="brand.textSecondary"
                    size="sm"
                >
                    {!isEditing ? (
                        <EditIcon fontSize="small" />
                    ) : (
                        <CloseIcon fontSize="small" />
                    )}
                </IconButton>
            </Flex>
        );
    };

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
                        bg="brand.bg"
                        border="1px solid"
                        borderColor="brand.border"
                        rounded="modal"
                        mx={[3, 6]}
                    >
                        <Dialog.Header
                            fontSize="lg"
                            fontWeight="semibold"
                            color="brand.textPrimary"
                            borderBottom="1px solid"
                            borderBottomColor="brand.divider"
                        >
                            Delete Account
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <Text color="brand.textSecondary">
                                {`Are you sure? You can't undo this action afterwards.`}
                            </Text>
                        </Dialog.Body>
                        <Dialog.Footer
                            borderTop="1px solid"
                            borderTopColor="brand.divider"
                            gap={3}
                        >
                            <Button
                                ref={cancelRef}
                                onClick={onClose}
                                variant="outline"
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
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            <Header />

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
                                    <Box flex={1}>
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
                                                        setEmailTouched(false);
                                                    }
                                                },
                                                defaultValue: user?.email,
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Text color="brand.textPrimary" fontSize="md">
                                        {user?.email}
                                    </Text>
                                )}
                                <FieldIcons
                                    isEditing={editingEmail}
                                    touched={emailTouched}
                                    isErrors={errors.email !== "" && errors.email !== undefined}
                                    onSaveClick={() => {
                                        updateEmailAddress(newEmail);
                                        setEditingEmail(false);
                                        setEmailTouched(false);
                                    }}
                                    onEditClick={() => setEditingEmail(true)}
                                    onCancelClick={() => resetEmailState()}
                                />
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
                                    <Box flex={1}>
                                        <TextInput
                                            type={showPassword ? "text" : "password"}
                                            error={errors.password}
                                            helperText="Enter your new password"
                                            title=""
                                            size="md"
                                            fieldProps={{
                                                onChange: (e) => {
                                                    if (e.target.value.length > 6) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            password: "",
                                                        }));
                                                        setNewPassword(e.target.value);
                                                        setPasswordTouched(true);
                                                    } else {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            password:
                                                                "Password must be more than 6 characters long.",
                                                        }));
                                                        setPasswordTouched(false);
                                                    }
                                                },
                                                defaultValue: "",
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
                                    </Box>
                                ) : (
                                    <Text color="brand.textPrimary" fontSize="md">
                                        **********
                                    </Text>
                                )}
                                <FieldIcons
                                    isEditing={editingPassword}
                                    touched={passwordTouched}
                                    isErrors={
                                        errors.password !== "" && errors.password !== undefined
                                    }
                                    onSaveClick={() => {
                                        updatePassword(newPassword);
                                        setEditingPassword(false);
                                        setPasswordTouched(false);
                                    }}
                                    onEditClick={() => setEditingPassword(true)}
                                    onCancelClick={() => resetPasswordState()}
                                />
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
                    <Button variant="outline" onClick={logout}>
                        Log out
                    </Button>
                    <Button variant="cancel" onClick={onOpen}>
                        Delete account
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Settings;

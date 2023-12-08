"use client";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Text,
    ToastProps,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    DeleteUser,
    LogOut,
    SendVerificationEmail,
    UpdateUserEmail,
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

const Settings = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const [editingEmail, setEditingEmail] = useState<boolean>(false);
    const [emailTouched, setEmailTouched] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [newEmail, setNewEmail] = useState<string>("");
    const [errors, setErrors] = useState<{
        email: string;
    }>({ email: "" });
    const toast = useToast();
    const id = "accountToast";
    const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

    const showToast = useCallback(
        ({ status, title, description, duration }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: duration || 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
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
            router.push("/loginRegister?accountDeleted=true");
        } catch (error) {
            console.log(error);
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
                    status: "success",
                });

                setTimeout(async () => {
                    await LogOut(router, "/loginRegister?login=true");
                }, 5000);
            } catch (error: any) {
                if (error.code === "auth/requires-recent-login") {
                    showToast({
                        title: "Please log in again to make changes to your account.",
                        description: "Redirecting you to the login page.",
                        status: "info",
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
                        status: "error",
                    });
                }
            }
        }
    };

    const EmailIcon = (): JSX.Element => {
        const BaseIcon = (
            onClick: () => void,
            icon: JSX.Element,
            isDisabled?: boolean
        ) => (
            <IconButton
                isDisabled={isDisabled || false}
                _hover={{
                    bg: "transparent",
                    color: "brand.primary",
                    transform: "scale(1.2)",
                }}
                shadow="lg"
                height="30px"
                onClick={onClick}
                variant="ghost"
                h={1 / 2}
                colorScheme="teal"
                aria-label="Show password"
                fontSize="3xl"
                icon={icon}
            />
        );

        let icon = BaseIcon(() => {
            setEditingEmail(true);
        }, <EditIcon fontSize="inherit" />);

        if (editingEmail) {
            icon = (
                <Flex
                    direction="column"
                    justifyContent={emailTouched ? "space-between" : "center"}
                    h="60px"
                >
                    <Box>
                        {emailTouched &&
                            BaseIcon(
                                () => {
                                    updateEmailAddress(newEmail);
                                    setEditingEmail((prev) => !prev);
                                },
                                <SaveIcon fontSize="inherit" />,
                                errors.email !== ""
                            )}
                    </Box>
                    <Box>
                        {BaseIcon(() => {
                            resetEmailState();
                        }, <CloseIcon fontSize="inherit" />)}
                    </Box>
                </Flex>
            );
        }

        return icon;
    };

    const resetEmailState = () => {
        setEmailTouched(false);
        setEditingEmail(false);
        setErrors((prev) => ({ ...prev, email: "" }));
    };

    return (
        <Flex h="full" m={0} px={[4, 8]} direction="column" alignItems="center">
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="brand.backgroundSecondary" mx={10}>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {`Are you sure? You can't undo this action afterwards.`}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onClose}
                                variant="cancel"
                            >
                                Cancel
                            </Button>

                            <Button
                                colorScheme="teal"
                                type="button"
                                variant="warning"
                                onClick={async () => {
                                    deleteAccount();
                                    onClose();
                                }}
                                ml={3}
                            >
                                Delete account
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Header />
            <Flex
                pt={10}
                alignItems="center"
                direction="column"
                w={["full", "80%", "70%", "60%", "50%"]}
            >
                <Flex w="full" direction="column">
                    <Heading size="xs" textTransform="uppercase">
                        Email address
                    </Heading>
                    <Flex
                        w="full"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        {editingEmail ? (
                            <TextInput
                                error={errors.email}
                                helperText="Please enter your new email address"
                                title=""
                                size="md"
                                fieldProps={{
                                    onChange: (e) => {
                                        if (e.target.value !== user?.email) {
                                            const emailRegex =
                                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            if (
                                                emailRegex.test(e.target.value)
                                            ) {
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
                        ) : (
                            <Text pt="2" fontSize="xl">
                                {user?.email}
                            </Text>
                        )}
                        <EmailIcon />
                    </Flex>
                </Flex>
            </Flex>
            <Flex
                pt={12}
                direction="column"
                w="100%"
                alignItems="center"
                gap={8}
                justifyContent="center"
            >
                <Button
                    colorScheme="teal"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={logout}
                >
                    Log out
                </Button>
                <Button
                    position="absolute"
                    bottom={8}
                    right={8}
                    colorScheme="teal"
                    size="sm"
                    type="button"
                    variant="warning"
                    onClick={onOpen}
                >
                    Delete account
                </Button>
            </Flex>
        </Flex>
    );
};

export default Settings;

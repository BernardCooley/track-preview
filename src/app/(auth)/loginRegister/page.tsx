"use client";
import {
    Box,
    Button,
    Center,
    Flex,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/toaster";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { useReadLocalStorage } from "usehooks-ts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseInit";
import BouncingDotsLoader from "@/components/BouncingLoaderDots";

const AuthPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isLogin = searchParams.get("login");
    const isPasswordReset = searchParams.get("passwordReset");
    const isAccountDeleted = searchParams.get("accountDeleted");
    const isVerifyEmail = searchParams.get("verifyEmail");
    const id = "loginRegisterToast";
    const hasPreviouslyLoggedIn = useReadLocalStorage(
        "has-previously-logged-in"
    );
    const [loading, setLoading] = useState(true);
    const [showVerifyBanner, setShowVerifyBanner] = useState(isVerifyEmail === "true");

    const showToast = useCallback(
        ({ type, title, description }: { type?: string; title?: string; description?: string }) => {
            toaster.create({
                id,
                title: title || "An error has occurred.",
                description: description || "Please try again later.",
                type: (type as "success" | "error" | "warning" | "info") || "error",
                duration: 5000,
            });
        },
        []
    );

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid && !user.isAnonymous && user.emailVerified) {
                router.push("/explore");
            } else {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, [router]);

    useEffect(() => {
        if (isPasswordReset) {
            setTimeout(() => showToast({
                type: "success",
                title: "Password reset",
                description: "Please check your email to reset your password.",
            }), 0);
            router.push(pathname);
        }
    }, [isPasswordReset]);

    useEffect(() => {
        if (isAccountDeleted) {
            setTimeout(() => showToast({
                type: "success",
                title: "Account deleted",
                description:
                    "Your account has been deleted. We are sorry to see you go.",
            }), 0);
            router.push(pathname);
        }
    }, [isAccountDeleted]);

    useEffect(() => {
        if (isVerifyEmail) {
            setShowVerifyBanner(true);
            router.push(pathname + "?login=true");
        }
    }, [isVerifyEmail]);

    const activeTab = isLogin === "false" ? "register" : "signin";

    if (loading) {
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
        <Flex
            h="100dvh"
            direction="column"
            alignItems="center"
            px={[4, 6]}
        >
            <Flex
                pt={[10, 12]}
                pb={[4, 6]}
                justifyContent="center"
            >
                <Text
                    fontSize={["3xl", "4xl", "5xl"]}
                    fontFamily="brand"
                    color="brand.textPrimary"
                    letterSpacing="wider"
                >
                    PHONIQUEST
                </Text>
            </Flex>

            {showVerifyBanner && (
                <Box
                    w="full"
                    maxW="480px"
                    mb={4}
                    bg="brand.primarySubtle"
                    border="1px solid"
                    borderColor="brand.primary"
                    rounded="card"
                    p={[4, 5]}
                >
                    <Flex direction="column" gap={3} alignItems="center" textAlign="center">
                        <Text fontSize="sm" fontWeight="semibold" color="brand.textPrimary">
                            Email not verified
                        </Text>
                        <Text fontSize="sm" color="brand.textSecondary">
                            Please check your inbox for a verification link and then you can log in.
                        </Text>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVerifyBanner(false)}
                        >
                            Dismiss
                        </Button>
                    </Flex>
                </Box>
            )}

            <Box
                w="full"
                maxW="480px"
                flex={1}
                display="flex"
                flexDirection="column"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="brand.border"
                roundedTop="card"
                roundedBottom="none"
                overflow="hidden"
            >
                <Tabs.Root
                    value={activeTab}
                    onValueChange={(details) => {
                        router.push(
                            `/loginRegister?login=${
                                details.value === "signin" ? "true" : "false"
                            }`
                        );
                    }}
                    fitted
                    style={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                    <Tabs.List
                        bg="brand.surface"
                        borderBottom="1px solid"
                        borderBottomColor="brand.border"
                        gap={0}
                    >
                        <Tabs.Trigger
                            value="signin"
                            color="brand.textMuted"
                            py={4}
                            fontWeight="medium"
                            transition="all 0.2s ease"
                            _selected={{
                                color: "brand.primary",
                                borderBottom: "2px solid",
                                borderBottomColor: "brand.primary",
                            }}
                        >
                            Sign in
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="register"
                            color="brand.textMuted"
                            py={4}
                            fontWeight="medium"
                            transition="all 0.2s ease"
                            _selected={{
                                color: "brand.primary",
                                borderBottom: "2px solid",
                                borderBottomColor: "brand.primary",
                            }}
                        >
                            Register
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="signin" pt={2} flex={1}>
                        <SignIn />
                    </Tabs.Content>
                    <Tabs.Content value="register" pt={2} flex={1}>
                        <SignUp />
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
        </Flex>
    );
};

const AuthPage = () => (
    <Suspense>
        <AuthPageContent />
    </Suspense>
);

export default AuthPage;

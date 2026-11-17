"use client";
import {
    Box,
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
    const id = "loginRegisterToast";
    const hasPreviouslyLoggedIn = useReadLocalStorage(
        "has-previously-logged-in"
    );
    const [loading, setLoading] = useState(true);

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

    const isUserLoggedIn = useCallback(async () => {
        onAuthStateChanged(auth, (user) => {
            if (user && user.email && user.uid) {
                router.push("/explore");
            } else {
                setLoading(false);
            }
        });
    }, [router]);

    useEffect(() => {
        isUserLoggedIn();
    }, [isUserLoggedIn]);

    useEffect(() => {
        if (isPasswordReset) {
            showToast({
                type: "success",
                title: "Password reset",
                description: "Please check your email to reset your password.",
            });
            router.push(pathname);
        }
    }, [isPasswordReset]);

    useEffect(() => {
        if (isAccountDeleted) {
            showToast({
                type: "success",
                title: "Account deleted",
                description:
                    "Your account has been deleted. We are sorry to see you go.",
            });
            router.push(pathname);
        }
    }, [isAccountDeleted]);

    const defaultTab = isLogin === "true" || hasPreviouslyLoggedIn ? "signin" : "register";

    if (loading) {
        return (
            <Center h="100vh" flexDirection="column" gap={8}>
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
            minH="100vh"
            direction="column"
            alignItems="center"
            px={[4, 6]}
            py={[8, 12]}
        >
            <Text
                fontSize={["3xl", "4xl", "5xl"]}
                fontFamily="brand"
                color="brand.textPrimary"
                letterSpacing="wider"
                mb={[6, 8]}
            >
                PHONIQUEST
            </Text>

            <Box
                w="full"
                maxW="480px"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="brand.border"
                rounded="card"
                overflow="hidden"
            >
                <Tabs.Root
                    defaultValue={defaultTab}
                    onValueChange={(details) => {
                        router.push(
                            `/loginRegister?login=${
                                details.value === "signin" ? "true" : "false"
                            }`
                        );
                    }}
                    fitted
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

                    <Tabs.Content value="signin" pt={2}>
                        <SignIn />
                    </Tabs.Content>
                    <Tabs.Content value="register" pt={2}>
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

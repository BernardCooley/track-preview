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
import Loading from "@/components/Loading";

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

    const TabContainer = ({ children }: { children: React.ReactNode }) => {
        return (
            <Flex
                direction="column"
                h="100vh"
                justifyContent="space-between"
                alignItems="center"
                w="full"
            >
                {children}
            </Flex>
        );
    };

    const defaultTab = isLogin === "true" || hasPreviouslyLoggedIn ? "signin" : "register";

    return (
        <>
            {loading && (
                <Center
                    zIndex={150}
                    top="200px"
                    right="50%"
                    transform={`translate(50%, 0)`}
                    position="absolute"
                    px={4}
                >
                    <Loading />
                </Center>
            )}
            {!loading && (
                <Box>
                    <Text
                        py={10}
                        textAlign="center"
                        fontSize={["3xl", "4xl", "5xl", "6xl"]}
                        fontFamily="brand"
                    >
                        PHONIQUEST
                    </Text>
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
                        variant="enclosed"
                        colorPalette="primary"
                    >
                        <Tabs.List px={[10, 16, 60, 80]} gap={2}>
                            <Tabs.Trigger
                                value="signin"
                                color="brand.textPrimaryLighter"
                                borderBottomRadius="0px"
                                borderTopRadius="14px"
                                _selected={{
                                    bg: "brand.primary",
                                    color: "brand.textPrimary",
                                }}
                            >
                                Sign in
                            </Tabs.Trigger>
                            <Tabs.Trigger
                                value="register"
                                color="brand.textPrimaryLighter"
                                borderBottomRadius="0px"
                                borderTopRadius="14px"
                                _selected={{
                                    bg: "brand.primary",
                                    color: "brand.textPrimary",
                                }}
                            >
                                Register
                            </Tabs.Trigger>
                        </Tabs.List>

                        <Tabs.Content value="signin">
                            <TabContainer>
                                <SignIn />
                            </TabContainer>
                        </Tabs.Content>
                        <Tabs.Content value="register">
                            <TabContainer>
                                <SignUp />
                            </TabContainer>
                        </Tabs.Content>
                    </Tabs.Root>
                </Box>
            )}
        </>
    );
};

const AuthPage = () => (
    <Suspense>
        <AuthPageContent />
    </Suspense>
);

export default AuthPage;

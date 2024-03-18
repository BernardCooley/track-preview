"use client";
import {
    Box,
    Center,
    Flex,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    ToastProps,
    useToast,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";
import { useReadLocalStorage } from "usehooks-ts";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseInit";
import Loading from "@/components/Loading";

const AuthPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isLogin = searchParams.get("login");
    const isPasswordReset = searchParams.get("passwordReset");
    const isAccountDeleted = searchParams.get("accountDeleted");
    const toast = useToast();
    const id = "loginRegisterToast";
    const hasPreviouslyLoggedIn = useReadLocalStorage(
        "has-previously-logged-in"
    );
    const [loading, setLoading] = useState(true);

    const showToast = useCallback(
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occurred.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
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
                status: "success",
                title: "Password reset",
                description: "Please check your email to reset your password.",
            });
            router.push(pathname);
        }
    }, [isPasswordReset]);

    useEffect(() => {
        if (isAccountDeleted) {
            showToast({
                status: "success",
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
                    <Tabs
                        defaultIndex={
                            isLogin === "true" || hasPreviouslyLoggedIn ? 0 : 1
                        }
                        onChange={(index) => {
                            router.push(
                                `/loginRegister?login=${
                                    index === 0 ? "true" : "false"
                                }`
                            );
                        }}
                        isFitted
                        variant="solid-rounded"
                        colorScheme="primary"
                    >
                        <TabList px={[10, 16, 60, 80]} gap={2}>
                            <Tab>Sign in</Tab>
                            <Tab>Register</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <TabContainer>
                                    <SignIn />
                                </TabContainer>
                            </TabPanel>
                            <TabPanel>
                                <TabContainer>
                                    <SignUp />
                                </TabContainer>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            )}
        </>
    );
};

export default AuthPage;

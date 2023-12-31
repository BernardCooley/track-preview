"use client";
import {
    Box,
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
import React, { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SignIn from "@/components/SignIn";
import SignUp from "@/components/SignUp";

const AuthPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isLogin = searchParams.get("login");
    const isPasswordReset = searchParams.get("passwordReset");
    const isAccountDeleted = searchParams.get("accountDeleted");
    const toast = useToast();
    const id = "loginRegisterToast";

    const showToast = useCallback(
        ({ status, title, description }: ToastProps) => {
            if (!toast.isActive(id)) {
                toast({
                    id,
                    title: title || "An error has occured.",
                    description: description || "Please try again later.",
                    status: status,
                    duration: 5000,
                    isClosable: true,
                });
            }
        },
        [toast]
    );

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
                defaultIndex={isLogin === "true" ? 0 : 1}
                onChange={(index) => {
                    router.push(
                        `/loginRegister?login=${index === 0 ? "true" : "false"}`
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
    );
};

export default AuthPage;

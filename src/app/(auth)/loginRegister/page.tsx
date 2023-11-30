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
import SignIn from "../../signin/page";
import SignUp from "../../signup/page";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const AuthPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isPasswordReset = searchParams.get("passwordReset");
    const toast = useToast();
    const id = "passwordResetToast";

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
    });

    const Container = ({ children }: { children: React.ReactNode }) => {
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
        <Box
            backgroundImage={"url(/logo_background_4x.png)"}
            backgroundSize="90%"
            backgroundRepeat="no-repeat"
            backgroundPosition="center 25%"
        >
            <Text
                py={10}
                textAlign="center"
                fontSize={["3xl", "6xl"]}
                fontFamily="brand"
            >
                PHONIQUEST
            </Text>
            <Tabs isFitted variant="solid-rounded" colorScheme="primary">
                <TabList>
                    <Tab>Sign in</Tab>
                    <Tab>Register</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Container>
                            <SignIn />
                        </Container>
                    </TabPanel>
                    <TabPanel>
                        <Container>
                            <SignUp />
                        </Container>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default AuthPage;

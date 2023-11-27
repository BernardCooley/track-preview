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
} from "@chakra-ui/react";
import React from "react";
import SignIn from "../signin/page";
import SignUp from "../signup/page";

const AuthPage = () => {
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
            <Text py={10} textAlign="center" fontSize="6xl" fontFamily="brand">
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

"use client";
import { Box, Button, Flex } from "@chakra-ui/react";
import React from "react";
import { LogOut } from "../../../firebase/utils";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Props {}

const Settings = ({}: Props) => {
    const router = useRouter();

    const logout = async () => {
        LogOut(router);
    };

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
            <Flex>
                <Button
                    colorScheme="teal"
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={logout}
                >
                    Log out
                </Button>
            </Flex>
        </Box>
    );
};

export default Settings;

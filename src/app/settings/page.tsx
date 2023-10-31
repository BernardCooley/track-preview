"use client";
import { Box, Button, Flex } from "@chakra-ui/react";
import React from "react";
import { LogOut } from "../../../firebase/utils";
import { useRouter } from "next/navigation";

interface Props {}

const Settings = ({}: Props) => {
    const router = useRouter();

    const logout = async () => {
        LogOut(router);
    };

    return (
        <Box p={20}>
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

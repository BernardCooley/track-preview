"use client";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Box } from "@chakra-ui/react";
import React from "react";

const Settings = () => {
    return (
        <AuthGuard>
            <Box h="full" m={0} px={[4, 8]}>
                <Header />
            </Box>
        </AuthGuard>
    );
};

export default Settings;

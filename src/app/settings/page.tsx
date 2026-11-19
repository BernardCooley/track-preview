"use client";
import BackHeader from "@/components/BackHeader";
import AuthGuard from "@/components/AuthGuard";
import { Box } from "@chakra-ui/react";
import React from "react";

const Settings = () => {
    return (
        <AuthGuard>
            <Box h="full" m={0} px={[4, 8]}>
                <BackHeader title="Settings" />
            </Box>
        </AuthGuard>
    );
};

export default Settings;

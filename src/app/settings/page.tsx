"use client";
import Header from "@/components/Header";
import { Box } from "@chakra-ui/react";
import React from "react";

interface Props {}

const Settings = ({}: Props) => {
    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
        </Box>
    );
};

export default Settings;

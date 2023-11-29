"use client";
import { restoreDatabase } from "@/bff/bff";
import Header from "@/components/Header";
import { Box } from "@chakra-ui/react";
import React, { useEffect } from "react";

interface Props {}

const Settings = ({}: Props) => {
    useEffect(() => {
        // (async () => {
        //     await restoreDatabase();
        // })();
    }, []);

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
        </Box>
    );
};

export default Settings;

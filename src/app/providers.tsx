"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { TrackContextProvider } from "../../context/TrackContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider>
                <TrackContextProvider>{children}</TrackContextProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}

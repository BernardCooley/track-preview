"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { TrackContextProvider } from "../../context/TrackContext";
import AllContexts from "../../Contexts/AllContexts";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider>
                <AllContexts>
                    <TrackContextProvider>{children}</TrackContextProvider>
                </AllContexts>
            </ChakraProvider>
        </CacheProvider>
    );
}

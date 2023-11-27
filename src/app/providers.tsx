"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { TrackContextProvider } from "../../context/TrackContext";
import AllContexts from "../../Contexts/AllContexts";
import { theme } from "../../ChakraTheme";
import "@fontsource/allerta-stencil";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider theme={theme}>
                <AllContexts>
                    <TrackContextProvider>{children}</TrackContextProvider>
                </AllContexts>
            </ChakraProvider>
        </CacheProvider>
    );
}

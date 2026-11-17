"use client";

import {
    ChakraProvider,
    Toaster,
    Toast,
} from "@chakra-ui/react";
import { TrackContextProvider } from "../../context/TrackContext";
import AllContexts from "../../Contexts/AllContexts";
import { system } from "../../ChakraTheme";
import "@fontsource/allerta-stencil";
import { toaster } from "@/components/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider value={system}>
            <AllContexts>
                <TrackContextProvider>
                    {children}
                    <Toaster toaster={toaster}>
                        {(toast) => (
                            <Toast.Root>
                                <Toast.Indicator />
                                <Toast.Title>{toast.title}</Toast.Title>
                                <Toast.Description>
                                    {toast.description}
                                </Toast.Description>
                                <Toast.CloseTrigger />
                            </Toast.Root>
                        )}
                    </Toaster>
                </TrackContextProvider>
            </AllContexts>
        </ChakraProvider>
    );
}

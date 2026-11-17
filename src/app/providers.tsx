"use client";

import { ChakraProvider, Toaster, Toast } from "@chakra-ui/react";
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
                            <Toast.Root
                                bg="brand.surfaceRaised"
                                border="1px solid"
                                borderColor="brand.border"
                                rounded="card"
                                shadow="lg"
                            >
                                <Toast.Indicator />
                                <Toast.Title color="brand.textPrimary">
                                    {toast.title}
                                </Toast.Title>
                                <Toast.Description color="brand.textSecondary">
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

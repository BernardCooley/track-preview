"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getExperimentClient } from "@/lib/amplitude-experiment";

interface ExperimentContextValue {
    isLoaded: boolean;
    getFlag: (flagKey: string, fallback?: string) => string;
}

const ExperimentContext = createContext<ExperimentContextValue>({
    isLoaded: false,
    getFlag: (_key, fallback = "off") => fallback,
});

export const useFeatureFlag = (flagKey: string, fallback = "off"): { value: string; isLoaded: boolean } => {
    const { isLoaded, getFlag } = useContext(ExperimentContext);
    return { value: getFlag(flagKey, fallback), isLoaded };
};

export const ExperimentProvider = ({ children }: { children: ReactNode }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const client = getExperimentClient();
        if (!client) {
            setIsLoaded(true);
            return;
        }

        client.fetch().then(() => setIsLoaded(true)).catch(() => setIsLoaded(true));
    }, []);

    const getFlag = (flagKey: string, fallback = "off"): string => {
        const client = getExperimentClient();
        if (!client) return fallback;
        const variant = client.variant(flagKey);
        return variant?.value ?? fallback;
    };

    return (
        <ExperimentContext.Provider value={{ isLoaded, getFlag }}>
            {children}
        </ExperimentContext.Provider>
    );
};

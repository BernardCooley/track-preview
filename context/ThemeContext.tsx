"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Appearance = "light" | "dark";

interface ThemeContextType {
    appearance: Appearance;
    toggleAppearance: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    appearance: "light",
    toggleAppearance: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [appearance, setAppearance] = useState<Appearance>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("phoniquest-theme") as Appearance | null;
        if (stored === "light" || stored === "dark") {
            setAppearance(stored);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("phoniquest-theme", appearance);
        }
    }, [appearance, mounted]);

    const toggleAppearance = () => {
        setAppearance((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ appearance, toggleAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
};

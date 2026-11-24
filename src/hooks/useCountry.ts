import { useMemo } from "react";

export const useCountry = (): string | undefined => {
    return useMemo(() => {
        if (typeof document === "undefined") return undefined;
        const overrideMatch = document.cookie.match(/(?:^|;\s*)country_override=([^;]*)/);
        if (overrideMatch?.[1]) return overrideMatch[1];
        const match = document.cookie.match(/(?:^|;\s*)country=([^;]*)/);
        return match?.[1] || undefined;
    }, []);
};

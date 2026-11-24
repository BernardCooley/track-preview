import { useMemo } from "react";

export const useCountry = (): string | undefined => {
    return useMemo(() => {
        if (typeof document === "undefined") return undefined;
        const match = document.cookie.match(/(?:^|;\s*)country=([^;]*)/);
        return match?.[1] || undefined;
    }, []);
};

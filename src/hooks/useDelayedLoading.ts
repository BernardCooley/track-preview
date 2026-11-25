import { useEffect, useState } from "react";

const DELAY_MS = 1000;

export function useDelayedLoading(isLoading: boolean): boolean {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShow(false);
            return;
        }

        const timer = setTimeout(() => setShow(true), DELAY_MS);
        return () => clearTimeout(timer);
    }, [isLoading]);

    return show;
}

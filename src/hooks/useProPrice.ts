import { useEffect, useState } from "react";
import { getProPrice } from "@/bff/bff";

let cachedPrice: { formatted: string; interval: string } | null = null;
let fetchPromise: Promise<{ formatted: string; interval: string } | null> | null = null;

export const useProPrice = () => {
    const [price, setPrice] = useState(cachedPrice);

    useEffect(() => {
        if (cachedPrice) {
            setPrice(cachedPrice);
            return;
        }

        if (!fetchPromise) {
            fetchPromise = getProPrice().then((result) => {
                cachedPrice = result;
                fetchPromise = null;
                return result;
            });
        }

        fetchPromise.then((result) => setPrice(result));
    }, []);

    return price;
};

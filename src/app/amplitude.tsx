"use client";

import { useEffect } from "react";
import { initAll } from "@amplitude/unified";

export default function Amplitude() {
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
        if (!apiKey) return;

        initAll(apiKey, {
            serverZone: "EU",
            analytics: { autocapture: true },
            sessionReplay: { sampleRate: 1 },
        });
    }, []);

    return null;
}

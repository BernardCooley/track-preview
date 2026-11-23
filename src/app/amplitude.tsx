"use client";

import { useEffect } from "react";
import { initAll } from "@amplitude/unified";
import { getAmplitudeApiKey } from "@/config/amplitude";

export default function Amplitude() {
    useEffect(() => {
        initAll(getAmplitudeApiKey(), {
            serverZone: "EU",
            analytics: { autocapture: true },
            sessionReplay: { sampleRate: 1 },
        });
    }, []);

    return null;
}

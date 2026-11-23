"use client";

import { useEffect } from "react";
import { initAll, setUserId } from "@amplitude/unified";
import { getAmplitudeApiKey } from "@/config/amplitude";
import { useAuthContext } from "../../Contexts/AuthContext";

export default function Amplitude() {
    const { user } = useAuthContext();

    useEffect(() => {
        initAll(getAmplitudeApiKey(), {
            serverZone: "EU",
            analytics: { autocapture: true },
            sessionReplay: { sampleRate: 1 },
        });
    }, []);

    useEffect(() => {
        if (user?.uid) {
            setUserId(user.uid);
        }
    }, [user?.uid]);

    return null;
}

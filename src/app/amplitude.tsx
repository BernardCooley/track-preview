"use client";

import { useEffect } from "react";
import { initAll, setUserId, identify, Identify } from "@amplitude/unified";
import { getAmplitudeApiKey } from "@/config/amplitude";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

const isProduction = process.env.NODE_ENV === "production";

function hasAnalyticsCookie() {
    if (typeof document === "undefined") return false;
    return /(?:^|;\s*)analytics_override=1/.test(document.cookie);
}

export default function Amplitude() {
    const { user, userProfile } = useAuthContext();
    const { isPro, subscriptionTier } = useSubscription();

    useEffect(() => {
        if (!isProduction && !hasAnalyticsCookie()) return;
        initAll(getAmplitudeApiKey(), {
            serverZone: "EU",
            analytics: { autocapture: false },
            sessionReplay: { sampleRate: 1 },
        });
    }, []);

    useEffect(() => {
        if (user?.uid) {
            setUserId(user.uid);
        }
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid || !userProfile) return;
        const id = new Identify();
        id.set("subscriptionTier", subscriptionTier);
        id.set("isPro", isPro);
        identify(id);
    }, [user?.uid, subscriptionTier, isPro, userProfile]);

    return null;
}

import { useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useFeatureFlag } from "@/context/ExperimentContext";
import { getSubscriptionsFlagKey } from "@/config/amplitude";

const getSubscriptionOverride = (): "pro" | "free" | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)subscription_override=([^;]*)/);
    const val = match?.[1];
    if (val === "pro" || val === "free") return val;
    return null;
};

export const useSubscription = () => {
    const { userProfile } = useAuthContext();
    const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
    const { value: subscriptionsFlag, isLoaded: flagLoaded } = useFeatureFlag(getSubscriptionsFlagKey(), "off");

    const subscriptionsEnabled = flagLoaded && subscriptionsFlag === "on";

    const isInGracePeriod =
        userProfile?.subscriptionStatus === "PAST_DUE" &&
        userProfile?.subscriptionExpiresAt != null &&
        new Date(userProfile.subscriptionExpiresAt) > new Date();

    const isCanceledWithTimeLeft =
        userProfile?.subscriptionStatus === "CANCELED" &&
        userProfile?.subscriptionExpiresAt != null &&
        new Date(userProfile.subscriptionExpiresAt) > new Date();

    const override = subscriptionsEnabled ? getSubscriptionOverride() : null;

    const isPro =
        override === "pro" ? true :
        override === "free" ? false :
        !subscriptionsEnabled ||
        (userProfile?.subscriptionTier === "PRO" &&
        (userProfile?.subscriptionStatus !== "CANCELED" || isCanceledWithTimeLeft));

    const requirePro = (featureName: string): boolean => {
        if (isPro) return true;
        setUpgradeFeature(featureName);
        return false;
    };

    const dismissUpgrade = () => setUpgradeFeature(null);

    return {
        isPro,
        isInGracePeriod,
        subscriptionsEnabled,
        subscriptionTier: userProfile?.subscriptionTier ?? "FREE",
        subscriptionStatus: userProfile?.subscriptionStatus ?? null,
        upgradeFeature,
        requirePro,
        dismissUpgrade,
    };
};

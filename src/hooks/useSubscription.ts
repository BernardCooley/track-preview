import { useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useFeatureFlag } from "@/context/ExperimentContext";

export const useSubscription = () => {
    const { userProfile } = useAuthContext();
    const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
    const flagKey = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_FLAG_KEY ?? "enable-subscriptions";
    const { value: subscriptionsFlag, isLoaded: flagLoaded } = useFeatureFlag(flagKey, "off");

    const subscriptionsEnabled = flagLoaded && subscriptionsFlag === "on";

    const isInGracePeriod =
        userProfile?.subscriptionStatus === "PAST_DUE" &&
        userProfile?.subscriptionExpiresAt != null &&
        new Date(userProfile.subscriptionExpiresAt) > new Date();

    const isPro =
        !subscriptionsEnabled ||
        (userProfile?.subscriptionTier === "PRO" &&
        (userProfile?.subscriptionStatus === "ACTIVE" || isInGracePeriod));

    const requirePro = (featureName: string): boolean => {
        if (isPro) return true;
        setUpgradeFeature(featureName);
        return false;
    };

    const dismissUpgrade = () => setUpgradeFeature(null);

    return {
        isPro,
        isInGracePeriod,
        subscriptionTier: userProfile?.subscriptionTier ?? "FREE",
        subscriptionStatus: userProfile?.subscriptionStatus ?? null,
        upgradeFeature,
        requirePro,
        dismissUpgrade,
    };
};

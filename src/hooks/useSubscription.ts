import { useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useFeatureFlag } from "@/context/ExperimentContext";
import { getSubscriptionsFlagKey } from "@/config/amplitude";

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

    const isPro =
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

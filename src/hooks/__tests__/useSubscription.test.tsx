import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthContext } from "../../../Contexts/AuthContext";
import { useSubscription } from "../useSubscription";
import type { User as UserProfile } from "@prisma/client";

const mockFeatureFlag = vi.hoisted(() => ({ value: "on", isLoaded: true }));
vi.mock("@/context/ExperimentContext", () => ({
    useFeatureFlag: () => mockFeatureFlag,
}));

vi.mock("@/config/amplitude", () => ({
    getSubscriptionsFlagKey: () => "enable-subscriptions",
}));

function makeProfile(
    overrides: Partial<UserProfile> = {}
): UserProfile {
    return {
        id: "user-1",
        firebaseId: "fb-1",
        autoplay: false,
        genres: ["all"],
        yearFrom: 1960,
        yearTo: 2026,
        curatedMode: false,
        swipeMode: true,
        isAnonymous: false,
        lastActiveAt: new Date(),
        subscriptionTier: "FREE",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionStatus: null,
        subscriptionExpiresAt: null,
        spotifyAccessToken: null,
        spotifyRefreshToken: null,
        spotifyTokenExpiresAt: null,
        ...overrides,
    };
}

function wrapper(userProfile: UserProfile | null) {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthContext.Provider
            value={{
                user: { uid: "user-1", email: "test@test.com" },
                updateUser: vi.fn(),
                userProfile,
                updateUserProfile: vi.fn(),
                isAnonymous: false,
                setIsAnonymous: vi.fn(),
                profileError: false,
                setProfileError: vi.fn(),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
    Wrapper.displayName = "TestWrapper";
    return Wrapper;
}

describe("useSubscription", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockFeatureFlag.value = "on";
        mockFeatureFlag.isLoaded = true;
    });

    it("isPro is false for FREE tier", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(makeProfile({ subscriptionTier: "FREE" })),
        });
        expect(result.current.isPro).toBe(false);
        expect(result.current.subscriptionTier).toBe("FREE");
    });

    it("isPro is true for PRO tier with ACTIVE status", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(
                makeProfile({
                    subscriptionTier: "PRO",
                    subscriptionStatus: "ACTIVE",
                })
            ),
        });
        expect(result.current.isPro).toBe(true);
    });

    it("isPro is false for PRO tier with CANCELED status", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(
                makeProfile({
                    subscriptionTier: "PRO",
                    subscriptionStatus: "CANCELED",
                })
            ),
        });
        expect(result.current.isPro).toBe(false);
    });

    it("isPro is true for PRO/PAST_DUE within grace period", () => {
        const future = new Date();
        future.setDate(future.getDate() + 7);

        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(
                makeProfile({
                    subscriptionTier: "PRO",
                    subscriptionStatus: "PAST_DUE",
                    subscriptionExpiresAt: future,
                })
            ),
        });
        expect(result.current.isPro).toBe(true);
        expect(result.current.isInGracePeriod).toBe(true);
    });

    it("isPro is false for PRO/PAST_DUE after grace period expired", () => {
        const past = new Date();
        past.setDate(past.getDate() - 1);

        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(
                makeProfile({
                    subscriptionTier: "PRO",
                    subscriptionStatus: "PAST_DUE",
                    subscriptionExpiresAt: past,
                })
            ),
        });
        expect(result.current.isPro).toBe(false);
        expect(result.current.isInGracePeriod).toBe(false);
    });

    it("isPro is false when userProfile is null", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(null),
        });
        expect(result.current.isPro).toBe(false);
        expect(result.current.subscriptionTier).toBe("FREE");
        expect(result.current.subscriptionStatus).toBe(null);
    });

    it("requirePro returns true for Pro users", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(
                makeProfile({
                    subscriptionTier: "PRO",
                    subscriptionStatus: "ACTIVE",
                })
            ),
        });
        expect(result.current.requirePro("Test Feature")).toBe(true);
        expect(result.current.upgradeFeature).toBe(null);
    });

    it("requirePro returns false and sets upgradeFeature for Free users", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(makeProfile({ subscriptionTier: "FREE" })),
        });

        let allowed: boolean;
        act(() => {
            allowed = result.current.requirePro("Curated Mode");
        });
        expect(allowed!).toBe(false);
        expect(result.current.upgradeFeature).toBe("Curated Mode");
    });

    it("dismissUpgrade clears upgradeFeature", () => {
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(makeProfile({ subscriptionTier: "FREE" })),
        });

        act(() => {
            result.current.requirePro("Feature");
        });
        expect(result.current.upgradeFeature).toBe("Feature");

        act(() => {
            result.current.dismissUpgrade();
        });
        expect(result.current.upgradeFeature).toBe(null);
    });

    it("isPro is true for FREE user when feature flag is off", () => {
        mockFeatureFlag.value = "off";
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(makeProfile({ subscriptionTier: "FREE" })),
        });
        expect(result.current.isPro).toBe(true);
    });

    it("isPro is true when feature flag is not yet loaded", () => {
        mockFeatureFlag.value = "on";
        mockFeatureFlag.isLoaded = false;
        const { result } = renderHook(() => useSubscription(), {
            wrapper: wrapper(makeProfile({ subscriptionTier: "FREE" })),
        });
        expect(result.current.isPro).toBe(true);
    });
});

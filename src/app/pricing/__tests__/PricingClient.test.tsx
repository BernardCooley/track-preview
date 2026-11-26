import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "../../../../test/mocks/firebase";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import PricingClient from "../PricingClient";
import { onAuthStateChanged } from "firebase/auth";

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: vi.fn(),
}));

import { useSubscription } from "@/hooks/useSubscription";
const mockUseSubscription = vi.mocked(useSubscription);

const mockGetUserProfile = vi.fn();
vi.mock("@/bff/bff", () => ({
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
    createCheckoutSession: vi.fn(),
}));

const proProfile = {
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
    subscriptionTier: "PRO" as const,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    subscriptionStatus: "ACTIVE" as const,
    subscriptionExpiresAt: null,
};

const freeProfile = {
    ...proProfile,
    subscriptionTier: "FREE" as const,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    subscriptionExpiresAt: null,
};

function setSubscription(isPro: boolean) {
    mockUseSubscription.mockReturnValue({
        isPro,
        isInGracePeriod: false,
        isCanceledWithTimeLeft: false,
        isLapsed: false,
        subscriptionLoading: false,
        subscriptionsEnabled: true,
        subscriptionTier: isPro ? "PRO" : "FREE",
        subscriptionStatus: isPro ? "ACTIVE" : null,
        upgradeFeature: null,
        requirePro: vi.fn(),
        dismissUpgrade: vi.fn(),
    });
}

function simulateLoggedInUser(profile: typeof proProfile | typeof freeProfile) {
    mockGetUserProfile.mockResolvedValue(profile);
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        (callback as (user: { uid: string } | null) => void)({
            uid: "user-1",
        });
        return vi.fn();
    });
}

function simulateLoggedOutUser() {
    mockGetUserProfile.mockResolvedValue(null);
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
        (callback as (user: null) => void)(null);
        return vi.fn();
    });
}

describe("PricingClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Pro member", () => {
        beforeEach(() => {
            setSubscription(true);
            simulateLoggedInUser(proProfile);
        });

        it("shows 'Current plan' on the pro variant", async () => {
            render(<PricingClient variant="pro" />, {
                authContext: {
                    user: { uid: "user-1", email: "test@test.com" },
                    userProfile: proProfile as any,
                },
            });

            await waitFor(() => {
                expect(screen.getByText("Current plan")).toBeInTheDocument();
            });
        });

        it("renders nothing on the free variant", async () => {
            render(<PricingClient variant="free" />, {
                authContext: {
                    user: { uid: "user-1", email: "test@test.com" },
                    userProfile: proProfile as any,
                },
            });

            await waitFor(() => {
                expect(screen.queryByText("Current plan")).not.toBeInTheDocument();
                expect(screen.queryByText("Upgrade")).not.toBeInTheDocument();
            });
        });
    });

    describe("Free member", () => {
        beforeEach(() => {
            setSubscription(false);
            simulateLoggedInUser(freeProfile);
        });

        it("shows 'Current plan' on the free variant", async () => {
            render(<PricingClient variant="free" />, {
                authContext: {
                    user: { uid: "user-1", email: "test@test.com" },
                    userProfile: freeProfile as any,
                },
            });

            await waitFor(() => {
                expect(screen.getByText("Current plan")).toBeInTheDocument();
            });
        });

        it("shows 'Upgrade' button on the pro variant", async () => {
            render(<PricingClient variant="pro" />, {
                authContext: {
                    user: { uid: "user-1", email: "test@test.com" },
                    userProfile: freeProfile as any,
                },
            });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: "Upgrade" })).toBeInTheDocument();
                expect(screen.queryByText("Current plan")).not.toBeInTheDocument();
            });
        });
    });

    describe("Logged out user", () => {
        beforeEach(() => {
            setSubscription(false);
            simulateLoggedOutUser();
        });

        it("renders nothing on the free variant", async () => {
            render(<PricingClient variant="free" />);

            await waitFor(() => {
                expect(screen.queryByText("Current plan")).not.toBeInTheDocument();
                expect(screen.queryByText("Upgrade")).not.toBeInTheDocument();
            });
        });

        it("shows 'Upgrade' button on the pro variant", async () => {
            render(<PricingClient variant="pro" />);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: "Upgrade" })).toBeInTheDocument();
            });
        });
    });
});

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/firebase";
import { mockRouter, mockSearchParams } from "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import Explore from "../page";

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: vi.fn(),
}));

import { useSubscription } from "@/hooks/useSubscription";
const mockUseSubscription = vi.mocked(useSubscription);

const mockRequirePro = vi.fn();
const mockDismissUpgrade = vi.fn();

vi.mock("@/bff/bff", () => ({
    getUserProfile: vi.fn().mockResolvedValue(null),
    mutateUserProfile: vi.fn(),
    resolvePreviewUrl: vi.fn(),
    createCheckoutSession: vi.fn(),
    fetchNewTracks: vi.fn().mockResolvedValue([]),
    getProPrice: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/TrackReview", () => ({
    default: () => <div data-testid="track-review" />,
}));

vi.mock("@/components/Library", () => ({
    default: () => <div data-testid="library" />,
}));

vi.mock("@/components/NewTracksTab", () => ({
    default: () => <div data-testid="new-tracks-tab" />,
}));

vi.mock("@/components/AudioPlayer", () => {
    const MockAudioPlayer = require("react").forwardRef(function MockAudioPlayer() {
        return require("react").createElement("div", { "data-testid": "audio-player" });
    });
    return { default: MockAudioPlayer };
});

vi.mock("../../../../context/ThemeContext", () => ({
    useThemeContext: () => ({ appearance: "light", toggleAppearance: vi.fn() }),
}));

function setSubscription(isPro: boolean) {
    mockRequirePro.mockImplementation(() => {
        if (isPro) return true;
        return false;
    });
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
        requirePro: mockRequirePro,
        dismissUpgrade: mockDismissUpgrade,
    });
}

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

const authContext = { user: { uid: "user-1", email: "test@test.com" } as any };

describe("Explore — New Tracks tab gating", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams.set("reviewStep", "1");
    });

    afterEach(() => {
        mockSearchParams.delete("reviewStep");
    });

    it("free user clicking New tab triggers requirePro", async () => {
        setSubscription(false);
        const user = userEvent.setup();
        render(<Explore />, {
            authContext: { ...authContext, userProfile: freeProfile as any },
        });

        await user.click(screen.getByText("New"));

        expect(mockRequirePro).toHaveBeenCalledWith("New Tracks");
        expect(mockRouter.push).not.toHaveBeenCalledWith(
            expect.stringContaining("reviewStep=5")
        );
    });

    it("free user navigating to reviewStep=5 gets redirected to step 1", async () => {
        setSubscription(false);
        mockSearchParams.set("reviewStep", "5");

        render(<Explore />, {
            authContext: { ...authContext, userProfile: freeProfile as any },
        });

        await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith(
                expect.stringContaining("reviewStep=1")
            );
        });
    });

    it("Pro user clicking New tab navigates to step 5", async () => {
        setSubscription(true);
        const user = userEvent.setup();
        render(<Explore />, {
            authContext: { ...authContext, userProfile: proProfile as any },
        });

        await user.click(screen.getByText("New"));

        expect(mockRequirePro).not.toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith(
            expect.stringContaining("reviewStep=5")
        );
    });

    it("Pro user at reviewStep=5 sees NewTracksTab", async () => {
        setSubscription(true);
        mockSearchParams.set("reviewStep", "5");

        render(<Explore />, {
            authContext: { ...authContext, userProfile: proProfile as any },
        });

        await waitFor(() => {
            expect(screen.getByTestId("new-tracks-tab")).toBeInTheDocument();
        });
    });
});

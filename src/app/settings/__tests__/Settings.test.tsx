import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/firebase";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import Settings from "../page";

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: vi.fn(),
}));

vi.mock("@/hooks/useProPrice", () => ({
    useProPrice: () => null,
}));

import { useSubscription } from "@/hooks/useSubscription";
const mockUseSubscription = vi.mocked(useSubscription);

const mockMutateUserProfile = vi.fn();
const mockGetUserProfile = vi.fn().mockResolvedValue(null);
vi.mock("@/bff/bff", () => ({
    mutateUserProfile: (...args: unknown[]) => mockMutateUserProfile(...args),
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
    resolvePreviewUrl: vi.fn(),
    createCheckoutSession: vi.fn(),
    fetchLibraryStats: vi.fn().mockResolvedValue({}),
    getProPrice: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../../../context/ThemeContext", () => ({
    useThemeContext: () => ({ appearance: "light", toggleAppearance: vi.fn() }),
}));

const mockRequirePro = vi.fn();

function setSubscription(isPro: boolean) {
    mockRequirePro.mockImplementation(() => isPro);
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
        dismissUpgrade: vi.fn(),
    });
}

const baseProfile = {
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
    email: "test@test.com",
    genreAlerts: [] as string[],
    genreAlertFrequency: "WEEKLY" as const,
    genreEmailsEnabled: false,
    subscriptionTier: "PRO" as const,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    subscriptionStatus: "ACTIVE" as const,
    subscriptionExpiresAt: null,
    subscriptionStartedAt: null,
    spotifyAccessToken: null,
    spotifyRefreshToken: null,
    spotifyTokenExpiresAt: null,
    upgradePromptDismissedAt: null,
};

const authContext = {
    user: { uid: "user-1", email: "test@test.com" },
};

describe("Settings page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setSubscription(true);
    });

    describe("Genre preferences", () => {
        it("saves genres immediately when Apply is clicked in modal", async () => {
            const updatedProfile = { ...baseProfile, genreAlerts: ["Techno"] };
            mockMutateUserProfile.mockResolvedValue(updatedProfile);

            const user = userEvent.setup();
            render(<Settings />, {
                authContext: { ...authContext, userProfile: baseProfile as any },
            });

            await user.click(screen.getByText("Choose genres"));
            await user.click(screen.getByText("Techno"));
            await user.click(screen.getByText("Apply"));

            await waitFor(() => {
                expect(mockMutateUserProfile).toHaveBeenCalledWith({
                    userId: "user-1",
                    genreAlerts: ["Techno"],
                });
            });
        });

        it("saves empty array and disables emails when All genres is selected", async () => {
            const profileWithGenres = { ...baseProfile, genreAlerts: ["Techno"], genreEmailsEnabled: true };
            mockMutateUserProfile.mockResolvedValue({ ...baseProfile, genreAlerts: [], genreEmailsEnabled: false });

            const user = userEvent.setup();
            render(<Settings />, {
                authContext: { ...authContext, userProfile: profileWithGenres as any },
            });

            await user.click(screen.getByText("Edit genres"));
            await user.click(screen.getByText("All genres"));
            await user.click(screen.getByText("Apply"));

            await waitFor(() => {
                expect(mockMutateUserProfile).toHaveBeenCalledWith({
                    userId: "user-1",
                    genreAlerts: [],
                    genreEmailsEnabled: false,
                });
            });
        });

        it("clears all genres and disables emails via the confirm dialog", async () => {
            const profileWithGenres = { ...baseProfile, genreAlerts: ["Techno", "House"], genreEmailsEnabled: true };
            mockMutateUserProfile.mockResolvedValue({ ...baseProfile, genreAlerts: [], genreEmailsEnabled: false });

            const user = userEvent.setup();
            render(<Settings />, {
                authContext: { ...authContext, userProfile: profileWithGenres as any },
            });

            await user.click(screen.getByText("Clear all genres"));
            await user.click(screen.getByText("Clear all"));

            await waitFor(() => {
                expect(mockMutateUserProfile).toHaveBeenCalledWith({
                    userId: "user-1",
                    genreAlerts: [],
                    genreEmailsEnabled: false,
                });
            });
        });

        it("shows PRO badge and gates genre card for free users", async () => {
            setSubscription(false);
            const freeProfile = {
                ...baseProfile,
                subscriptionTier: "FREE" as const,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                subscriptionStatus: null,
            };

            const user = userEvent.setup({ pointerEventsCheck: 0 });
            render(<Settings />, {
                authContext: { ...authContext, userProfile: freeProfile as any },
            });

            const genreCard = screen.getByText("Favourite Genres").closest("[class]")!;
            await user.click(genreCard);

            expect(mockRequirePro).toHaveBeenCalledWith("Genre Alerts");
        });
    });

    describe("Email notifications", () => {
        const profileWithGenres = {
            ...baseProfile,
            genreAlerts: ["Techno"],
            genreEmailsEnabled: false,
        };

        it("saves immediately when email toggle is switched on", async () => {
            mockMutateUserProfile.mockResolvedValue({ ...profileWithGenres, genreEmailsEnabled: true });

            const user = userEvent.setup();
            render(<Settings />, {
                authContext: { ...authContext, userProfile: profileWithGenres as any },
            });

            const switches = screen.getAllByRole("checkbox");
            const emailToggle = switches[switches.length - 1];
            await user.click(emailToggle);

            await waitFor(() => {
                expect(mockMutateUserProfile).toHaveBeenCalledWith({
                    userId: "user-1",
                    genreEmailsEnabled: true,
                });
            });
        });

        it("saves immediately when frequency is changed", async () => {
            const profileWithEmails = {
                ...profileWithGenres,
                genreEmailsEnabled: true,
                genreAlertFrequency: "WEEKLY" as const,
            };
            mockMutateUserProfile.mockResolvedValue({ ...profileWithEmails, genreAlertFrequency: "DAILY" });

            const user = userEvent.setup();
            render(<Settings />, {
                authContext: { ...authContext, userProfile: profileWithEmails as any },
            });

            await user.click(screen.getByText("Daily"));

            await waitFor(() => {
                expect(mockMutateUserProfile).toHaveBeenCalledWith({
                    userId: "user-1",
                    genreAlertFrequency: "DAILY",
                });
            });
        });

        it("hides email card when no genres are selected", () => {
            render(<Settings />, {
                authContext: { ...authContext, userProfile: baseProfile as any },
            });

            expect(screen.queryByText("Email Notifications")).not.toBeInTheDocument();
        });

        it("hides email card for non-pro users", () => {
            setSubscription(false);
            const freeWithGenres = {
                ...profileWithGenres,
                subscriptionTier: "FREE" as const,
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                subscriptionStatus: null,
            };

            render(<Settings />, {
                authContext: { ...authContext, userProfile: freeWithGenres as any },
            });

            expect(screen.queryByText("Email Notifications")).not.toBeInTheDocument();
        });

        it("shows frequency options when emails are enabled", () => {
            const profileWithEmails = {
                ...profileWithGenres,
                genreEmailsEnabled: true,
            };

            render(<Settings />, {
                authContext: { ...authContext, userProfile: profileWithEmails as any },
            });

            expect(screen.getByText("Daily")).toBeInTheDocument();
            expect(screen.getByText("Weekly")).toBeInTheDocument();
            expect(screen.getByText("Monthly")).toBeInTheDocument();
        });
    });
});

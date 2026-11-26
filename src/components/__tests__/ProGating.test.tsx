import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import { mockSearchParams } from "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import Library from "../Library";
import MenuDrawer from "../MenuDrawer";
import Header from "../Header";
import Settings from "../../app/settings/page";
import { mockTrack, mockTrack2 } from "../../../test/mocks/data";

vi.mock("@/hooks/useTrackList", () => ({
    useTrackList: vi.fn(),
}));

import { useTrackList } from "@/hooks/useTrackList";
const mockUseTrackList = vi.mocked(useTrackList);

const mockRequirePro = vi.fn();
const mockDismissUpgrade = vi.fn();

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: vi.fn(),
}));

vi.mock("@/hooks/useProPrice", () => ({
    useProPrice: () => null,
}));

import { useSubscription } from "@/hooks/useSubscription";
const mockUseSubscription = vi.mocked(useSubscription);

const mockMutateUserProfile = vi.fn().mockResolvedValue({});
const mockFetchLibraryStats = vi.fn().mockResolvedValue({
    totalTracks: 10,
    purchasedTracks: 3,
    totalReviewed: 50,
    genreBreakdown: [{ genre: "Techno", count: 5 }],
    decadeDistribution: [{ decade: 2000, count: 10 }],
    topArtists: [{ artist: "Artist A", count: 3 }],
    topReleases: [],
});
const mockGetUserProfile = vi.fn().mockResolvedValue(null);
vi.mock("@/bff/bff", () => ({
    mutateUserProfile: (...args: unknown[]) => mockMutateUserProfile(...args),
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
    resolvePreviewUrl: vi.fn(),
    createCheckoutSession: vi.fn(),
    fetchLibraryStats: (...args: unknown[]) => mockFetchLibraryStats(...args),
    updateReviewNotes: vi.fn().mockResolvedValue({ success: true }),
    getProPrice: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/components/AuthGuard", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../../context/ThemeContext", () => ({
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

const baseHookReturn = {
    user: { uid: "user-1", email: "test@test.com" },
    currentlyPlaying: undefined,
    updateCurrentlyPlaying: vi.fn(),
    reviewTracks: {
        1: { tracks: [], currentTrack: 0 },
        2: { tracks: [], currentTrack: 0 },
        3: { tracks: [], currentTrack: 0 },
        4: { tracks: [mockTrack, mockTrack2], currentTrack: 0 },
    },
    updateReviewTracks: vi.fn(),
    currentReleaseTrack: null,
    updateCurrentReleaseTrack: vi.fn(),
    previousTracks: [],
    updatePreviousTracks: vi.fn(),
    changesMade: { 2: false, 3: false, 4: false },
    updateChangesMade: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    noTracks: false,
    setNoTracks: vi.fn(),
    id: "step4-toast",
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    buyModalIsOpen: false,
    onBuyModalOpen: vi.fn(),
    onBuyModalClose: vi.fn(),
    cancelRef: { current: null },
    trackToDelete: null,
    setTrackToDelete: vi.fn(),
    trackToBuy: null,
    setTrackToBuy: vi.fn(),
    sortBy: "title" as const,
    setSortBy: vi.fn(),
    sortDirection: "desc" as const,
    setSortDirection: vi.fn(),
    getTracks: vi.fn(),
    closeBuyModal: vi.fn(),
    closeDialog: vi.fn(),
    deleteTrack: vi.fn(),
    showToast: vi.fn(),
    addTrackToLibrary: vi.fn(),
    addingTrackId: null,
    libraryTrackIds: new Set<string>(),
    setLibraryTrackIds: vi.fn(),
    toggleTrackPurchased: vi.fn(),
};

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

describe("Pro feature gating", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTrackList.mockReturnValue(baseHookReturn as any);
    });

    afterEach(() => {
        mockSearchParams.delete("genres");
        mockSearchParams.delete("sort");
        mockSearchParams.delete("sortDir");
        mockSearchParams.delete("hideBought");
    });

    describe("2.1 Curated Mode gate (MenuDrawer)", () => {
        it("shows Pro badges for free users", () => {
            setSubscription(false);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            expect(screen.getAllByText("PRO").length).toBeGreaterThanOrEqual(1);
        });

        it("does not show Pro badge for Pro users", () => {
            setSubscription(true);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            expect(screen.queryByText("PRO")).not.toBeInTheDocument();
        });

    });

    describe("2.1a Curated Mode gate (Settings)", () => {
        it("calls requirePro when free user enables curated mode", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(
                <Settings />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            const curatedSwitch = screen.getAllByRole("checkbox")[0];
            await user.click(curatedSwitch);

            expect(mockRequirePro).toHaveBeenCalledWith("Curated Mode");
            expect(mockMutateUserProfile).not.toHaveBeenCalled();
        });

        it("allows Pro user to enable curated mode", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(
                <Settings />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            const curatedSwitch = screen.getAllByRole("checkbox")[0];
            await user.click(curatedSwitch);

            expect(mockRequirePro).toHaveBeenCalledWith("Curated Mode");
            expect(mockMutateUserProfile).toHaveBeenCalledWith({
                userId: "user-1",
                curatedMode: true,
            });
        });
    });

    describe("2.1b Discovery History gate (MenuDrawer)", () => {
        it("shows PRO badge on History item for free users", () => {
            setSubscription(false);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            const historyItem = screen.getByText("History").closest("[class]")! as HTMLElement;
            expect(within(historyItem).getByText("PRO")).toBeInTheDocument();
        });

        it("does not show PRO badge on History item for Pro users", () => {
            setSubscription(true);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            const historyItem = screen.getByText("History").closest("[class]")! as HTMLElement;
            expect(within(historyItem).queryByText("PRO")).not.toBeInTheDocument();
        });

        it("calls requirePro when free user clicks History", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            await user.click(screen.getByText("History"));

            expect(mockRequirePro).toHaveBeenCalledWith("Discovery History");
        });

        it("does not call requirePro when Pro user clicks History", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            await user.click(screen.getByText("History"));

            expect(mockRequirePro).not.toHaveBeenCalled();
        });
    });

    describe("2.2 Release view gate", () => {
        it("calls requirePro when free user clicks View release", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            expect(optionsButton).toBeDefined();
            await user.click(optionsButton!);

            await user.click(screen.getByText("View release"));

            expect(mockRequirePro).toHaveBeenCalledWith("Release Browsing");
            expect(baseHookReturn.updateCurrentReleaseTrack).not.toHaveBeenCalled();
        });

        it("allows Pro user to view release", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            expect(optionsButton).toBeDefined();
            await user.click(optionsButton!);

            await user.click(screen.getByText("View release"));

            expect(mockRequirePro).toHaveBeenCalledWith("Release Browsing");
            expect(baseHookReturn.updateCurrentReleaseTrack).toHaveBeenCalled();
        });
    });

    describe("2.3 Purchase tracking (free for all users)", () => {
        it("free user can click buy button", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const buyButtons = screen.getAllByRole("button", { name: "buy track" });
            await user.click(buyButtons[0]);

            expect(mockRequirePro).not.toHaveBeenCalled();
            expect(baseHookReturn.setTrackToBuy).toHaveBeenCalled();
        });

        it("free user can click Mark as bought", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);

            await user.click(screen.getByText("Mark as bought"));

            expect(mockRequirePro).not.toHaveBeenCalled();
            expect(baseHookReturn.toggleTrackPurchased).toHaveBeenCalled();
        });
    });

    describe("2.4 Sorting and filtering (free for all users)", () => {
        it("free user can open sort menu", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: "Sort" }));

            expect(screen.getByText("title")).toBeInTheDocument();
        });

        it("free user genre filter does not call requirePro", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /All genres/i }));

            expect(mockRequirePro).not.toHaveBeenCalled();
        });
    });

    describe("3.8 Library stats gating", () => {
        const authContext = { user: { uid: "user-1", email: "test@test.com" } as any };

        it("free user can open stats panel", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />, { authContext });

            await user.click(screen.getByRole("button", { name: "Library stats" }));

            expect(await screen.findByText("Library Stats")).toBeInTheDocument();
        });

        it("free user sees summary cards but not detailed breakdowns", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />, { authContext });

            await user.click(screen.getByRole("button", { name: "Library stats" }));

            expect(await screen.findByText("10")).toBeInTheDocument();
            expect(screen.getByText("3")).toBeInTheDocument();
            expect(screen.getByText("20%")).toBeInTheDocument();
            expect(screen.getByText("See more stats")).toBeInTheDocument();
            expect(screen.queryByText("Genres")).not.toBeInTheDocument();
            expect(screen.queryByText("Top Artists")).not.toBeInTheDocument();
        });

        it("free user clicking 'See more stats' calls requirePro", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />, { authContext });

            await user.click(screen.getByRole("button", { name: "Library stats" }));
            await user.click(await screen.findByText("See more stats"));

            expect(mockRequirePro).toHaveBeenCalledWith("Library Stats");
        });

        it("Pro user sees full breakdowns", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />, { authContext });

            await user.click(screen.getByRole("button", { name: "Library stats" }));

            expect(await screen.findByText("Genres")).toBeInTheDocument();
            expect(screen.getByText("Top Artists")).toBeInTheDocument();
            expect(screen.queryByText("See more stats")).not.toBeInTheDocument();
        });
    });

    describe("4.2 Pro badge and upgrade CTA in navigation", () => {
        it("shows Pro badge in Header for Pro users", () => {
            setSubscription(true);
            render(
                <Header />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            expect(screen.getByText("PRO")).toBeInTheDocument();
        });

        it("shows Upgrade button in Header for free users", () => {
            setSubscription(false);
            render(
                <Header />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            expect(screen.getByText("UPGRADE")).toBeInTheDocument();
        });

        it("does not show Upgrade button in Header for Pro users", () => {
            setSubscription(true);
            render(
                <Header />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            expect(screen.queryByText("UPGRADE")).not.toBeInTheDocument();
        });

        it("does not show Pro badge in Header for free users", () => {
            setSubscription(false);
            render(
                <Header />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            expect(screen.queryByText("PRO")).not.toBeInTheDocument();
        });

        it("shows Upgrade to Pro link in MenuDrawer for free users", () => {
            setSubscription(false);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
        });

        it("does not show Upgrade to Pro link in MenuDrawer for Pro users", () => {
            setSubscription(true);
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            expect(screen.queryByText("Upgrade to Pro")).not.toBeInTheDocument();
        });

        it("clicking Upgrade in Header calls requirePro", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(
                <Header />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            await user.click(screen.getByText("UPGRADE"));

            expect(mockRequirePro).toHaveBeenCalledWith("Upgrade");
        });

        it("clicking Upgrade to Pro in MenuDrawer calls requirePro", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            await user.click(screen.getByText("Upgrade to Pro"));

            expect(mockRequirePro).toHaveBeenCalledWith("Upgrade");
        });
    });

    describe("3.10 Track notes gating", () => {
        it("shows PRO badge on 'Add note' for free users with no note", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);

            const noteItem = screen.getByText("Add note").closest("[data-part='item']")!;
            expect(within(noteItem as HTMLElement).getByText("PRO")).toBeInTheDocument();
        });

        it("calls requirePro when free user clicks 'Add note'", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);
            await user.click(screen.getByText("Add note"));

            expect(mockRequirePro).toHaveBeenCalledWith("Track Notes");
        });

        it("shows 'View note' without PRO badge for free users with existing note", async () => {
            setSubscription(false);
            const trackWithNote = { ...mockTrack, notes: "Great track" };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [trackWithNote, mockTrack2], currentTrack: 0 },
                },
            } as any);

            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);

            expect(screen.getByText("View note")).toBeInTheDocument();
            const noteItem = screen.getByText("View note").closest("[data-part='item']")!;
            expect(within(noteItem as HTMLElement).queryByText("PRO")).not.toBeInTheDocument();
        });

        it("free user can view existing note without requirePro", async () => {
            setSubscription(false);
            const trackWithNote = { ...mockTrack, notes: "Great track" };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [trackWithNote, mockTrack2], currentTrack: 0 },
                },
            } as any);

            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);
            await user.click(screen.getByText("View note"));

            expect(mockRequirePro).not.toHaveBeenCalledWith("Track Notes");
            expect(screen.getByText("Great track")).toBeInTheDocument();
        });

        it("does not show PRO badge on 'Add note' for Pro users", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);

            const noteItem = screen.getByText("Add note").closest("[data-part='item']")!;
            expect(within(noteItem as HTMLElement).queryByText("PRO")).not.toBeInTheDocument();
        });
    });
});

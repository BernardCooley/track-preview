import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import { mockSearchParams } from "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import Library from "../Library";
import MenuDrawer from "../MenuDrawer";
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

import { useSubscription } from "@/hooks/useSubscription";
const mockUseSubscription = vi.mocked(useSubscription);

const mockMutateUserProfile = vi.fn().mockResolvedValue({});
vi.mock("@/bff/bff", () => ({
    mutateUserProfile: (...args: unknown[]) => mockMutateUserProfile(...args),
    resolvePreviewUrl: vi.fn(),
    createCheckoutSession: vi.fn(),
}));

function setSubscription(isPro: boolean) {
    mockRequirePro.mockImplementation(() => {
        if (isPro) return true;
        return false;
    });
    mockUseSubscription.mockReturnValue({
        isPro,
        isInGracePeriod: false,
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

        it("calls requirePro when free user enables curated mode", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: freeProfile as any } }
            );

            const checkboxes = screen.getAllByRole("checkbox");
            const curatedSwitch = checkboxes[0];
            await user.click(curatedSwitch);

            expect(mockRequirePro).toHaveBeenCalledWith("Curated Mode");
            expect(mockMutateUserProfile).not.toHaveBeenCalled();
        });

        it("allows Pro user to enable curated mode", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(
                <MenuDrawer isOpen={true} onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" }, userProfile: proProfile as any } }
            );

            const checkboxes = screen.getAllByRole("checkbox");
            const curatedSwitch = checkboxes[0];
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

    describe("2.3 Purchase tracking gate", () => {
        it("calls requirePro when free user clicks buy button", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const buyButtons = screen.getAllByRole("button", { name: "buy track" });
            await user.click(buyButtons[0]);

            expect(mockRequirePro).toHaveBeenCalledWith("Purchase Tracking");
            expect(baseHookReturn.setTrackToBuy).not.toHaveBeenCalled();
        });

        it("allows Pro user to click buy button", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />);

            const buyButtons = screen.getAllByRole("button", { name: "buy track" });
            await user.click(buyButtons[0]);

            expect(mockRequirePro).toHaveBeenCalledWith("Purchase Tracking");
            expect(baseHookReturn.setTrackToBuy).toHaveBeenCalled();
        });

        it("calls requirePro when free user clicks Mark as bought", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            await user.click(optionsButton!);

            await user.click(screen.getByText("Mark as bought"));

            expect(mockRequirePro).toHaveBeenCalledWith("Purchase Tracking");
            expect(baseHookReturn.toggleTrackPurchased).not.toHaveBeenCalled();
        });

        it("opens upgrade prompt when free user clicks filter group (covers hide bought)", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /Upgrade to Pro/i }));

            expect(mockRequirePro).toHaveBeenCalledWith("Library Tools");
        });
    });

    describe("2.4 Sorting and filtering gate", () => {
        it("calls requirePro when free user clicks filter group", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /Upgrade to Pro/i }));

            expect(mockRequirePro).toHaveBeenCalledWith("Library Tools");
        });

        it("shows PRO badge on filter group for free users", () => {
            setSubscription(false);
            render(<Library />);

            expect(screen.getAllByText("PRO").length).toBeGreaterThan(0);
        });

        it("does not show PRO badge for Pro users", () => {
            setSubscription(true);
            render(<Library />);

            expect(screen.queryAllByText("PRO")).toHaveLength(0);
        });

        it("calls requirePro when free user clicks sort area", async () => {
            setSubscription(false);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /Upgrade to Pro/i }));

            expect(mockRequirePro).toHaveBeenCalledWith("Library Tools");
        });

        it("allows Pro user to open sort menu", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: "Sort" }));

            expect(screen.getByText("title")).toBeInTheDocument();
        });

        it("Pro user genre filter does not call requirePro", async () => {
            setSubscription(true);
            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /All genres/i }));

            expect(mockRequirePro).not.toHaveBeenCalled();
        });
    });
});

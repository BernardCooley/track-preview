import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import { mockSearchParams } from "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import Library from "../Library";
import { mockTrack, mockTrack2, mockTrack3 } from "../../../test/mocks/data";

const mockGetTracks = vi.fn();
const mockSetLibraryTrackIds = vi.fn();

vi.mock("@/hooks/useTrackList", () => ({
    useTrackList: vi.fn(),
}));

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: () => ({
        isPro: true,
        isInGracePeriod: false,
        subscriptionTier: "PRO",
        subscriptionStatus: "ACTIVE",
        upgradeFeature: null,
        requirePro: () => true,
        dismissUpgrade: vi.fn(),
    }),
}));

import { useTrackList } from "@/hooks/useTrackList";
const mockUseTrackList = vi.mocked(useTrackList);

const mockToggleTrackPurchased = vi.fn();

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
    previousTracks: [] as typeof mockTrack[],
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
    getTracks: mockGetTracks,
    closeBuyModal: vi.fn(),
    closeDialog: vi.fn(),
    deleteTrack: vi.fn(),
    showToast: vi.fn(),
    addTrackToLibrary: vi.fn(),
    addingTrackId: null,
    libraryTrackIds: new Set<string>(),
    setLibraryTrackIds: mockSetLibraryTrackIds,
    toggleTrackPurchased: mockToggleTrackPurchased,
};

describe("Library", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTrackList.mockReturnValue(baseHookReturn as any);
    });

    describe("filter persistence via URL params", () => {
        afterEach(() => {
            mockSearchParams.delete("genres");
            mockSearchParams.delete("sort");
            mockSearchParams.delete("sortDir");
            mockSearchParams.delete("release");
        });

        it("reads genre filter from URL params", () => {
            mockSearchParams.set("genres", "Techno");
            render(<Library />);

            expect(screen.getByRole("button", { name: "Techno" })).toBeInTheDocument();
        });

        it("reads sort filter from URL params", () => {
            mockSearchParams.set("sort", "artist");
            mockSearchParams.set("sortDir", "desc");
            render(<Library />);

            expect(screen.getByText(/Artist \(Z-A\)/i)).toBeInTheDocument();
        });

        it("hides filter buttons in release view", () => {
            mockSearchParams.set("genres", "Techno");
            mockSearchParams.set("sort", "artist");
            mockSearchParams.set("sortDir", "desc");

            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                currentReleaseTrack: mockTrack,
                previousTracks: [mockTrack, mockTrack2],
            } as any);

            render(<Library />);

            expect(screen.queryByRole("button", { name: "Techno" })).not.toBeInTheDocument();
            expect(screen.queryByText(/Artist \(Z-A\)/i)).not.toBeInTheDocument();
        });

        it("preserves filter params after returning from release view", () => {
            mockSearchParams.set("genres", "Techno");
            mockSearchParams.set("sort", "artist");
            mockSearchParams.set("sortDir", "desc");

            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                currentReleaseTrack: mockTrack,
                previousTracks: [mockTrack, mockTrack2],
            } as any);

            const { rerender } = render(<Library />);

            mockUseTrackList.mockReturnValue(baseHookReturn as any);
            rerender(<Library />);

            expect(screen.getByRole("button", { name: "Techno" })).toBeInTheDocument();
            expect(screen.getByText(/Artist \(Z-A\)/i)).toBeInTheDocument();
        });
    });

    it("calls getTracks on mount when changesMade[4] is true", () => {
        mockUseTrackList.mockReturnValue({
            ...baseHookReturn,
            changesMade: { 2: false, 3: false, 4: true },
        } as any);

        render(<Library />);

        expect(mockGetTracks).toHaveBeenCalledWith(null);
    });

    it("does not call getTracks when viewing a release even if changesMade[4] is true", () => {
        mockUseTrackList.mockReturnValue({
            ...baseHookReturn,
            currentReleaseTrack: mockTrack,
            changesMade: { 2: false, 3: false, 4: true },
        } as any);

        render(<Library />);

        expect(mockGetTracks).not.toHaveBeenCalled();
    });

    it("populates libraryTrackIds from previousTracks when entering release view", () => {
        mockUseTrackList.mockReturnValue({
            ...baseHookReturn,
            currentReleaseTrack: mockTrack,
            previousTracks: [mockTrack, mockTrack2, mockTrack3],
        } as any);

        render(<Library />);

        expect(mockSetLibraryTrackIds).toHaveBeenCalled();
        const setArg = mockSetLibraryTrackIds.mock.calls[0][0];
        expect(setArg).toBeInstanceOf(Set);
        expect(setArg.has("track-1")).toBe(true);
        expect(setArg.has("track-2")).toBe(true);
        expect(setArg.has("track-3")).toBe(true);
    });

    describe("release view header", () => {
        it("renders play all and buy release buttons when viewing a release", () => {
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                currentReleaseTrack: mockTrack,
                previousTracks: [mockTrack, mockTrack2],
            } as any);

            render(<Library />);

            expect(screen.getByRole("button", { name: /play all/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /buy release/i })).toBeInTheDocument();
        });

        it("renders back to library button when viewing a release", () => {
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                currentReleaseTrack: mockTrack,
                previousTracks: [mockTrack, mockTrack2],
            } as any);

            render(<Library />);

            expect(screen.getByRole("button", { name: /back to library/i })).toBeInTheDocument();
        });

        it("does not render release header buttons in library view", () => {
            render(<Library />);

            expect(screen.queryByRole("button", { name: /play all/i })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /buy release/i })).not.toBeInTheDocument();
        });

        it("opens buy modal when buy release button is clicked", async () => {
            const onBuyModalOpen = vi.fn();
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                currentReleaseTrack: mockTrack,
                previousTracks: [mockTrack, mockTrack2],
                onBuyModalOpen,
            } as any);

            const user = userEvent.setup();
            render(<Library />);

            await user.click(screen.getByRole("button", { name: /buy release/i }));
            expect(onBuyModalOpen).toHaveBeenCalled();
        });
    });

    describe("purchased features", () => {
        afterEach(() => {
            mockSearchParams.delete("hideBought");
        });

        it("shows 'Mark as bought' in track options menu", async () => {
            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            if (optionsButton) {
                await user.click(optionsButton);
                expect(screen.getByText("Mark as bought")).toBeInTheDocument();
            }
        });

        it("shows 'Mark as not bought' for purchased tracks", async () => {
            const purchasedTrack = { ...mockTrack, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2], currentTrack: 0 },
                },
            } as any);

            const user = userEvent.setup();
            render(<Library />);

            const menuButtons = screen.getAllByRole("button", { name: "" });
            const optionsButton = menuButtons.find(
                (btn) => btn.querySelector("[data-testid='MoreHorizIcon']")
            );
            if (optionsButton) {
                await user.click(optionsButton);
                expect(screen.getByText("Mark as not bought")).toBeInTheDocument();
            }
        });

        it("renders check badge on purchased track buy button", () => {
            const purchasedTrack = { ...mockTrack, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            const boughtButtons = screen.getAllByRole("button", { name: "bought" });
            expect(boughtButtons.length).toBeGreaterThan(0);
        });

        it("renders normal buy button for non-purchased tracks", () => {
            render(<Library />);

            const buyButtons = screen.getAllByRole("button", { name: "buy track" });
            expect(buyButtons.length).toBeGreaterThan(0);
            expect(screen.queryByRole("button", { name: "bought" })).not.toBeInTheDocument();
        });

        it("renders hide bought filter button", () => {
            render(<Library />);

            expect(screen.getByRole("button", { name: "Filter bought tracks" })).toBeInTheDocument();
        });

        it("hides purchased tracks when hideBought filter is active", () => {
            mockSearchParams.set("hideBought", "true");

            const purchasedTrack = { ...mockTrack, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            expect(screen.queryByText("Test Track")).not.toBeInTheDocument();
            expect(screen.getAllByText("Another Track").length).toBeGreaterThan(0);
        });

        it("shows all tracks when hideBought filter is not active", () => {
            const purchasedTrack = { ...mockTrack, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            expect(screen.getAllByText("Test Track").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Another Track").length).toBeGreaterThan(0);
        });

        it("shows empty state message when all tracks are bought and filter is active", () => {
            mockSearchParams.set("hideBought", "true");

            const purchasedTrack1 = { ...mockTrack, purchased: true };
            const purchasedTrack2 = { ...mockTrack2, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack1, purchasedTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            expect(screen.getByText("All tracks have been bought")).toBeInTheDocument();
        });

        it("does not show empty state when filter is off even if all tracks are purchased", () => {
            const purchasedTrack1 = { ...mockTrack, purchased: true };
            const purchasedTrack2 = { ...mockTrack2, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack1, purchasedTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            expect(screen.queryByText("All tracks have been bought")).not.toBeInTheDocument();
        });

        it("reads hideBought filter from URL params", () => {
            mockSearchParams.set("hideBought", "true");

            const purchasedTrack = { ...mockTrack, purchased: true };
            mockUseTrackList.mockReturnValue({
                ...baseHookReturn,
                reviewTracks: {
                    ...baseHookReturn.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2], currentTrack: 0 },
                },
            } as any);

            render(<Library />);

            expect(screen.queryByText("Test Track")).not.toBeInTheDocument();
        });

        it("includes purchased in sort options", async () => {
            const user = userEvent.setup();
            render(<Library />);

            const sortButton = screen.getByRole("button", { name: "Sort" });
            await user.click(sortButton);

            expect(screen.getByText("Bought")).toBeInTheDocument();
        });
    });
});

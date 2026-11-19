import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import Library from "../Library";
import { mockTrack, mockTrack2, mockTrack3 } from "../../../test/mocks/data";

const mockGetTracks = vi.fn();
const mockSetLibraryTrackIds = vi.fn();

vi.mock("@/hooks/useTrackList", () => ({
    useTrackList: vi.fn(),
}));

import { useTrackList } from "@/hooks/useTrackList";
const mockUseTrackList = vi.mocked(useTrackList);

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
};

describe("Library", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTrackList.mockReturnValue(baseHookReturn as any);
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
});

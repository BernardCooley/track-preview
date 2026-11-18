import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import DeleteTrackDialog from "../DeleteTrackDialog";
import { mockTrack, mockTrack2, makeReviewTracks } from "../../../test/mocks/data";

describe("DeleteTrackDialog", () => {
    const reviewTracks = makeReviewTracks([mockTrack, mockTrack2]);
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        closeDialog: vi.fn(),
        reviewTracks,
        trackToDelete: 0,
        deleteTrack: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders dialog with track title", () => {
        render(<DeleteTrackDialog {...defaultProps} />);
        expect(screen.getByText("Delete Track")).toBeInTheDocument();
        expect(screen.getByText("Test Track")).toBeInTheDocument();
    });

    it("renders track artist", () => {
        render(<DeleteTrackDialog {...defaultProps} />);
        expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });

    it("shows confirmation text", () => {
        render(<DeleteTrackDialog {...defaultProps} />);
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });

    it("shows undo warning", () => {
        render(<DeleteTrackDialog {...defaultProps} />);
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it("calls deleteTrack when delete button clicked", async () => {
        const deleteTrack = vi.fn();
        const user = userEvent.setup();
        render(<DeleteTrackDialog {...defaultProps} deleteTrack={deleteTrack} />);

        await user.click(screen.getByRole("button", { name: /delete/i }));
        expect(deleteTrack).toHaveBeenCalled();
    });

    it("calls closeDialog when cancel button clicked", async () => {
        const closeDialog = vi.fn();
        const user = userEvent.setup();
        render(<DeleteTrackDialog {...defaultProps} closeDialog={closeDialog} />);

        await user.click(screen.getByRole("button", { name: /cancel/i }));
        expect(closeDialog).toHaveBeenCalled();
    });

    it("displays second track info when trackToDelete is 1", () => {
        render(<DeleteTrackDialog {...defaultProps} trackToDelete={1} />);
        expect(screen.getByText("Another Track")).toBeInTheDocument();
        expect(screen.getByText("Another Artist")).toBeInTheDocument();
    });
});

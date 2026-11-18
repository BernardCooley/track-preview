import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import BuyModal from "../BuyModal";
import { mockTrack, mockTrack2, makeReviewTracks } from "../../../test/mocks/data";
import type { IBuyLink } from "../../../types";

const buyLinks: IBuyLink[] = [
    { platform: "beatport", logo: "/logos/beatport.png" },
    { platform: "discogs", logo: "/logos/discogs.jpeg" },
    { platform: "bandcamp", logo: "/logos/bandcamp.png" },
    { platform: "apple music", logo: "/logos/apple_music.jpeg" },
];

describe("BuyModal", () => {
    const reviewTracks = makeReviewTracks([mockTrack, mockTrack2]);
    const defaultProps = {
        buyModalIsOpen: true,
        closeBuyModal: vi.fn(),
        buyLinks,
        reviewTracks,
        trackToBuy: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders buy modal title", () => {
        render(<BuyModal {...defaultProps} />);
        expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    it("renders buy links for the track genre", () => {
        render(<BuyModal {...defaultProps} />);
        expect(screen.getByText("Beatport")).toBeInTheDocument();
    });

    it("always shows general stores", () => {
        render(<BuyModal {...defaultProps} />);
        expect(screen.getByText("Discogs")).toBeInTheDocument();
        expect(screen.getByText("Bandcamp")).toBeInTheDocument();
        expect(screen.getByText("Apple Music")).toBeInTheDocument();
    });

    it("renders disclaimer text", () => {
        render(<BuyModal {...defaultProps} />);
        expect(screen.getByText(/results may vary/i)).toBeInTheDocument();
    });

    it("calls closeBuyModal when close button clicked", async () => {
        const closeBuyModal = vi.fn();
        const user = userEvent.setup();
        render(<BuyModal {...defaultProps} closeBuyModal={closeBuyModal} />);

        await user.click(screen.getByRole("button", { name: /close/i }));
        expect(closeBuyModal).toHaveBeenCalled();
    });

    it("filters links based on track genre", () => {
        const ambientTrack = { ...mockTrack, genre: "Country" };
        const rt = makeReviewTracks([ambientTrack]);
        render(<BuyModal {...defaultProps} reviewTracks={rt} />);
        expect(screen.queryByText("Beatport")).not.toBeInTheDocument();
        expect(screen.getByText("Discogs")).toBeInTheDocument();
    });

    it("handles null trackToBuy gracefully", () => {
        render(<BuyModal {...defaultProps} trackToBuy={null} />);
        expect(screen.getByText("Buy")).toBeInTheDocument();
    });
});

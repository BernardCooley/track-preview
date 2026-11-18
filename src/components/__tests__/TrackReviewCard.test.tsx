import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import TrackReviewCard from "../TrackReviewCard";
import { mockTrack, mockTrack2 } from "../../../test/mocks/data";

vi.mock("react-h5-audio-player", () => {
    const RHAP_UI = {
        ADDITIONAL_CONTROLS: "ADDITIONAL_CONTROLS",
        MAIN_CONTROLS: "MAIN_CONTROLS",
    };
    const React = require("react");
    const AudioPlayer = React.forwardRef((props: any, ref: any) => (
        <div data-testid="audio-player">
            {props.header}
            {Array.isArray(props.customControlsSection) &&
                props.customControlsSection.map((item: any, i: number) =>
                    typeof item === "object" && item !== null && item.$$typeof
                        ? React.cloneElement(item, { key: i })
                        : null
                )}
        </div>
    ));
    AudioPlayer.displayName = "AudioPlayer";
    return { default: AudioPlayer, RHAP_UI };
});

describe("TrackReviewCard", () => {
    const defaultProps = {
        currentTrack: mockTrack,
        previewUrl: "https://example.com/preview.mp3",
        onLikeOrDislike: vi.fn(() => Promise.resolve()),
        onAudioPlay: vi.fn(),
        autoplay: false,
        isOpen: true,
        trackList: [mockTrack, mockTrack2],
        setCurrentTrack: vi.fn(),
        onAutoPlayToggle: vi.fn(),
        preferredAutoPlay: false,
        profileLoaded: true,
        autoplayLoading: false,
        noTracks: false,
        loading: false,
        reviewStep: 1,
        toggleTracklist: vi.fn(),
        isShowingTracklist: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders track title", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByText("Test Track")).toBeInTheDocument();
    });

    it("renders track artist", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });

    it("renders track genre", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByText("Techno")).toBeInTheDocument();
    });

    it("renders track release year", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByText("2023")).toBeInTheDocument();
    });

    it("renders like and dislike buttons", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByLabelText("like button")).toBeInTheDocument();
        expect(screen.getByLabelText("dislike button")).toBeInTheDocument();
    });

    it("calls onLikeOrDislike(true) when like button clicked", async () => {
        const onLikeOrDislike = vi.fn(() => Promise.resolve());
        const user = userEvent.setup();
        render(<TrackReviewCard {...defaultProps} onLikeOrDislike={onLikeOrDislike} />);

        await user.click(screen.getByLabelText("like button"));
        expect(onLikeOrDislike).toHaveBeenCalledWith(true);
    });

    it("calls onLikeOrDislike(false) when dislike button clicked", async () => {
        const onLikeOrDislike = vi.fn(() => Promise.resolve());
        const user = userEvent.setup();
        render(<TrackReviewCard {...defaultProps} onLikeOrDislike={onLikeOrDislike} />);

        await user.click(screen.getByLabelText("dislike button"));
        expect(onLikeOrDislike).toHaveBeenCalledWith(false);
    });

    it("shows loading message when provided", () => {
        render(<TrackReviewCard {...defaultProps} loadingMessage="Saving..." />);
        expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("renders full track links section", () => {
        render(<TrackReviewCard {...defaultProps} />);
        expect(screen.getByText("Listen to the full track")).toBeInTheDocument();
        expect(screen.getByText("Youtube")).toBeInTheDocument();
        expect(screen.getByText("Spotify")).toBeInTheDocument();
    });
});

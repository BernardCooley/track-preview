import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import FilterTags from "../FilterTags";

describe("FilterTags", () => {
    const defaultProps = {
        profileLoaded: true,
        reviewStep: 1,
        onGenreClick: vi.fn(),
        onYearClick: vi.fn(),
    };

    it("shows a spinner when genres is null (still loading)", () => {
        render(<FilterTags {...defaultProps} genres={null} yearRange={{ from: 1960, to: 2026 }} />);
        expect(screen.queryByText("All genres")).not.toBeInTheDocument();
    });

    it("shows 'All genres' when genres contains 'all'", () => {
        render(<FilterTags {...defaultProps} genres={["all"]} yearRange={{ from: 1960, to: 2026 }} />);
        expect(screen.getByText("All genres")).toBeInTheDocument();
    });

    it("shows single genre name when one genre selected", () => {
        render(<FilterTags {...defaultProps} genres={["Techno"]} yearRange={{ from: 1960, to: 2026 }} />);
        expect(screen.getByText("Techno")).toBeInTheDocument();
    });

    it("shows genre count when multiple genres selected", () => {
        render(<FilterTags {...defaultProps} genres={["Techno", "House"]} yearRange={{ from: 1960, to: 2026 }} />);
        expect(screen.getByText("2 genres")).toBeInTheDocument();
    });

    it("shows 'All years' when full range", () => {
        const currentYear = new Date().getFullYear();
        render(<FilterTags {...defaultProps} genres={["all"]} yearRange={{ from: 1960, to: currentYear }} />);
        expect(screen.getByText("All years")).toBeInTheDocument();
    });

    it("shows year range when filtered", () => {
        render(<FilterTags {...defaultProps} genres={["all"]} yearRange={{ from: 1990, to: 2000 }} />);
        expect(screen.getByText("1990 - 2000")).toBeInTheDocument();
    });

    it("calls onGenreClick when genre button clicked", async () => {
        const onGenreClick = vi.fn();
        const user = userEvent.setup();
        render(<FilterTags {...defaultProps} onGenreClick={onGenreClick} genres={["all"]} yearRange={{ from: 1960, to: 2026 }} />);

        await user.click(screen.getByText("All genres"));
        expect(onGenreClick).toHaveBeenCalled();
    });

    it("calls onYearClick when year button clicked", async () => {
        const onYearClick = vi.fn();
        const user = userEvent.setup();
        render(<FilterTags {...defaultProps} onYearClick={onYearClick} genres={["all"]} yearRange={{ from: 1960, to: 2026 }} />);

        await user.click(screen.getByText("All years"));
        expect(onYearClick).toHaveBeenCalled();
    });
});

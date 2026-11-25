import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";
import LibraryExportButton from "../LibraryExportButton";
import UpgradePrompt from "../UpgradePrompt";

const mockTrackEvent = vi.fn();
vi.mock("@amplitude/unified", () => ({
    track: (...args: any[]) => mockTrackEvent(...args),
    initAll: vi.fn(),
    setUserId: vi.fn(),
}));

vi.mock("@/hooks/useProPrice", () => ({
    useProPrice: () => ({ formatted: "£2.99", interval: "month" }),
}));

describe("analytics events", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("LibraryExportButton", () => {
        it("fires 'Export Started' with file type and format on export", async () => {
            server.use(
                http.post("/api/exportLibrary", () => {
                    return new HttpResponse(new Blob(["test"]), {
                        headers: { "Content-Type": "text/csv" },
                    });
                })
            );

            const user = userEvent.setup();
            render(
                <LibraryExportButton requirePro={() => true} isPro={true} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" } } }
            );

            await user.click(screen.getByLabelText("Export library"));
            await user.click(screen.getByText("Download"));

            expect(mockTrackEvent).toHaveBeenCalledWith("Export Started", {
                type: "file",
                format: "csv",
            });
        });
    });

    describe("UpgradePrompt", () => {
        it("fires 'Upgrade Started' with source and feature on upgrade click", async () => {
            server.use(
                http.post("/api/stripe/create-checkout-session", () => {
                    return HttpResponse.json({ url: "https://checkout.stripe.com/test" });
                })
            );

            const user = userEvent.setup();
            render(
                <UpgradePrompt featureName="Spotify Export" onClose={vi.fn()} />,
                { authContext: { user: { uid: "user-1", email: "test@test.com" } } }
            );

            await user.click(screen.getByText("Upgrade"));

            expect(mockTrackEvent).toHaveBeenCalledWith("Upgrade Started", {
                source: "prompt",
                feature: "Spotify Export",
            });
        });

        it("does not fire analytics when no user is logged in", async () => {
            const user = userEvent.setup();
            render(
                <UpgradePrompt featureName="Spotify Export" onClose={vi.fn()} />,
                { authContext: { user: null } }
            );

            await user.click(screen.getByText("Upgrade"));

            expect(mockTrackEvent).not.toHaveBeenCalled();
        });
    });
});

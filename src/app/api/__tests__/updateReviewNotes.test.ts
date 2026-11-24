import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../updateReviewNotes/route";

const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        review: {
            update: (...args: any[]) => mockUpdate(...args),
        },
    },
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/updateReviewNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("updateReviewNotes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates notes on a review", async () => {
        mockUpdate.mockResolvedValue({});

        const res = await POST(
            makeRequest({ trackId: "track-1", userId: "user-1", notes: "Great for warm-up sets" })
        );

        expect(mockUpdate).toHaveBeenCalledOnce();
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { userId_trackId: { userId: "user-1", trackId: "track-1" } },
            data: { notes: "Great for warm-up sets" },
        });

        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(res.status).toBe(200);
    });

    it("clears notes when null is passed", async () => {
        mockUpdate.mockResolvedValue({});

        const res = await POST(
            makeRequest({ trackId: "track-1", userId: "user-1", notes: null })
        );

        expect(mockUpdate).toHaveBeenCalledWith({
            where: { userId_trackId: { userId: "user-1", trackId: "track-1" } },
            data: { notes: null },
        });

        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(res.status).toBe(200);
    });

    it("returns 400 when trackId is missing", async () => {
        const res = await POST(
            makeRequest({ userId: "user-1", notes: "test" })
        );

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 when userId is missing", async () => {
        const res = await POST(
            makeRequest({ trackId: "track-1", notes: "test" })
        );

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 when notes is not a string or null", async () => {
        const res = await POST(
            makeRequest({ trackId: "track-1", userId: "user-1", notes: 123 })
        );

        expect(res.status).toBe(400);
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("returns 500 on database error", async () => {
        mockUpdate.mockRejectedValue(new Error("DB error"));

        const res = await POST(
            makeRequest({ trackId: "track-1", userId: "user-1", notes: "test" })
        );

        expect(res.status).toBe(500);
    });
});

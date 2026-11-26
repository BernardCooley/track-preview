import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../sendToLibrary/route";

const mockUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        review: {
            upsert: (...args: any[]) => mockUpsert(...args),
        },
    },
}));

vi.mock("@/lib/auth", () => ({
    verifyAuth: vi.fn().mockResolvedValue({ uid: "user-1" }),
    isAuthError: vi.fn().mockReturnValue(false),
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/sendToLibrary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

describe("sendToLibrary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("uses upsert with the unique compound key", async () => {
        mockUpsert.mockResolvedValue({});

        const res = await POST(makeRequest({ trackId: "track-1", userId: "user-1" }));

        expect(mockUpsert).toHaveBeenCalledOnce();
        expect(mockUpsert).toHaveBeenCalledWith({
            where: { userId_trackId: { userId: "user-1", trackId: "track-1" } },
            update: { currentReviewStep: 4, furthestReviewStep: 4 },
            create: {
                currentReviewStep: 4,
                furthestReviewStep: 4,
                Track: { connect: { id: "track-1" } },
                user: { connect: { id: "user-1" } },
            },
        });

        const json = await res.json();
        expect(json).toEqual({ success: true });
        expect(res.status).toBe(200);
    });

    it("does not write lastActiveAt", async () => {
        mockUpsert.mockResolvedValue({});

        await POST(makeRequest({ trackId: "track-1", userId: "user-1" }));

        const call = mockUpsert.mock.calls[0][0];
        expect(call.update).not.toHaveProperty("lastActiveAt");
        expect(call.create).not.toHaveProperty("lastActiveAt");
    });

    it("returns 500 on error", async () => {
        mockUpsert.mockRejectedValue(new Error("DB error"));

        const res = await POST(makeRequest({ trackId: "track-1", userId: "user-1" }));

        expect(res.status).toBe(500);
    });
});

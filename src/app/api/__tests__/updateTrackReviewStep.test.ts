import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../updateTrackReviewStep/route";

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
    return new Request("http://localhost/api/updateTrackReviewStep", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

describe("updateTrackReviewStep", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("uses upsert instead of find+create/update", async () => {
        const review = { id: "rev-1", currentReviewStep: 2, furthestReviewStep: 2 };
        mockUpsert.mockResolvedValue(review);

        const res = await POST(
            makeRequest({
                trackId: "track-1",
                like: true,
                reviewStep: 1,
                userId: "user-1",
                curatedMode: true,
            })
        );

        expect(mockUpsert).toHaveBeenCalledOnce();
        expect(mockUpsert).toHaveBeenCalledWith({
            where: { userId_trackId: { userId: "user-1", trackId: "track-1" } },
            update: { currentReviewStep: 2, furthestReviewStep: 2 },
            create: {
                currentReviewStep: 2,
                furthestReviewStep: 2,
                Track: { connect: { id: "track-1" } },
                user: { connect: { id: "user-1" } },
            },
        });

        const json = await res.json();
        expect(json).toEqual([review]);
        expect(res.status).toBe(200);
    });

    it("sets currentReviewStep to 4 when not curated mode and reviewStep is 1 (like)", async () => {
        mockUpsert.mockResolvedValue({ id: "rev-1" });

        await POST(
            makeRequest({
                trackId: "track-1",
                like: true,
                reviewStep: 1,
                userId: "user-1",
                curatedMode: false,
            })
        );

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({ currentReviewStep: 4 }),
            })
        );
    });

    it("sets currentReviewStep to 0 on dislike", async () => {
        mockUpsert.mockResolvedValue({ id: "rev-1" });

        await POST(
            makeRequest({
                trackId: "track-1",
                like: false,
                reviewStep: 2,
                userId: "user-1",
                curatedMode: true,
            })
        );

        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    currentReviewStep: 0,
                    furthestReviewStep: 2,
                }),
                create: expect.objectContaining({
                    currentReviewStep: 0,
                    furthestReviewStep: 1,
                }),
            })
        );
    });

    it("does not write lastActiveAt", async () => {
        mockUpsert.mockResolvedValue({ id: "rev-1" });

        await POST(
            makeRequest({
                trackId: "track-1",
                like: true,
                reviewStep: 1,
                userId: "user-1",
            })
        );

        const call = mockUpsert.mock.calls[0][0];
        expect(call.update).not.toHaveProperty("lastActiveAt");
        expect(call.create).not.toHaveProperty("lastActiveAt");
    });

    it("returns 500 on error", async () => {
        mockUpsert.mockRejectedValue(new Error("DB error"));

        const res = await POST(
            makeRequest({
                trackId: "track-1",
                like: true,
                reviewStep: 1,
                userId: "user-1",
            })
        );

        expect(res.status).toBe(500);
    });
});

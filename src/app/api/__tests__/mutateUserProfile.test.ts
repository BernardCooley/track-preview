import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../mutateUserProfile/route";

const mockUpdate = vi.fn();
const mockUpdateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            update: (...args: any[]) => mockUpdate(...args),
        },
        review: {
            updateMany: (...args: any[]) => mockUpdateMany(...args),
        },
    },
}));

vi.mock("@/lib/auth", () => ({
    verifyAuth: vi.fn().mockResolvedValue({ uid: "user-1" }),
    isAuthError: vi.fn().mockReturnValue(false),
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/mutateUserProfile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

describe("mutateUserProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("includes lastActiveAt in the update data", async () => {
        mockUpdate.mockResolvedValue({ id: "user-1" });

        await POST(
            makeRequest({
                userId: "user-1",
                autoplay: true,
            })
        );

        expect(mockUpdate).toHaveBeenCalledOnce();
        const call = mockUpdate.mock.calls[0][0];
        expect(call.data).toHaveProperty("lastActiveAt");
        expect(call.data.lastActiveAt).toBeInstanceOf(Date);
    });

    it("piggybacks lastActiveAt on genre update without extra query", async () => {
        mockUpdate.mockResolvedValue({ id: "user-1", genres: ["House"] });

        await POST(
            makeRequest({
                userId: "user-1",
                genres: ["House"],
            })
        );

        expect(mockUpdate).toHaveBeenCalledOnce();
        const call = mockUpdate.mock.calls[0][0];
        expect(call.data.genres).toEqual(["House"]);
        expect(call.data.lastActiveAt).toBeInstanceOf(Date);
    });

    it("promotes reviews when curatedMode is set to false", async () => {
        mockUpdate.mockResolvedValue({ id: "user-1" });
        mockUpdateMany.mockResolvedValue({ count: 2 });

        await POST(
            makeRequest({
                userId: "user-1",
                curatedMode: false,
            })
        );

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: {
                userId: "user-1",
                currentReviewStep: { in: [2, 3] },
            },
            data: {
                currentReviewStep: 4,
                furthestReviewStep: 4,
            },
        });
    });

    it("does not promote reviews when curatedMode is true", async () => {
        mockUpdate.mockResolvedValue({ id: "user-1" });

        await POST(
            makeRequest({
                userId: "user-1",
                curatedMode: true,
            })
        );

        expect(mockUpdateMany).not.toHaveBeenCalled();
    });
});

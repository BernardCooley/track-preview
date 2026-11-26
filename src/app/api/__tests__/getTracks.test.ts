import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../getTracks/route";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
        user: {
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth", () => ({
    verifyAuth: vi.fn().mockResolvedValue({ uid: "user-1" }),
    isAuthError: vi.fn().mockReturnValue(false),
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/getTracks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

describe("getTracks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not update lastActiveAt", async () => {
        const { default: prisma } = await import("@/lib/prisma");
        mockQueryRaw.mockResolvedValue([]);

        await POST(
            makeRequest({
                genres: ["Techno"],
                startYear: 1960,
                endYear: 2026,
                userId: "user-1",
                reviewStep: 1,
            })
        );

        expect(prisma!.user.update).not.toHaveBeenCalled();
    });

    it("returns tracks from raw query", async () => {
        const tracks = [{ id: "t1", title: "Track 1" }];
        mockQueryRaw.mockResolvedValue(tracks);

        const res = await POST(
            makeRequest({
                genres: ["all"],
                startYear: 1960,
                endYear: 2026,
                userId: "user-1",
                reviewStep: 1,
            })
        );

        const json = await res.json();
        expect(json).toEqual(tracks);
        expect(res.status).toBe(200);
    });

    describe("disliked track reinstatement", () => {
        it("explore query allows disliked tracks back after 2 years in top genres", async () => {
            mockQueryRaw.mockResolvedValue([]);

            await POST(
                makeRequest({
                    genres: ["all"],
                    startYear: 1960,
                    endYear: 2026,
                    userId: "user-1",
                    reviewStep: 1,
                })
            );

            const sql = mockQueryRaw.mock.calls[0][0].strings
                ? mockQueryRaw.mock.calls[0][0].strings.join("")
                : String(mockQueryRaw.mock.calls[0][0]);

            expect(sql).toContain('"currentReviewStep" = 0');
            expect(sql).toContain("INTERVAL '2 years'");
            expect(sql).toContain('"currentReviewStep" = 4');
            expect(sql).toContain("LIMIT 3");
        });

        it("non-explore queries do not include reinstatement logic", async () => {
            mockQueryRaw.mockResolvedValue([]);

            await POST(
                makeRequest({
                    genres: ["all"],
                    startYear: 1960,
                    endYear: 2026,
                    userId: "user-1",
                    reviewStep: 2,
                })
            );

            const sql = mockQueryRaw.mock.calls[0][0].strings
                ? mockQueryRaw.mock.calls[0][0].strings.join("")
                : String(mockQueryRaw.mock.calls[0][0]);

            expect(sql).not.toContain("INTERVAL '2 years'");
            expect(sql).toContain('"currentReviewStep" = 2');
        });
    });
});

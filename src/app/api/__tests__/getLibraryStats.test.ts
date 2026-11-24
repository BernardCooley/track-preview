import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../getLibraryStats/route";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
    },
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/getLibraryStats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("getLibraryStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when userId is missing", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("userId is required");
    });

    it("returns stats", async () => {
        mockQueryRaw
            .mockResolvedValueOnce([{ count: BigInt(42) }])
            .mockResolvedValueOnce([
                { genre: "Techno", count: BigInt(15) },
                { genre: "House", count: BigInt(10) },
            ])
            .mockResolvedValueOnce([
                { decade: 1990, count: BigInt(20) },
                { decade: 2000, count: BigInt(22) },
            ])
            .mockResolvedValueOnce([
                { artist: "Artist A", count: BigInt(5) },
                { artist: "Artist B", count: BigInt(3) },
            ])
            .mockResolvedValueOnce([{ count: BigInt(12) }])
            .mockResolvedValueOnce([{ count: BigInt(300) }])
            .mockResolvedValueOnce([
                { releaseTitle: "EP One", artist: "Artist A", count: BigInt(4) },
                { releaseTitle: "LP Two", artist: "Artist B", count: BigInt(2) },
            ]);

        const res = await POST(makeRequest({ userId: "user-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({
            totalTracks: 42,
            purchasedTracks: 12,
            totalReviewed: 300,
            genreBreakdown: [
                { genre: "Techno", count: 15 },
                { genre: "House", count: 10 },
            ],
            decadeDistribution: [
                { decade: 1990, count: 20 },
                { decade: 2000, count: 22 },
            ],
            topArtists: [
                { artist: "Artist A", count: 5 },
                { artist: "Artist B", count: 3 },
            ],
            topReleases: [
                { releaseTitle: "EP One", artist: "Artist A", count: 4 },
                { releaseTitle: "LP Two", artist: "Artist B", count: 2 },
            ],
        });
    });

    it("handles empty library", async () => {
        mockQueryRaw
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([]);

        const res = await POST(makeRequest({ userId: "user-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual({
            totalTracks: 0,
            purchasedTracks: 0,
            totalReviewed: 0,
            genreBreakdown: [],
            decadeDistribution: [],
            topArtists: [],
            topReleases: [],
        });
    });

    it("returns 500 on database error", async () => {
        mockQueryRaw.mockRejectedValue(new Error("DB error"));

        const res = await POST(makeRequest({ userId: "user-1" }));
        expect(res.status).toBe(500);
    });

    it("queries only library tracks (reviewStep 4)", async () => {
        mockQueryRaw
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([]);

        await POST(makeRequest({ userId: "user-1" }));

        const totalReviewedIndex = 5;
        for (let i = 0; i < mockQueryRaw.mock.calls.length; i++) {
            const queryStr = mockQueryRaw.mock.calls[i][0].strings.join("");
            if (i === totalReviewedIndex) {
                expect(queryStr).not.toContain('"currentReviewStep" = 4');
            } else {
                expect(queryStr).toContain('"currentReviewStep" = 4');
            }
        }
    });

    it("limits top artists to 10", async () => {
        mockQueryRaw
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([{ count: BigInt(0) }])
            .mockResolvedValueOnce([]);

        await POST(makeRequest({ userId: "user-1" }));

        const topArtistsQuery = mockQueryRaw.mock.calls[3][0].strings.join("");
        expect(topArtistsQuery).toContain("LIMIT 10");
    });
});

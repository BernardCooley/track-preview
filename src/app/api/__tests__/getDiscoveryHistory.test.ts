import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../getDiscoveryHistory/route";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
    },
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/getDiscoveryHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("getDiscoveryHistory", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when userId is missing", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("userId is required");
    });

    it("returns tracks from raw query", async () => {
        const tracks = [
            { id: "t1", title: "Track 1", currentReviewStep: 4, reviewedAt: "2026-01-01" },
        ];
        mockQueryRaw.mockResolvedValue(tracks);

        const res = await POST(makeRequest({ userId: "user-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json).toEqual(tracks);
    });

    it("defaults limit to 50 and offset to 0", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1" }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).toContain("LIMIT 50");
        expect(queryStr).toContain("OFFSET 0");
    });

    it("applies custom limit and offset", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1", limit: 20, offset: 40 }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).toContain("LIMIT 20");
        expect(queryStr).toContain("OFFSET 40");
    });

    it("adds search condition for title and artist", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1", search: "techno" }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).toContain("LOWER(t.\"title\") LIKE '%techno%'");
        expect(queryStr).toContain("LOWER(t.\"artist\") LIKE '%techno%'");
    });

    it("escapes single quotes in search term", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1", search: "it's" }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).toContain("it''s");
        expect(queryStr).not.toContain("it's%");
    });

    it("adds status filter condition", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1", status: 0 }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).toContain("r.\"currentReviewStep\" = 0");
    });

    it("does not add status condition when not provided", async () => {
        mockQueryRaw.mockResolvedValue([]);

        await POST(makeRequest({ userId: "user-1" }));

        const queryStr = mockQueryRaw.mock.calls[0][0].strings.join("");
        expect(queryStr).not.toContain('"currentReviewStep" =');
    });

    it("returns 500 on database error", async () => {
        mockQueryRaw.mockRejectedValue(new Error("DB error"));

        const res = await POST(makeRequest({ userId: "user-1" }));
        expect(res.status).toBe(500);
    });
});

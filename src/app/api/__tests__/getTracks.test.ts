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

function makeRequest(body: object) {
    return new Request("http://localhost/api/getTracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
});

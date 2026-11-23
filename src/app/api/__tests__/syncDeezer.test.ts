import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        track: {
            createMany: (...args: any[]) => mockCreateMany(...args),
        },
    },
}));

vi.mock("@/lib/notifyDiscord", () => ({
    notifyDiscord: vi.fn(),
}));

const mockChartTracks = vi.fn();
const mockSearchTrack = vi.fn();

vi.mock("@/lib/deezer", () => ({
    deezer: {
        chart: {
            tracks: (...args: any[]) => mockChartTracks(...args),
        },
        search: {
            track: (...args: any[]) => mockSearchTrack(...args),
        },
    },
}));

vi.mock("../../../../../data/genres", () => ({
    genres: ["Techno", "House"],
}));

vi.mock("../../../../../data/deezerGenreMap", () => ({
    deezerGenreMap: { Techno: "Techno", House: "House" },
    appGenreToDeezerIds: { Techno: [106], House: [113] },
}));

function makeRequest(url: string) {
    return new Request(url, {
        method: "GET",
        headers: { authorization: `Bearer test-secret` },
    });
}

describe("syncDeezer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("CRON_SECRET", "test-secret");
    });

    it("fetches genres in parallel (not sequentially)", async () => {
        const { GET } = await import("../cron/syncDeezer/route");

        const callOrder: string[] = [];

        mockChartTracks.mockResolvedValue({ data: [] });

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
            if (url.includes("api.deezer.com/chart/106")) {
                callOrder.push("chart-106-start");
                await new Promise((r) => setTimeout(r, 50));
                callOrder.push("chart-106-end");
                return { json: () => Promise.resolve({ data: [] }) };
            }
            if (url.includes("api.deezer.com/chart/113")) {
                callOrder.push("chart-113-start");
                await new Promise((r) => setTimeout(r, 50));
                callOrder.push("chart-113-end");
                return { json: () => Promise.resolve({ data: [] }) };
            }
            return { json: () => Promise.resolve({ data: [] }) };
        });

        mockSearchTrack.mockResolvedValue({ data: [] });
        mockCreateMany.mockResolvedValue({ count: 0 });

        await GET(makeRequest("http://localhost/api/cron/syncDeezer?all=true"));

        const start106 = callOrder.indexOf("chart-106-start");
        const start113 = callOrder.indexOf("chart-113-start");
        const end106 = callOrder.indexOf("chart-106-end");

        expect(start106).toBeGreaterThanOrEqual(0);
        expect(start113).toBeGreaterThanOrEqual(0);
        // 113 should start before 106 finishes (parallel)
        expect(start113).toBeLessThan(end106);

        globalThis.fetch = originalFetch;
    });

    it("returns 401 without valid auth", async () => {
        const { GET } = await import("../cron/syncDeezer/route");

        const res = await GET(
            new Request("http://localhost/api/cron/syncDeezer", {
                method: "GET",
                headers: { authorization: "Bearer wrong" },
            })
        );

        expect(res.status).toBe(401);
    });

    it("handles individual genre fetch failures gracefully", async () => {
        const { GET } = await import("../cron/syncDeezer/route");

        mockChartTracks.mockResolvedValue({ data: [] });

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
            if (url.includes("api.deezer.com/chart/106")) {
                throw new Error("Network error");
            }
            if (url.includes("api.deezer.com/chart/113")) {
                return {
                    json: () =>
                        Promise.resolve({
                            data: [
                                {
                                    id: 1,
                                    title: "Track",
                                    artist: { name: "Artist" },
                                    album: { title: "Album", cover_medium: "", release_date: "2024-01-01" },
                                    link: "",
                                },
                            ],
                        }),
                };
            }
            return { json: () => Promise.resolve({ data: [] }) };
        });

        mockSearchTrack.mockResolvedValue({ data: [] });
        mockCreateMany.mockResolvedValue({ count: 1 });

        const res = await GET(makeRequest("http://localhost/api/cron/syncDeezer?all=true"));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.total).toBeGreaterThanOrEqual(1);

        globalThis.fetch = originalFetch;
    });
});

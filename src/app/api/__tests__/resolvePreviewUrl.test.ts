import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockTrackUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        track: {
            findUnique: (...args: any[]) => mockFindUnique(...args),
            update: (...args: any[]) => mockTrackUpdate(...args),
        },
    },
}));

const mockDeezerTrack = vi.fn();
const mockDeezerSearch = vi.fn();

vi.mock("@/lib/deezer", () => ({
    deezer: {
        track: (...args: any[]) => mockDeezerTrack(...args),
        search: {
            track: (...args: any[]) => mockDeezerSearch(...args),
        },
    },
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/resolvePreviewUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("resolvePreviewUrl", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it("returns cached result on second call", async () => {
        vi.resetModules();
        const { POST } = await import("../resolvePreviewUrl/route");

        const track = {
            id: "track-cache",
            artist: "Artist",
            title: "Title",
            deezerTrackId: "123",
        };
        mockFindUnique.mockResolvedValue(track);
        mockDeezerTrack.mockResolvedValue({ preview: "https://cdn.deezer.com/preview.mp3" });

        await POST(makeRequest({ trackId: "track-cache" }));
        expect(mockDeezerTrack).toHaveBeenCalledOnce();

        mockDeezerTrack.mockClear();
        mockFindUnique.mockResolvedValue(track);

        const res2 = await POST(makeRequest({ trackId: "track-cache" }));
        const json2 = await res2.json();

        expect(mockDeezerTrack).not.toHaveBeenCalled();
        expect(json2.previewUrl).toContain("/api/proxyAudio");
    });

    it("returns 404 for missing track", async () => {
        vi.resetModules();
        const { POST } = await import("../resolvePreviewUrl/route");

        mockFindUnique.mockResolvedValue(null);

        const res = await POST(makeRequest({ trackId: "nonexistent" }));
        expect(res.status).toBe(404);
    });

    it("falls through to search when deezer track has no preview", async () => {
        vi.resetModules();
        const { POST } = await import("../resolvePreviewUrl/route");

        const track = {
            id: "track-search",
            artist: "Artist",
            title: "Title",
            deezerTrackId: "123",
        };
        mockFindUnique.mockResolvedValue(track);
        mockDeezerTrack.mockResolvedValue({ preview: "" });
        mockDeezerSearch.mockResolvedValue({
            data: [{ id: 456, preview: "https://cdn.deezer.com/search-preview.mp3" }],
        });

        const res = await POST(makeRequest({ trackId: "track-search" }));
        const json = await res.json();

        expect(mockDeezerSearch).toHaveBeenCalledWith("Artist Title");
        expect(json.previewUrl).toContain("/api/proxyAudio");
    });

    it("caches empty results too", async () => {
        vi.resetModules();
        const { POST } = await import("../resolvePreviewUrl/route");

        const track = {
            id: "track-empty-cache",
            artist: "Artist",
            title: "Title",
            deezerTrackId: "123",
        };
        mockFindUnique.mockResolvedValue(track);
        mockDeezerTrack.mockResolvedValue({ preview: "https://cdn.deezer.com/preview.mp3" });

        // First call populates cache
        await POST(makeRequest({ trackId: "track-empty-cache" }));

        // Second call should skip both Deezer calls
        mockDeezerTrack.mockClear();
        mockDeezerSearch.mockClear();
        mockFindUnique.mockResolvedValue(track);

        await POST(makeRequest({ trackId: "track-empty-cache" }));

        expect(mockDeezerTrack).not.toHaveBeenCalled();
        expect(mockDeezerSearch).not.toHaveBeenCalled();
    });

    it("updates deezerTrackId when discovered via search", async () => {
        vi.resetModules();
        const { POST } = await import("../resolvePreviewUrl/route");

        const track = {
            id: "track-discover",
            artist: "Artist",
            title: "Title",
            deezerTrackId: "old-id",
        };
        mockFindUnique.mockResolvedValue(track);
        mockDeezerTrack.mockResolvedValue({ preview: "" });
        mockDeezerSearch.mockResolvedValue({
            data: [{ id: 999, preview: "https://cdn.deezer.com/new.mp3" }],
        });
        mockTrackUpdate.mockResolvedValue({});

        await POST(makeRequest({ trackId: "track-discover" }));

        expect(mockTrackUpdate).toHaveBeenCalledWith({
            where: { id: "track-discover" },
            data: { deezerTrackId: "999" },
        });
    });
});

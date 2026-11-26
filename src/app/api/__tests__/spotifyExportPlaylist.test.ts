import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQueryRaw = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findFirst: (...args: any[]) => mockFindFirst(...args),
            update: (...args: any[]) => mockUpdate(...args),
        },
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
    },
}));

vi.mock("@/lib/auth", () => ({
    verifyAuth: vi.fn().mockResolvedValue({ uid: "fb-1" }),
    isAuthError: vi.fn().mockReturnValue(false),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeRequest(body: object) {
    return new Request("http://localhost/api/spotify/export-playlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

function mockSpotifyUser() {
    return { id: "spotify-user-1" };
}

function mockPlaylist() {
    return {
        id: "playlist-1",
        external_urls: { spotify: "https://open.spotify.com/playlist/playlist-1" },
    };
}

function setupTokenUser() {
    mockFindFirst.mockResolvedValue({
        id: "user-1",
        spotifyAccessToken: "valid-token",
        spotifyRefreshToken: "refresh-token",
        spotifyTokenExpiresAt: new Date(Date.now() + 3600_000),
    });
}

function setupFetchSequence(responses: Array<{ ok: boolean; json: () => Promise<any> }>) {
    for (const response of responses) {
        mockFetch.mockResolvedValueOnce(response);
    }
}

describe("spotify/export-playlist", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "test-client-id";
        process.env.NEXT_PUBLIC_SPOTIFY_SECRET = "test-secret";
    });

    it("returns 401 when Spotify is not connected", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            spotifyAccessToken: null,
            spotifyRefreshToken: null,
            spotifyTokenExpiresAt: null,
        });

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        expect(res.status).toBe(401);
    });

    it("returns 400 when library is empty", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Library is empty");
    });

    it("creates playlist and adds matched tracks", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([
            { artist: "Artist A", title: "Track A" },
            { artist: "Artist B", title: "Track B" },
        ]);

        setupFetchSequence([
            { ok: true, json: async () => mockSpotifyUser() },
            { ok: true, json: async () => ({ items: [], next: null }) },
            { ok: true, json: async () => mockPlaylist() },
            {
                ok: true,
                json: async () => ({
                    tracks: {
                        items: [{ uri: "spotify:track:aaa" }],
                    },
                }),
            },
            {
                ok: true,
                json: async () => ({
                    tracks: {
                        items: [{ uri: "spotify:track:bbb" }],
                    },
                }),
            },
            { ok: true, json: async () => ({}) },
        ]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.playlistUrl).toBe(
            "https://open.spotify.com/playlist/playlist-1"
        );
        expect(json.totalLibraryTracks).toBe(2);
        expect(json.matchedTracks).toBe(2);
    });

    it("handles partial matches", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([
            { artist: "Artist A", title: "Track A" },
            { artist: "Artist B", title: "Track B" },
        ]);

        setupFetchSequence([
            { ok: true, json: async () => mockSpotifyUser() },
            { ok: true, json: async () => ({ items: [], next: null }) },
            { ok: true, json: async () => mockPlaylist() },
            {
                ok: true,
                json: async () => ({
                    tracks: {
                        items: [{ uri: "spotify:track:aaa" }],
                    },
                }),
            },
            {
                ok: true,
                json: async () => ({
                    tracks: { items: [] },
                }),
            },
            { ok: true, json: async () => ({}) },
        ]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.totalLibraryTracks).toBe(2);
        expect(json.matchedTracks).toBe(1);
    });

    it("reuses existing Phoniquest Library playlist", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([
            { artist: "Artist A", title: "Track A" },
        ]);

        const existingPlaylist = {
            id: "existing-pl",
            name: "Phoniquest Library",
            external_urls: { spotify: "https://open.spotify.com/playlist/existing-pl" },
        };

        setupFetchSequence([
            { ok: true, json: async () => mockSpotifyUser() },
            { ok: true, json: async () => ({ items: [existingPlaylist], next: null }) },
            { ok: true, json: async () => ({}) },
            {
                ok: true,
                json: async () => ({
                    tracks: { items: [{ uri: "spotify:track:aaa" }] },
                }),
            },
            { ok: true, json: async () => ({}) },
        ]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.playlistUrl).toBe(
            "https://open.spotify.com/playlist/existing-pl"
        );
    });

    it("returns 502 when Spotify user profile fails", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([
            { artist: "Artist A", title: "Track A" },
        ]);

        setupFetchSequence([
            { ok: false, json: async () => ({ error: "unauthorized" }) },
        ]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        expect(res.status).toBe(502);
    });

    it("returns 502 when playlist creation fails", async () => {
        vi.resetModules();
        setupTokenUser();
        mockQueryRaw.mockResolvedValue([
            { artist: "Artist A", title: "Track A" },
        ]);

        setupFetchSequence([
            { ok: true, json: async () => mockSpotifyUser() },
            { ok: true, json: async () => ({ items: [], next: null }) },
            { ok: false, json: async () => ({ error: "forbidden" }) },
        ]);

        const { POST } = await import("../spotify/export-playlist/route");
        const res = await POST(makeRequest({ userId: "fb-1" }));
        expect(res.status).toBe(502);
    });
});

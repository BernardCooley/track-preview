import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findFirst: (...args: any[]) => mockFindFirst(...args),
            update: (...args: any[]) => mockUpdate(...args),
        },
    },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeAuthorizeRequest(body: object) {
    return new Request("http://localhost/api/spotify/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

function makeCallbackRequest(body: object) {
    return new Request("http://localhost/api/spotify/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

describe("spotify/authorize", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "test-client-id";
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });

    it("returns 400 when userId is missing", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/authorize/route");
        const res = await POST(makeAuthorizeRequest({}));
        expect(res.status).toBe(400);
    });

    it("returns authorize URL with correct scopes", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/authorize/route");
        const res = await POST(makeAuthorizeRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.url).toContain("https://accounts.spotify.com/authorize");
        expect(json.url).toContain("playlist-modify-public");
        expect(json.url).toContain("playlist-modify-private");
        expect(json.url).toContain("client_id=test-client-id");
        expect(json.url).toContain(
            "redirect_uri=" +
                encodeURIComponent("http://localhost:3000/spotify/callback")
        );
        expect(json.state).toBeTruthy();
    });

    it("embeds userId in state parameter", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/authorize/route");
        const res = await POST(makeAuthorizeRequest({ userId: "fb-1" }));
        const json = await res.json();

        const stateInUrl = new URL(json.url).searchParams.get("state");
        expect(stateInUrl).toContain(":fb-1");
    });
});

describe("spotify/callback", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID = "test-client-id";
        process.env.NEXT_PUBLIC_SPOTIFY_SECRET = "test-secret";
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    });

    it("returns 400 when code is missing", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/callback/route");
        const res = await POST(
            makeCallbackRequest({ state: "abc:fb-1" })
        );
        expect(res.status).toBe(400);
    });

    it("returns 400 when state is missing", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/callback/route");
        const res = await POST(makeCallbackRequest({ code: "auth-code" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when state has no userId", async () => {
        vi.resetModules();
        const { POST } = await import("../spotify/callback/route");
        const res = await POST(
            makeCallbackRequest({ code: "auth-code", state: "abc" })
        );
        expect(res.status).toBe(400);
    });

    it("returns 404 when user not found", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue(null);
        const { POST } = await import("../spotify/callback/route");
        const res = await POST(
            makeCallbackRequest({ code: "auth-code", state: "abc:fb-1" })
        );
        expect(res.status).toBe(404);
    });

    it("exchanges code for tokens and stores them", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            firebaseId: "fb-1",
        });
        mockUpdate.mockResolvedValue({});
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                access_token: "sp-access-token",
                refresh_token: "sp-refresh-token",
                expires_in: 3600,
            }),
        });

        const { POST } = await import("../spotify/callback/route");
        const res = await POST(
            makeCallbackRequest({ code: "auth-code", state: "abc:fb-1" })
        );
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);

        const tokenCall = mockFetch.mock.calls.find(
            (call: any[]) => {
                const arg = call[0];
                if (typeof arg === "string") return arg.includes("accounts.spotify.com");
                if (arg instanceof URL) return arg.toString().includes("accounts.spotify.com");
                if (arg instanceof Request) return arg.url.includes("accounts.spotify.com");
                return false;
            }
        );
        expect(tokenCall).toBeTruthy();

        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: "user-1" },
            data: {
                spotifyAccessToken: "sp-access-token",
                spotifyRefreshToken: "sp-refresh-token",
                spotifyTokenExpiresAt: expect.any(Date),
            },
        });
    });

    it("returns 400 when Spotify token exchange fails", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            firebaseId: "fb-1",
        });
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({
                error: "invalid_grant",
                error_description: "Authorization code expired",
            }),
        });

        const { POST } = await import("../spotify/callback/route");
        const res = await POST(
            makeCallbackRequest({ code: "expired-code", state: "abc:fb-1" })
        );

        expect(res.status).toBe(400);
    });
});

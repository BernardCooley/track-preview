import { describe, it, expect, beforeEach } from "vitest";
import "../../../test/mocks/firebase";
import {
    fetchTracks,
    fetchRelease,
    createUser,
    getUserProfile,
    deleteUserProfile,
    mutateUserProfile,
    updateTrackReviewStep,
    resolvePreviewUrl,
    getTrialLikeCount,
    togglePurchased,
    fetchDiscoveryHistory,
    handleFetchErrors,
    GoneError,
    NotFoundError,
    BadRequestError,
    UnauthorisedError,
} from "../bff";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";

describe("handleFetchErrors", () => {
    it("throws UnauthorisedError for 401", () => {
        expect(() => handleFetchErrors({ status: 401, statusText: "Unauthorized" } as Response))
            .toThrow(UnauthorisedError);
    });

    it("throws BadRequestError for 400", () => {
        expect(() => handleFetchErrors({ status: 400, statusText: "Bad Request" } as Response))
            .toThrow(BadRequestError);
    });

    it("throws NotFoundError for 404", () => {
        expect(() => handleFetchErrors({ status: 404, statusText: "Not Found" } as Response))
            .toThrow(NotFoundError);
    });

    it("throws GoneError for 410", () => {
        expect(() => handleFetchErrors({ status: 410, statusText: "Gone" } as Response))
            .toThrow(GoneError);
    });

    it("does not throw for other status codes", () => {
        expect(() => handleFetchErrors({ status: 500, statusText: "Server Error" } as Response))
            .not.toThrow();
    });
});

describe("createUser", () => {
    it("sends userId and returns user", async () => {
        const result = await createUser({ userId: "user-1" });
        expect(result).toMatchObject({ id: "user-1", firebaseId: "user-1" });
    });

    it("sends isAnonymous flag", async () => {
        const result = await createUser({ userId: "user-2", isAnonymous: true });
        expect(result).toMatchObject({ id: "user-2", isAnonymous: true });
    });
});

describe("getUserProfile", () => {
    it("returns user profile", async () => {
        const result = await getUserProfile({ userId: "user-1" });
        expect(result).toMatchObject({ id: "user-1" });
    });

    it("returns null on 404", async () => {
        server.use(
            http.post("/api/getUserProfile", () => {
                return HttpResponse.json({ error: "Not found" }, { status: 404 });
            })
        );

        await expect(getUserProfile({ userId: "nonexistent" })).rejects.toThrow(NotFoundError);
    });
});

describe("deleteUserProfile", () => {
    it("returns deleted user", async () => {
        const result = await deleteUserProfile({ userId: "user-1" });
        expect(result).toMatchObject({ id: "user-1" });
    });
});

describe("mutateUserProfile", () => {
    it("sends update data and returns result", async () => {
        const result = await mutateUserProfile({
            userId: "user-1",
            autoplay: true,
            genres: ["techno"],
        });
        expect(result).toMatchObject({ userId: "user-1", autoplay: true, genres: ["techno"] });
    });
});

describe("fetchTracks", () => {
    it("returns empty array from default handler", async () => {
        const result = await fetchTracks({ userId: "user-1" });
        expect(result).toEqual([]);
    });

    it("returns tracks when handler provides them", async () => {
        const mockTracks = [
            { id: "track-1", title: "Test Track", artist: "Test Artist" },
        ];
        server.use(
            http.post("/api/getTracks", () => {
                return HttpResponse.json(mockTracks);
            })
        );

        const result = await fetchTracks({ userId: "user-1" });
        expect(result).toEqual(mockTracks);
    });
});

describe("fetchRelease", () => {
    it("returns tracks for a release", async () => {
        const mockTracks = [{ id: "t1", title: "Track 1" }];
        server.use(
            http.post("/api/getRelease", () => {
                return HttpResponse.json(mockTracks);
            })
        );

        const result = await fetchRelease({ releaseTitle: "Test Album", releaseDate: "2024-01-01" });
        expect(result).toEqual(mockTracks);
    });
});

describe("updateTrackReviewStep", () => {
    it("sends like/dislike data", async () => {
        const result = await updateTrackReviewStep({
            trackId: "track-1",
            like: true,
            reviewStep: 1,
            userId: "user-1",
        });
        expect(result).toEqual([]);
    });
});

describe("resolvePreviewUrl", () => {
    it("returns preview URL", async () => {
        server.use(
            http.post("/api/resolvePreviewUrl", () => {
                return HttpResponse.json({ previewUrl: "https://example.com/preview.mp3" });
            })
        );

        const result = await resolvePreviewUrl("track-1");
        expect(result).toBe("https://example.com/preview.mp3");
    });

    it("returns empty string on failure", async () => {
        server.use(
            http.post("/api/resolvePreviewUrl", () => {
                return HttpResponse.json({ error: "Failed" }, { status: 500 });
            })
        );

        const result = await resolvePreviewUrl("track-1");
        expect(result).toBe("");
    });
});

describe("getTrialLikeCount", () => {
    it("returns count", async () => {
        server.use(
            http.post("/api/getTrialLikeCount", () => {
                return HttpResponse.json({ count: 15 });
            })
        );

        const result = await getTrialLikeCount({ userId: "user-1" });
        expect(result).toBe(15);
    });

    it("returns 0 on error", async () => {
        server.use(
            http.post("/api/getTrialLikeCount", () => {
                return HttpResponse.json({ error: "Failed" }, { status: 500 });
            })
        );

        const result = await getTrialLikeCount({ userId: "user-1" });
        expect(result).toBe(0);
    });
});

describe("fetchDiscoveryHistory", () => {
    it("returns empty array from default handler", async () => {
        const result = await fetchDiscoveryHistory({ userId: "user-1", limit: 50, offset: 0 });
        expect(result).toEqual([]);
    });

    it("returns tracks when handler provides them", async () => {
        const mockTracks = [
            { id: "t1", title: "Test Track", artist: "Test Artist", currentReviewStep: 4, reviewedAt: "2026-01-01" },
        ];
        server.use(
            http.post("/api/getDiscoveryHistory", () => {
                return HttpResponse.json(mockTracks);
            })
        );

        const result = await fetchDiscoveryHistory({ userId: "user-1", limit: 50, offset: 0 });
        expect(result).toEqual(mockTracks);
    });

    it("passes search and status params", async () => {
        let apiBody: any = null;
        server.use(
            http.post("/api/getDiscoveryHistory", async ({ request }) => {
                apiBody = await request.json();
                return HttpResponse.json([]);
            })
        );

        await fetchDiscoveryHistory({ userId: "user-1", limit: 20, offset: 10, search: "techno", status: 0 });

        expect(apiBody).toEqual({
            userId: "user-1",
            limit: 20,
            offset: 10,
            search: "techno",
            status: 0,
        });
    });
});

describe("togglePurchased", () => {
    it("sends trackId, userId and purchased flag", async () => {
        let apiBody: any = null;
        server.use(
            http.post("/api/togglePurchased", async ({ request }) => {
                apiBody = await request.json();
                return HttpResponse.json({ success: true });
            })
        );

        const result = await togglePurchased({
            trackId: "track-1",
            userId: "user-1",
            purchased: true,
        });

        expect(apiBody).toEqual({ trackId: "track-1", userId: "user-1", purchased: true });
        expect(result).toEqual({ success: true });
    });

    it("sends purchased false to unmark", async () => {
        let apiBody: any = null;
        server.use(
            http.post("/api/togglePurchased", async ({ request }) => {
                apiBody = await request.json();
                return HttpResponse.json({ success: true });
            })
        );

        await togglePurchased({
            trackId: "track-1",
            userId: "user-1",
            purchased: false,
        });

        expect(apiBody).toEqual({ trackId: "track-1", userId: "user-1", purchased: false });
    });

    it("throws on server error", async () => {
        server.use(
            http.post("/api/togglePurchased", () => {
                return HttpResponse.json({ error: "Failed" }, { status: 404 });
            })
        );

        await expect(
            togglePurchased({ trackId: "track-1", userId: "user-1", purchased: true })
        ).rejects.toThrow();
    });
});

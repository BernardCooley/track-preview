import { http, HttpResponse } from "msw";

export const handlers = [
    http.post("/api/createUser", async ({ request }) => {
        const body = (await request.json()) as { userId: string; isAnonymous?: boolean };
        return HttpResponse.json({
            id: body.userId,
            firebaseId: body.userId,
            isAnonymous: body.isAnonymous ?? false,
            autoplay: false,
            curatedMode: false,
            genres: ["all"],
            yearFrom: 1960,
            yearTo: 2026,
            lastActiveAt: new Date().toISOString(),
        });
    }),

    http.post("/api/getUserProfile", async ({ request }) => {
        const body = (await request.json()) as { userId: string };
        return HttpResponse.json({
            id: body.userId,
            firebaseId: body.userId,
            isAnonymous: false,
            autoplay: false,
            curatedMode: false,
            genres: ["all"],
            yearFrom: 1960,
            yearTo: 2026,
            lastActiveAt: new Date().toISOString(),
        });
    }),

    http.post("/api/mutateUserProfile", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body);
    }),

    http.post("/api/deleteUserProfile", async ({ request }) => {
        const body = (await request.json()) as { userId: string };
        return HttpResponse.json({ id: body.userId });
    }),

    http.post("/api/getTracks", () => {
        return HttpResponse.json([]);
    }),

    http.post("/api/updateTrackReviewStep", () => {
        return HttpResponse.json([]);
    }),

    http.post("/api/getRelease", () => {
        return HttpResponse.json([]);
    }),

    http.post("/api/resolvePreviewUrl", () => {
        return HttpResponse.json({ previewUrl: "" });
    }),

    http.post("/api/getTrialLikeCount", () => {
        return HttpResponse.json({ count: 0 });
    }),

    http.post("/api/getSpotifyTrack", () => {
        return HttpResponse.json(null);
    }),

    http.post("/api/getDeezerTrack", () => {
        return HttpResponse.json(null);
    }),

    http.post("/api/getITunesTracks", () => {
        return HttpResponse.json(null);
    }),

    http.post("/api/togglePurchased", () => {
        return HttpResponse.json({ success: true });
    }),

    http.post("/api/getDiscoveryHistory", () => {
        return HttpResponse.json([]);
    }),

    http.get("/api/getSpotifyAccessToken", () => {
        return HttpResponse.json({ access_token: "mock-token", expires_in: 3600, token_type: "Bearer" });
    }),
];

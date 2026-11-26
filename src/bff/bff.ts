import { User } from "@prisma/client";
import { AccessToken, DiscoveryHistoryTrack, Review, SearchedTrack, Track } from "../../types";
import { getCurrentYear } from "../../utils";
import { auth } from "../../firebase/firebaseInit";

async function getAuthHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) return {};
    try {
        const token = await user.getIdToken();
        return { Authorization: `Bearer ${token}` };
    } catch {
        return {};
    }
}

export class GoneError extends Error {
    statusCode = 410;
}
export class NotFoundError extends Error {
    statusCode = 404;
}
export class BadRequestError extends Error {
    statusCode = 400;
}
export class UnauthorisedError extends Error {
    statusCode = 401;
}
export class InternalError extends Error {
    statusCode = 500;
}

export const handleFetchErrors = (response: Response) => {
    switch (response.status) {
        case 401:
            throw new UnauthorisedError(response.statusText);
        case 400:
            throw new BadRequestError(response.statusText);
        case 404:
            throw new NotFoundError(response.statusText);
        case 410:
            throw new GoneError(response.statusText);
        default:
            null;
    }
};

export const fetchWithErrorHandling = async <T>(
    endpoint: RequestInfo,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    body?: any
) => {
    try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                ...authHeaders,
            },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            return (await res.json()) as T;
        }
        handleFetchErrors(res);
    } catch (e) {
        throw e;
    }
    return null;
};

interface FetchSpotifyTrackProps {
    trackToSearch: {
        artist: string;
        title: string;
    };
    releaseYear: number;
}

export const fetchSpotifyTrack = async ({
    trackToSearch,
    releaseYear,
}: FetchSpotifyTrackProps): Promise<SearchedTrack | null> => {
    try {
        const spotifyTrack: SearchedTrack | null = await fetchWithErrorHandling(
            "/api/getSpotifyTrack",
            "POST",
            {
                trackToSearch,
                releaseYear,
            }
        );
        return spotifyTrack;
    } catch (error) {
        throw error;
    }
};

interface FetchDeezerTrackProps {
    trackToSearch: string;
    releaseYear: number;
}

export const fetchDeezerTrack = async ({
    trackToSearch,
    releaseYear,
}: FetchDeezerTrackProps): Promise<SearchedTrack | null> => {
    try {
        const deezerTrack: SearchedTrack | null = await fetchWithErrorHandling(
            "/api/getDeezerTrack",
            "POST",
            {
                trackToSearch,
                releaseYear,
            }
        );
        return deezerTrack;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

interface FetchITunesTracksProps {
    trackToSearch: string;
    releaseYear: number;
}

export const fetchITunesTrack = async ({
    trackToSearch,
    releaseYear,
}: FetchITunesTracksProps): Promise<SearchedTrack | null> => {
    try {
        const iTinesTrack: SearchedTrack | null = await fetchWithErrorHandling(
            "/api/getITunesTracks",
            "POST",
            {
                trackToSearch,
                releaseYear,
            }
        );
        return iTinesTrack;
    } catch (error) {
        throw error;
    }
};

export const getSpotifyAccessToken = async (): Promise<AccessToken | null> => {
    const token: AccessToken | null = await fetchWithErrorHandling(
        "/api/getSpotifyAccessToken",
        "GET"
    );
    return token;
};

export const uploadTracks = async (): Promise<any[] | null> => {
    const tracksUploaded: any[] | null = await fetchWithErrorHandling(
        "/api/uploadTracks",
        "GET"
    );
    return tracksUploaded;
};

export const restoreDatabase = async () => {
    await fetchWithErrorHandling("/api/restoreDatabase", "GET");
};

interface UpdateTrackReviewStepProps {
    trackId: string;
    like: boolean;
    reviewStep: number;
    userId: string;
    curatedMode?: boolean;
}

export const updateTrackReviewStep = async ({
    trackId,
    like,
    reviewStep,
    userId,
    curatedMode,
}: UpdateTrackReviewStepProps): Promise<Review[] | null> => {
    const userTracks: any[] | null = await fetchWithErrorHandling(
        "/api/updateTrackReviewStep",
        "POST",
        {
            trackId,
            like,
            reviewStep,
            userId,
            curatedMode,
        }
    );
    return userTracks;
};

interface SendToLibraryProps {
    trackId: string;
    userId: string;
}

export const sendToLibrary = async ({
    trackId,
    userId,
}: SendToLibraryProps): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling("/api/sendToLibrary", "POST", {
        trackId,
        userId,
    });
};

interface TogglePurchasedProps {
    trackId: string;
    userId: string;
    purchased: boolean;
}

export const togglePurchased = async ({
    trackId,
    userId,
    purchased,
}: TogglePurchasedProps): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling("/api/togglePurchased", "POST", {
        trackId,
        userId,
        purchased,
    });
};

interface UpdateReviewNotesProps {
    trackId: string;
    userId: string;
    notes: string | null;
}

export const updateReviewNotes = async ({
    trackId,
    userId,
    notes,
}: UpdateReviewNotesProps): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling("/api/updateReviewNotes", "POST", {
        trackId,
        userId,
        notes,
    });
};

interface CreateUserProps {
    userId: string;
}

export const createUser = async ({ userId }: CreateUserProps): Promise<any> => {
    const user: any = await fetchWithErrorHandling("/api/createUser", "POST", {
        userId,
    });

    return user;
};

interface UpdateUserAutoplayProps {
    userId: string;
    autoplay?: boolean;
    curatedMode?: boolean;
    swipeMode?: boolean;
    genres?: string[];
    genreAlerts?: string[];
    genreAlertFrequency?: string;
    genreEmailsEnabled?: boolean;
    email?: string;
    yearFrom?: number;
    yearTo?: number;
}

export const mutateUserProfile = async ({
    userId,
    autoplay,
    curatedMode,
    swipeMode,
    genres,
    genreAlerts,
    genreAlertFrequency,
    genreEmailsEnabled,
    email,
    yearFrom,
    yearTo,
}: UpdateUserAutoplayProps): Promise<User> => {
    try {
        const user = await fetchWithErrorHandling(
            "/api/mutateUserProfile",
            "POST",
            {
                userId,
                autoplay,
                curatedMode,
                swipeMode,
                genres,
                genreAlerts,
                genreAlertFrequency,
                genreEmailsEnabled,
                email,
                yearFrom,
                yearTo,
            }
        );

        return user as User;
    } catch (error) {
        throw error;
    }
};

interface GetUserProps {
    userId: string;
}

export const getUserProfile = async ({
    userId,
}: GetUserProps): Promise<User | null> => {
    try {
        const user = await fetchWithErrorHandling(
            "/api/getUserProfile",
            "POST",
            {
                userId,
            }
        );

        return user as User;
    } catch (error) {
        throw error;
    }
};

interface DeleteUserProps {
    userId: string;
}

export const deleteUserProfile = async ({
    userId,
}: DeleteUserProps): Promise<User | null> => {
    try {
        const user = await fetchWithErrorHandling(
            "/api/deleteUserProfile",
            "POST",
            {
                userId,
            }
        );

        return user as User;
    } catch (error) {
        throw error;
    }
};


export const resolvePreviewUrl = async (
    trackId: string
): Promise<string> => {
    try {
        const result = await fetchWithErrorHandling<{ previewUrl: string }>(
            "/api/resolvePreviewUrl",
            "POST",
            { trackId }
        );
        return result?.previewUrl || "";
    } catch (error) {
        console.error("Failed to resolve preview URL:", error);
        return "";
    }
};

export const sendVerificationEmail = async (email: string): Promise<void> => {
    await fetchWithErrorHandling("/api/sendVerificationEmail", "POST", {
        email,
    });
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
    await fetchWithErrorHandling("/api/sendPasswordResetEmail", "POST", {
        email,
    });
};

interface GetTracksProps {
    genres?: string[];
    startYear?: number;
    endYear?: number;
    userId: string;
    limit?: number | null;
    reviewStep?: number;
}

export const fetchTracks = async ({
    genres = ["all"],
    startYear = 1960,
    endYear = getCurrentYear(),
    userId,
    limit,
    reviewStep = 1,
}: GetTracksProps): Promise<Track[] | null> => {
    try {
        const tracks = await fetchWithErrorHandling("/api/getTracks", "POST", {
            genres,
            startYear,
            endYear,
            userId,
            limit,
            reviewStep,
        });
        return tracks as Track[];
    } catch (error) {
        throw error;
    }
};

interface GetReleaseProps {
    releaseTitle: string;
    releaseDate: string;
}

export const fetchRelease = async ({
    releaseTitle,
    releaseDate,
}: GetReleaseProps): Promise<Track[] | null> => {
    try {
        const tracks = await fetchWithErrorHandling("/api/getRelease", "POST", {
            releaseTitle,
            releaseDate,
        });
        return tracks as Track[];
    } catch (error) {
        throw error;
    }
};

export const createCheckoutSession = async ({
    userId,
}: {
    userId: string;
}): Promise<{ url: string } | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/create-checkout-session",
        "POST",
        { userId }
    );
};

export const createPortalSession = async ({
    userId,
}: {
    userId: string;
}): Promise<{ url: string } | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/create-portal-session",
        "POST",
        { userId }
    );
};

export const verifyCheckout = async ({
    sessionId,
}: {
    sessionId: string;
}): Promise<{ status: string; tier: string } | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/verify-checkout",
        "POST",
        { sessionId }
    );
};

export const requestRefund = async ({
    userId,
}: {
    userId: string;
}): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/request-refund",
        "POST",
        { userId }
    );
};

export const syncSubscription = async ({
    userId,
}: {
    userId: string;
}): Promise<{ status: string; tier: string } | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/sync-subscription",
        "POST",
        { userId }
    );
};

export const getProPrice = async (): Promise<{
    formatted: string;
    interval: string;
} | null> => {
    return await fetchWithErrorHandling(
        "/api/stripe/get-price",
        "GET"
    );
};

export const spotifyAuthorize = async ({
    userId,
}: {
    userId: string;
}): Promise<{ url: string; state: string } | null> => {
    return await fetchWithErrorHandling(
        "/api/spotify/authorize",
        "POST",
        { userId }
    );
};

export const spotifyExportPlaylist = async ({
    userId,
    playlistId,
    playlistName,
}: {
    userId: string;
    playlistId?: string;
    playlistName?: string;
}): Promise<{
    playlistUrl: string;
    totalLibraryTracks: number;
    matchedTracks: number;
} | null> => {
    return await fetchWithErrorHandling(
        "/api/spotify/export-playlist",
        "POST",
        { userId, playlistId, playlistName }
    );
};

export const spotifyPlaylists = async ({
    userId,
}: {
    userId: string;
}): Promise<{ playlists: { id: string; name: string }[] } | null> => {
    return await fetchWithErrorHandling(
        "/api/spotify/playlists",
        "POST",
        { userId }
    );
};

export const spotifyCallback = async ({
    code,
    state,
}: {
    code: string;
    state: string;
}): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling(
        "/api/spotify/callback",
        "POST",
        { code, state }
    );
};

interface FetchDiscoveryHistoryProps {
    userId: string;
    limit?: number;
    offset?: number;
    search?: string;
    status?: number;
}

export const fetchDiscoveryHistory = async ({
    userId,
    limit,
    offset,
    search,
    status,
}: FetchDiscoveryHistoryProps): Promise<DiscoveryHistoryTrack[] | null> => {
    return await fetchWithErrorHandling("/api/getDiscoveryHistory", "POST", {
        userId,
        limit,
        offset,
        search,
        status,
    });
};

export const dismissUpgradePrompt = async ({
    userId,
    reset,
    date,
}: {
    userId: string;
    reset?: boolean;
    date?: string;
}): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling(
        "/api/dismissUpgradePrompt",
        "POST",
        { userId, reset, date }
    );
};

export const spotifyDisconnect = async ({
    userId,
}: {
    userId: string;
}): Promise<{ success: boolean } | null> => {
    return await fetchWithErrorHandling(
        "/api/spotify/disconnect",
        "POST",
        { userId }
    );
};

interface FetchNewTracksProps {
    genres: string[];
    userId: string;
    releasedAfter: string;
}

export const fetchNewTracks = async ({
    genres,
    userId,
    releasedAfter,
}: FetchNewTracksProps): Promise<Track[] | null> => {
    try {
        const tracks = await fetchWithErrorHandling("/api/getNewTracks", "POST", {
            genres,
            userId,
            releasedAfter,
        });
        return tracks as Track[];
    } catch (error) {
        throw error;
    }
};

export interface LibraryStats {
    totalTracks: number;
    purchasedTracks: number;
    totalReviewed: number;
    genreBreakdown: { genre: string; count: number }[];
    decadeDistribution: { decade: number; count: number }[];
    topArtists: { artist: string; count: number }[];
    topReleases: { releaseTitle: string; artist: string; count: number }[];
}

export const fetchLibraryStats = async ({
    userId,
}: {
    userId: string;
}): Promise<LibraryStats | null> => {
    return await fetchWithErrorHandling<LibraryStats>(
        "/api/getLibraryStats",
        "POST",
        { userId }
    );
};

export const exportLibrary = async ({
    userId,
    format,
}: {
    userId: string;
    format: "csv" | "json";
}): Promise<Blob> => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/exportLibrary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ userId, format }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
    }
    return res.blob();
};
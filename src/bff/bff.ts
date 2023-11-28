import { StoredTrack, User } from "@prisma/client";
import { AccessToken, SearchedTrack, Track } from "../../types";

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
        const res = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
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

export const scrapeJuno = async (): Promise<any[] | null> => {
    const scrapedData: any[] | null = await fetchWithErrorHandling(
        "/api/scrapeJuno",
        "GET"
    );
    return scrapedData;
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

interface FetchStoredTracksProps {
    genre: string;
    startYear: number;
    endYear: number;
    userId: string;
}

export const fetchStoredTracks = async ({
    genre,
    startYear,
    endYear,
    userId,
}: FetchStoredTracksProps): Promise<StoredTrack[]> => {
    try {
        const userTracks = await fetchWithErrorHandling(
            "/api/getStoredTracks",
            "POST",
            {
                genre,
                startYear,
                endYear,
                userId,
            }
        );
        return userTracks as StoredTrack[];
    } catch (error) {
        throw error;
    }
};

interface FetchUserTracksProps {
    genre: string;
    userId: string;
    reviewStep: number;
}

export const fetchUserTracks = async ({
    genre,
    userId,
    reviewStep,
}: FetchUserTracksProps): Promise<Track[]> => {
    try {
        const userTracks = await fetchWithErrorHandling(
            "/api/getUserTracks",
            "POST",
            {
                genre,
                userId,
                reviewStep,
            }
        );
        return userTracks as Track[];
    } catch (error) {
        throw error;
    }
};

interface SaveNewTrackProps {
    id: string;
    genre: string;
    userId: string;
    artist: string;
    title: string;
    currentReviewStep: number;
    furthestReviewStep: number;
    purchaseUrl: string;
    searchedTrack: SearchedTrack;
}

export const saveNewTrack = async ({
    id,
    genre,
    userId,
    artist,
    title,
    currentReviewStep,
    furthestReviewStep,
    purchaseUrl,
    searchedTrack,
}: SaveNewTrackProps): Promise<Track[] | null> => {
    const userTracks: any[] | null = await fetchWithErrorHandling(
        "/api/saveNewTrack",
        "POST",
        {
            id,
            genre,
            userId,
            artist,
            title,
            currentReviewStep,
            furthestReviewStep,
            purchaseUrl,
            searchedTrack,
        }
    );
    return userTracks;
};

interface UpdateTrackReviewStepProps {
    id: string;
    like: boolean;
    reviewStep: number;
}

export const updateTrackReviewStep = async ({
    id,
    like,
    reviewStep,
}: UpdateTrackReviewStepProps): Promise<Track[] | null> => {
    const userTracks: any[] | null = await fetchWithErrorHandling(
        "/api/updateTrackReviewStep",
        "POST",
        {
            id,
            like,
            reviewStep,
        }
    );
    return userTracks;
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

interface DeleteStoredTrackProps {
    id: string;
}

export const deleteStoredTrack = async ({ id }: DeleteStoredTrackProps) => {
    await fetchWithErrorHandling("/api/deleteStoredTrack", "POST", { id });
};

interface UpdateUserAutoplayProps {
    userId: string;
    autoplay: boolean;
}

export const updateUserAutoplay = async ({
    userId,
    autoplay,
}: UpdateUserAutoplayProps): Promise<User | null> => {
    try {
        const user = await fetchWithErrorHandling(
            "/api/updateUserAutoplay",
            "POST",
            {
                userId,
                autoplay: autoplay,
            }
        );

        return user as User;
    } catch (error) {
        throw error;
    }
};

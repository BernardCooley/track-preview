import { Comment, User } from "@prisma/client";
import { AccessToken, Review, SearchedTrack, Track } from "../../types";
import { getCurrentYear } from "../../utils";

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

interface UpdateTrackReviewStepProps {
    trackId: string;
    like: boolean;
    reviewStep: number;
    userId: string;
}

export const updateTrackReviewStep = async ({
    trackId,
    like,
    reviewStep,
    userId,
}: UpdateTrackReviewStepProps): Promise<Review[] | null> => {
    const userTracks: any[] | null = await fetchWithErrorHandling(
        "/api/updateTrackReviewStep",
        "POST",
        {
            trackId,
            like,
            reviewStep,
            userId,
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
    autoplay?: boolean;
    genre?: string;
    yearFrom?: number;
    yearTo?: number;
}

export const mutateUserProfile = async ({
    userId,
    autoplay,
    genre,
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
                genre,
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

interface AddCommentProps {
    name: string;
    userId: string;
    comment: string;
    email: string;
}

export const addComment = async ({
    name,
    userId,
    comment,
    email,
}: AddCommentProps) => {
    try {
        await fetchWithErrorHandling("/api/addComment", "POST", {
            name,
            userId,
            comment,
            email,
        });
    } catch (error) {
        throw error;
    }
};

export const getComments = async (): Promise<Comment[] | null> => {
    try {
        const comments = await fetchWithErrorHandling(
            "/api/getComments",
            "POST"
        );
        return comments as Comment[];
    } catch (error) {
        throw error;
    }
};

interface DeleteCommentProps {
    id: string;
}

export const deleteComment = async ({ id }: DeleteCommentProps) => {
    try {
        await fetchWithErrorHandling("/api/deleteComment", "POST", { id });
    } catch (error) {
        throw error;
    }
};

interface UpdateCommentProps {
    id: string;
    replied: boolean;
}

export const updateCommentReplied = async ({
    id,
    replied,
}: UpdateCommentProps) => {
    try {
        await fetchWithErrorHandling("/api/updateCommentReplied", "POST", {
            id,
            replied,
        });
    } catch (error) {
        throw error;
    }
};

interface GetTracksProps {
    genre?: string;
    startYear?: number;
    endYear?: number;
    userId: string;
    limit?: number;
    reviewStep?: number;
}

export const fetchTracks = async ({
    genre = "all",
    startYear = 1960,
    endYear = getCurrentYear(),
    userId,
    limit = 1,
    reviewStep = 1,
}: GetTracksProps): Promise<Track[] | null> => {
    try {
        const tracks = await fetchWithErrorHandling("/api/getTracks", "POST", {
            genre,
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

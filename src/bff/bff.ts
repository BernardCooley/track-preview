import { AccessToken, SearchedTrack } from "../../types";

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
}

export const fetchSpotifyTrack = async ({
    trackToSearch,
}: FetchSpotifyTrackProps): Promise<SearchedTrack | null> => {
    const spotifyTrack: SearchedTrack | null = await fetchWithErrorHandling(
        "/api/getSpotifyTrack",
        "POST",
        {
            trackToSearch,
        }
    );
    return spotifyTrack;
};

interface FetchDeezerTrackProps {
    trackToSearch: string;
}

export const fetchDeezerTrack = async ({
    trackToSearch,
}: FetchDeezerTrackProps): Promise<SearchedTrack | null> => {
    const deezerTrack: SearchedTrack | null = await fetchWithErrorHandling(
        "/api/getDeezerTrack",
        "POST",
        {
            trackToSearch: trackToSearch,
        }
    );
    return deezerTrack;
};

interface FetchITunesTracksProps {
    trackToSearch: string;
}

export const fetchITunesTrack = async ({
    trackToSearch,
}: FetchITunesTracksProps): Promise<SearchedTrack | null> => {
    const iTinesTrack: SearchedTrack | null = await fetchWithErrorHandling(
        "/api/getITunesTracks",
        "POST",
        {
            trackToSearch,
        }
    );
    return iTinesTrack;
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

export const searchSpotify = async (
    token: AccessToken
): Promise<any[] | null> => {
    const tracks: any[] | null = await fetchWithErrorHandling(
        "/api/searchSpotify",
        "POST",
        {
            token,
        }
    );
    return tracks;
};

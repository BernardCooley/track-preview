import { ITrack, ReleaseTrack } from "../../types";

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

export const fetchWithErrorHandlingWithAuth = async <T>(
    endpoint: RequestInfo,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    body?: any
) => {
    try {
        const res = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Discogs key=YZnWZvvioyaRkOAuzkPU, secret=uhzfcvYWQRUAJUKFgwfqGvONiJglYTnq",
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

interface FetchDiscogsReleaseIdsProps {
    selectedGenre: string;
    pageNumber: number;
}

export const fetchDiscogsReleaseIds = async ({
    selectedGenre,
    pageNumber,
}: FetchDiscogsReleaseIdsProps): Promise<number[] | null> => {
    const releaseIds: number[] | null = await fetchWithErrorHandling(
        "/api/getDiscogsReleaseIds",
        "POST",
        {
            selectedGenre: selectedGenre,
            pageNumber: pageNumber,
        }
    );
    return releaseIds;
};

interface FetchDiscogsReleaseTracksProps {
    releaseId: number;
}

export const fetchDiscogsReleaseTracks = async ({
    releaseId,
}: FetchDiscogsReleaseTracksProps): Promise<ReleaseTrack[] | null> => {
    const releaseTracks: ReleaseTrack[] | null = await fetchWithErrorHandling(
        "/api/getDiscogsReleaseTracks",
        "POST",
        {
            releaseId: releaseId,
        }
    );
    return releaseTracks;
};

interface FetchSpotifyTrackProps {
    trackToSearch: ReleaseTrack;
    genre: string;
    discogsReleaseId: number;
}

export const fetchSpotifyTrack = async ({
    trackToSearch,
    genre,
    discogsReleaseId,
}: FetchSpotifyTrackProps): Promise<ITrack | null> => {
    const spotifyTrack: ITrack | null = await fetchWithErrorHandling(
        "/api/getSpotifyTrack",
        "POST",
        {
            trackToSearch: trackToSearch,
            genre: genre,
            discogsReleaseId: discogsReleaseId,
        }
    );
    return spotifyTrack;
};

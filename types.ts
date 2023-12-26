export interface SearchedTrack {
    artist: string;
    title: string;
    previewUrl: string;
    id: string;
    thumbnail: string;
    url: string;
    releaseYear: number;
}

export interface Track {
    genre: string;
    purchaseUrl: string;
    artist: string;
    title: string;
    previewUrl: string;
    id: string;
    thumbnail: string;
    url: string;
    releaseYear: number;
    slug: string;
    releaseTitle: string;
    platform: string;
    platformId: string;
    releaseDate: string;
}

export interface Review {
    currentReviewStep: number;
    furthestReviewStep: number;
    id: string;
    userId: string;
    userTrack: Track;
}

export interface User {
    uid: string;
    email: string;
}

export interface AccessToken {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface YearRange {
    from: number;
    to: number;
}

export interface ReviewTracks {
    [key: number]: Track[];
}
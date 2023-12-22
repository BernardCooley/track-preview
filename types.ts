export interface SearchedTrack {
    artist: string;
    title: string;
    previewUrl: string;
    id: string;
    thumbnail: string;
    url: string;
    releaseYear: number;
}
export interface UserTrack {
    artist: string;
    genre: string;
    searchedTrack: SearchedTrack;
    title: string;
    id: string;
    purchaseUrl: string;
}

export interface Review {
    currentReviewStep: number;
    furthestReviewStep: number;
    id: string;
    userId: string;
    userTrack: UserTrack;
}

export interface StoredTrack {
    platform: string;
    purchaseUrl: string;
    artist: string;
    releaseTitle: string;
    genre: string;
    title: string;
    releaseDate: string;
    id: string;
    releaseYear: number;
    slug: string;
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
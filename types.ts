export interface SearchedTrack {
    artist: string;
    title: string;
    previewUrl: string;
    id: number;
    thumbnail: string;
    url: string;
}
export interface Track {
    artist: string;
    furthestReviewStep: number;
    currentReviewStep: number;
    genre: string;
    searchedTrack: SearchedTrack;
    title: string;
    userId: string;
    id: string;
    purchaseUrl: string;
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
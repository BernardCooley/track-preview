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

export interface ListenedTrack {
    artist: string;
    genre: string;
    searchedTrack: SearchedTrack;
    title: string;
    id: string;
    purchaseUrl: string;
    userIds: string[];
    reviewSteps: {
        userId: string;
        furthestReviewStep: number;
        currentReviewStep: number;
    }[];
}

export interface StoredTrack {
    artist: string;
    genre: string;
    id: string;
    platform: string;
    purchaseUrl: string;
    releaseDate: {
        year: number;
        month: number;
        day: number;
    };
    releaseTitle: string;
    releaseYear: number;
    title: string;
}

export interface User {
    uid: string;
    email: string;
}
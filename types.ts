export interface SearchedTrack {
    artist: string;
    title: string;
    previewUrl: string;
    id: string;
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

export interface ScrapeTrack {
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
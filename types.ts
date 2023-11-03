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
    storedTrackId: string;
    purchaseUrl: string;
}

export interface User {
    uid: string;
    email: string;
}

export interface ScrapeTrack {
    purchaseUrl: string;
    artist: string;
    title: string;
    platform: string;
    releaseTitle: string;
    genre: string;
    releaseDate: {
        year: number;
        month: number;
        day: number;
    };
    id: string;
}
